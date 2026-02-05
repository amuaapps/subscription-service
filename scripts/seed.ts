// scripts/seed.ts
// Payload CMS v3 seed script: 50 users + subscriptions + child records
//
// - Creates 50 users with real UUIDs
// - Creates subscriptions per user with a mix of statuses and date combinations
// - ~70% of subscriptions are Child Sponsorship (productId fixed below) and get child records
// - Remaining subscriptions are Real Impact Partner (productId fixed below) and get no children
// - Uses createdByTestRunId for idempotency (deletes + recreates)
//
// Run (example):
//   pnpm tsx scripts/seed.ts
// or
//   npx tsx scripts/seed.ts

import 'dotenv/config';
import payload from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// ---- CONFIG ----
const SEED_TAG = 'seed-v50';

const PRODUCT_CHILD_SPONSORSHIP = '61fccf5f-2ac8-4128-b904-4dc7c3d8d2d3';
const PRODUCT_RIP = '9b7eedcc-bbbf-41d9-b2da-771bf5e7bfdb';

type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
type ChildStatus = 'active' | 'paused' | 'replacing' | 'replaced' | 'cancelled' | 'dropped';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- HELPERS ----
function uuid(): string {
  // Node 18+ supports crypto.randomUUID()
  return crypto.randomUUID();
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function chance(p: number): boolean {
  return Math.random() < p;
}

function dateDaysFromNow(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function toISODateOnly(d: Date): Date {
  // Payload stores Date objects; keeping time normalized helps repeatability.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function makeChildId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const part1 = Array.from({ length: 3 }, () => letters[randInt(0, 25)]).join('');
  const part2 = String(randInt(0, 999999)).padStart(6, '0');
  const part3 = String(randInt(0, 9999)).padStart(4, '0');
  return `${part1}-${part2}-${part3}`;
}

function makeStartEndForSubscription(status: SubscriptionStatus): { startDate: Date; endDate?: Date } {
  // start date somewhere in the past 0..365 days
  const start = toISODateOnly(dateDaysFromNow(-randInt(0, 365)));

  // endDate rules:
  // - cancelled: usually has endDate after start
  // - active/paused: mostly no endDate, but include some with endDate to cover combos
  if (status === 'cancelled') {
    const end = toISODateOnly(new Date(start.getTime()));
    end.setUTCDate(end.getUTCDate() + randInt(1, 180));
    return { startDate: start, endDate: end };
  }

  // For active/paused, include ~15% with an endDate (to test optional endDate path)
  if (chance(0.15)) {
    const end = toISODateOnly(new Date(start.getTime()));
    end.setUTCDate(end.getUTCDate() + randInt(1, 180));
    return { startDate: start, endDate: end };
  }

  return { startDate: start };
}

function makeSponsorshipDates(): { sponsorshipStartDate: Date; sponsorshipEndDate?: Date } {
  const start = toISODateOnly(dateDaysFromNow(-randInt(0, 900))); // up to ~2.5 years ago
  // include sponsorshipEndDate in ~25% of records
  if (chance(0.25)) {
    const end = toISODateOnly(new Date(start.getTime()));
    end.setUTCDate(end.getUTCDate() + randInt(30, 600));
    return { sponsorshipStartDate: start, sponsorshipEndDate: end };
  }
  return { sponsorshipStartDate: start };
}

function makeSubscriptionStatus(i: number): SubscriptionStatus {
  // ensure we cover all statuses consistently
  // roughly: 60% active, 20% paused, 20% cancelled
  const r = (i % 10);
  if (r < 6) return 'active';
  if (r < 8) return 'paused';
  return 'cancelled';
}

function makeChildStatus(parentSubStatus: SubscriptionStatus, j: number): ChildStatus {
  // If subscription is paused, we still generate mixed child statuses;
  // your read-time "effectiveStatus" will derive paused from parent anyway.
  // Ensure coverage across values:
  const cycle: ChildStatus[] = ['active', 'paused', 'replacing', 'replaced', 'cancelled', 'dropped'];
  const base = cycle[j % cycle.length];

  // Slight bias: if parent is cancelled, more likely cancelled/dropped
  if (parentSubStatus === 'cancelled' && chance(0.6)) {
    return chance(0.5) ? 'cancelled' : 'dropped';
  }

  return base;
}

async function deleteBySeedTag(): Promise<void> {
  // Delete children first, then subscriptions, then supporters
  const collections = ['childRecords', 'subscriptions', 'supporters'] as const;

  for (const slug of collections) {
    let deleted = 0;
    while (true) {
      const res = await payload.find({
        collection: slug,
        where: { createdByTestRunId: { equals: SEED_TAG } },
        limit: 100,
      });

      if (!res.docs.length) break;

      for (const doc of res.docs) {
        await payload.delete({
          collection: slug,
          id: doc.id,
        });
        deleted += 1;
      }
    }
    // eslint-disable-next-line no-console
    console.log(`Deleted ${deleted} docs from ${slug}`);
  }
}

async function main() {
  // Adjust import to match your project config location if needed.
  const configPath = path.resolve(__dirname, '../payload.config.ts');

  await payload.init({
    secret: process.env.PAYLOAD_SECRET as string,
    mongoURL: process.env.MONGODB_URI as string,
    config: (await import(configPath)).default,
    local: true,
  });

  // eslint-disable-next-line no-console
  console.log('Payload initialized. Seeding…');

  await deleteBySeedTag();

  const created = {
    supporters: 0,
    subscriptions: 0,
    childRecords: 0,
  };

  // We'll create a total pool of subscriptions across supporters.
  // Each supporter gets 1–3 subscriptions. This yields ~100 subscriptions total.
  const supporterCount = 50;

  // We want ~70% of subscriptions to have children.
  // Implementation: 70% of subscriptions are Child Sponsorship AND get child records.
  const CHILD_SUB_RATIO = 0.7;

  for (let u = 0; u < supporterCount; u++) {
    const userId = uuid();

    const supporterDoc = await payload.create({
      collection: 'supporters',
      data: {
        userId,
        createdByTestRunId: SEED_TAG,
      },
    });
    created.supporters++;

    // 1–3 subscriptions per supporter
    const subCount = pick([1, 2, 2, 3]); // bias toward 2
    for (let s = 0; s < subCount; s++) {
      const subscriptionId = uuid();

      // Decide product:
      // ~70% are child sponsorship and get children
      const isChildSponsorship = chance(CHILD_SUB_RATIO);
      const productId = isChildSponsorship ? PRODUCT_CHILD_SPONSORSHIP : PRODUCT_RIP;

      const status = makeSubscriptionStatus(u + s);

      const { startDate, endDate } = makeStartEndForSubscription(status);

      const subDoc = await payload.create({
        collection: 'subscriptions',
        data: {
          supporter: supporterDoc.id, // relationship by Mongo _id
          subscriptionId,
          productId,
          status,
          startDate,
          ...(endDate ? { endDate } : {}),
          createdByTestRunId: SEED_TAG,
        },
      });
      created.subscriptions++;

      // Create children only for child sponsorship subs, ~70% overall.
      if (isChildSponsorship) {
        // 1–3 child records per subscription for combination coverage
        const childCount = pick([1, 1, 2, 2, 3]);

        for (let c = 0; c < childCount; c++) {
          const childStatus = makeChildStatus(status, c + s);

          const { sponsorshipStartDate, sponsorshipEndDate } = makeSponsorshipDates();

          // If child status implies ended, make sure end date exists sometimes
          // (but not always, to cover optional behavior).
          const forceEnded = ['replaced', 'cancelled', 'dropped'].includes(childStatus);
          const includeEnd = forceEnded ? chance(0.8) : chance(0.25);

          let finalEnd: Date | undefined = sponsorshipEndDate;
          if (includeEnd && !finalEnd) {
            const end = toISODateOnly(new Date(sponsorshipStartDate.getTime()));
            end.setUTCDate(end.getUTCDate() + randInt(30, 600));
            finalEnd = end;
          }
          if (!includeEnd) finalEnd = undefined;

          await payload.create({
            collection: 'childRecords',
            data: {
              subscription: subDoc.id, // relationship by Mongo _id
              childId: makeChildId(),
              status: childStatus,
              firstName: pick(['Amina', 'Noah', 'Lina', 'Ethan', 'Maya', 'Omar', 'Sofia', 'Kai', 'Zara', 'Leo']),
              sponsorshipStartDate,
              ...(finalEnd ? { sponsorshipEndDate: finalEnd } : {}),
              createdByTestRunId: SEED_TAG,
            },
          });
          created.childRecords++;
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:', created);

  // Helpful summary
  // eslint-disable-next-line no-console
  console.log(`Seed tag: ${SEED_TAG}`);
  // eslint-disable-next-line no-console
  console.log(`Products used:\n  Child Sponsorship: ${PRODUCT_CHILD_SPONSORSHIP}\n  Real Impact Partner: ${PRODUCT_RIP}`);

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
