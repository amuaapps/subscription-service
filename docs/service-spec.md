# Subscription Service — Technical Specification (v1.1.0)

**Service name:** `subscription-service`  
**Version:** v1.1.0  
**Architecture:** Serverless, API-first, multi-cloud (AWS + Azure)  
**License:** MIT

---

## 1. Purpose & Scope

The Subscription Service is a serverless microservice that manages subscription relationships for Amua Apps. It provides:

- **User management** (userId: UUID)
- **Subscription management** (subscriptionId: UUID, productId: UUID, status tracking)
- **Optional child sponsorship records** (0..n per subscription; max 1 active child per subscription)
- **REST API** for upstream systems to create/update data
- **REST API** for downstream systems to query subscriptions by userId
- **Placeholder architecture** for external system adapters (e.g., CRM) without implementing them in v1

This service follows MACH principles and complies with `agents.md` standards.

---

## 2. Domain Model

### 2.1 Entities

#### User
- `userId` (UUID; from user identity service)

#### Subscription
- `subscriptionId` (UUID; from upstream subscription/billing service)
- `productId` (UUID; identifies which product the subscription is for)
- `status`: `active | paused | cancelled`
- `childRecords?`: 0..n (optional; used for child sponsorship products)
- Optional metadata fields (extension point for future needs)

#### ChildRecord (optional; belongs to a subscription)
- `childId` (string format `ABC-XXXXXX-XXXX`)
- `status`: `active | replacing | replaced | cancelled | dropped`
- `startDate` (required, ISO 8601 date)
- `endDate` (optional, ISO 8601 date)
- `firstName` (string; PII)
- `lastName` (string; PII)
- `sponsorshipStartDate` (required, ISO 8601 date)
- `sponsorshipEndDate` (optional, ISO 8601 date)

### 2.2 Validation Rules

**Enforced at API boundary + domain layer:**

- `userId`, `subscriptionId`, `productId` must be valid UUIDs
- `childId` must match regex: `^[A-Z]{3}-\d{6}-\d{4}$`
- Dates must be valid ISO 8601 **date** strings
- `endDate` >= `startDate` when both exist
- `sponsorshipEndDate` >= `sponsorshipStartDate` when both exist
- **Child records are optional** (a subscription may have zero child records)
- If a subscription has child records, it must have **at most one** child record with `status = active` at any time

### 2.3 Lifecycle Rules

**Subscription status transitions:**
- `active` → `paused` → `active` (resumption)
- `active` → `cancelled` (terminal)
- `paused` → `cancelled` (terminal)

**Child record lifecycle:**
- When a child is replaced within a subscription:
  - Existing active child record transitions to `replaced` and gets end dates
  - New record becomes `active` (or `replacing` briefly if upstream needs a two-step process)
- When subscription becomes `cancelled`:
  - Any active child record should transition to `cancelled` or `dropped` according to program rules
  - Set end dates appropriately

**Idempotency:**
- Repeated upserts are safe and deterministic
- Conflicting updates produce 409 with clear message

---

## 3. API Contracts (v1)

All endpoints are versioned under `/api/v1/`.

### 3.1 Upstream Endpoints (Create/Update)

#### Upsert User
- `POST /api/v1/users`
- Request: `{ userId: UUID }`
- Response: `201 Created` or `200 OK` (idempotent)

#### Upsert Subscription
- `POST /api/v1/subscriptions`
- Request: `{ userId: UUID, subscriptionId: UUID, productId: UUID, status: string, metadata?: object }`
- Response: `201 Created` or `200 OK`

#### Update Subscription Status
- `PATCH /api/v1/subscriptions/{subscriptionId}/status`
- Request: `{ status: string }`
- Response: `200 OK` or `409 Conflict` (invalid transition)

#### Upsert Child Record (optional)
- `POST /api/v1/subscriptions/{subscriptionId}/children`
- Request: `{ childId: string, status: string, startDate: string, endDate?: string, firstName: string, lastName: string, sponsorshipStartDate: string, sponsorshipEndDate?: string }`
- Response: `201 Created` or `200 OK` or `409 Conflict` (max 1 active child violated)

#### Update Child Record Status
- `PATCH /api/v1/subscriptions/{subscriptionId}/children/{childId}/status`
- Request: `{ status: string, endDate?: string, sponsorshipEndDate?: string }`
- Response: `200 OK`

### 3.2 Downstream Endpoints (Query)

#### Get All Subscriptions by User
- `GET /api/v1/users/{userId}/subscriptions`
- Response: `200 OK` with array of subscriptions (including child records if present)

#### Get Single Subscription
- `GET /api/v1/users/{userId}/subscriptions/{subscriptionId}`
- Response: `200 OK` or `404 Not Found`

### 3.3 Error Responses

Consistent error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Sanitized error message",
    "details": []
  }
}
```

Status codes:
- `400`: Validation / client errors
- `404`: Resource not found
- `409`: Conflict (e.g., invalid state transition, max 1 active child violated)
- `500`: Server errors (sanitized)

---

## 4. Storage Design

### 4.1 Cloud-Agnostic Repository Interface

```typescript
interface SubscriptionRepository {
  upsertUser(userId: string): Promise<void>;
  upsertSubscription(subscription: Subscription): Promise<void>;
  updateSubscriptionStatus(userId: string, subscriptionId: string, status: string): Promise<void>;
  upsertChildRecord(subscriptionId: string, childRecord: ChildRecord): Promise<void>;
  updateChildRecordStatus(subscriptionId: string, childId: string, updates: Partial<ChildRecord>): Promise<void>;
  getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
  getSubscription(userId: string, subscriptionId: string): Promise<Subscription | null>;
}
```

### 4.2 AWS DynamoDB Implementation

**Single-table design:**
- Partition key: `userId`
- Sort key: `entityType#entityId` (e.g., `SUBSCRIPTION#<subscriptionId>`, `CHILD#<subscriptionId>#<childId>`)
- Supports:
  - List all subscriptions for a user
  - List all child records for a subscription
  - Conditional writes for invariants (max 1 active child)
- Use DynamoDB transactions where needed for atomic updates

### 4.3 Azure Cosmos DB Implementation

**Partition by userId:**
- Documents include `type` discriminator (`user`, `subscription`, `childRecord`)
- Store subscription and child record documents under the same partition
- Use transactional batch (within partition) to enforce invariants
- Supports same query patterns as DynamoDB

---

## 5. External Adapter Architecture (Placeholder)

### 5.1 Ports (Interfaces)

#### IdentityLookupClient
```typescript
interface IdentityLookupClient {
  resolveCrmUserId(userId: string): Promise<string>;
}
```

#### ExternalSubscriptionAdapter
```typescript
interface ExternalSubscriptionAdapter {
  syncSubscription(subscription: Subscription): Promise<void>;
  fetchExternalData(externalId: string): Promise<ExternalSubscriptionData>;
}
```

### 5.2 CRM Adapter (Stub)

- Concrete stub: `CrmAdapter` implements `ExternalSubscriptionAdapter`
- Mapping contracts defined (internal model ↔ CRM model)
- **Not wired into runtime flows in v1**
- Feature-flagged off by default
- Can be enabled later without changing domain invariants or core APIs

---

## 6. Configuration & Secrets

### 6.1 Required Environment Variables

- `NODE_ENV`: `development | staging | production`
- `SERVICE_NAME`: `subscription-service`
- `LOG_LEVEL`: `debug | info | warn | error`
- `CORS_ALLOWED_ORIGINS`: Comma-separated list
- `DB_TABLE_NAME` (AWS) or `DB_CONTAINER_NAME` (Azure)
- `IDENTITY_SERVICE_BASE_URL`: URL for identity service (future use)
- `FEATURE_FLAG_CRM_ADAPTER`: `true | false` (default: `false`)

### 6.2 PII-Safe Logging

- Structured logging (pino-like format)
- Include `requestId`/`correlationId` in all logs
- **Never log** `firstName`, `lastName`, or other PII at info level
- Log errors with stack traces server-side only
- Return sanitized errors to clients

---

## 7. Deployment Architecture

### 7.1 AWS (Serverless)

**Components:**
- API Gateway (HTTP API) → Lambda functions
- DynamoDB table (single-table design)
- CloudWatch logs
- IAM roles/policies (least privilege)

**Blue/Green:**
- Lambda versions + alias
- Stage 3: Deploy to GREEN (new Lambda version)
- Stage 4: Test GREEN endpoint, switch alias on success

### 7.2 Azure (Serverless)

**Components:**
- Function App (Consumption plan)
- Cosmos DB (NoSQL, partition by userId)
- Storage account (required for Functions)
- Application Insights
- Key Vault + Managed Identity (for secrets)

**Blue/Green:**
- Deployment slots
- Stage 3: Deploy to GREEN slot
- Stage 4: Test GREEN slot URL, swap slots on success

### 7.3 CI/CD Pipeline (GitHub Actions)

**4-stage pipeline:**

1. **Test**: lint, typecheck, format check, unit tests (coverage thresholds), CodeQL, npm audit
2. **Build**: Produce immutable artifacts
3. **Deploy (GREEN)**: Apply infra + deploy to GREEN (no traffic switch)
4. **Test Infra + Integration + Switch**: Integration tests against GREEN, infra security tests, switch BLUE→GREEN only on success

**Branch mapping:**
- `develop` → dev environment
- `release` → staging environment
- `main` → production environment

**Cloud selection:**
- Deterministic: input `cloud` wins, or auto-detect if exactly one configured
- Fail if both or none configured without explicit input

---

## 8. Security & Compliance

### 8.1 Authentication & Authorization

- All endpoints require authentication (implementation TBD; placeholder for auth middleware)
- Least privilege IAM/RBAC for cloud resources
- Fail closed on auth/authz errors

### 8.2 Input Validation

- Runtime validation at API boundary (zod or similar)
- Reject invalid UUIDs, childId formats, dates
- Sanitize all error messages

### 8.3 Secrets Management

- No secrets in code or repository
- Use AWS Secrets Manager or Azure Key Vault
- OIDC for GitHub Actions authentication (no long-lived keys)

### 8.4 PII Protection

- Child `firstName` and `lastName` are PII
- Never log PII
- Mask/hash when necessary for debugging

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Domain logic (invariants, status transitions)
- Validation rules
- Pure functions (no cloud SDK dependencies)
- Coverage threshold: 80%+

### 9.2 Integration Tests

- Upsert user/subscription/child records
- Query by userId
- Enforce max 1 active child per subscription
- Invalid childId format rejection
- Status transition conflicts (409)

### 9.3 Stage 4 Integration Tests (GREEN Verification)

1. Create/upsert a user
2. Create two subscriptions with different productIds:
   - Subscription A: includes child records
   - Subscription B: no child records
3. For Subscription A:
   - Upsert an active child record
   - Replace it with a new active child (old becomes `replaced`)
   - Assert second active child without replacement fails (409)
4. Query by userId and assert:
   - Both subscriptions returned
   - productId present
   - childRecords present for A, empty/omitted for B
5. Assert invalid childId format is rejected (400)

---

## 10. Open Source & Licensing

- **License:** MIT
- Repository includes `LICENSE`, `README.md`, `.env.example`
- Dependency license compliance enforced in CI

---

## 11. Future Enhancements (Out of Scope for v1)

- Event-driven architecture (publish subscription events)
- CRM adapter implementation (currently placeholder)
- GraphQL API (currently REST only)
- Advanced query capabilities (filter by productId, status, etc.)
- Audit trail / event sourcing

---

## 12. Compliance with agents.md

This service specification fully complies with `agents.md` (v1.0.0):

- ✅ MACH principles (Microservices, API-first, Cloud-native, Headless)
- ✅ TypeScript strict mode, no `any`
- ✅ Serverless architecture (AWS Lambda + DynamoDB, Azure Functions + Cosmos DB)
- ✅ Multi-cloud infrastructure (Terraform for AWS, Bicep for Azure)
- ✅ 4-stage CI/CD pipeline with blue/green deployment
- ✅ Jest unit + integration tests with coverage thresholds
- ✅ CodeQL + npm audit security checks
- ✅ PII-safe logging (structured, no PII at info level)
- ✅ Least privilege IAM/RBAC
- ✅ MIT license
- ✅ Cloud-agnostic domain logic with adapter pattern

---

**End of Specification**
