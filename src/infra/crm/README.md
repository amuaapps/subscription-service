# CRM Adapter Architecture

## Overview

This directory contains the CRM adapter interface and implementations for syncing subscription data with external CRM systems.

## Design Principles

1. **Interface-driven**: All CRM integrations implement the `ICRMAdapter` interface
2. **Fail-safe**: CRM sync failures should not block core subscription operations
3. **Async by default**: All CRM operations are asynchronous
4. **Idempotent**: Sync operations can be safely retried
5. **Extensible**: New CRM providers can be added by implementing the interface

## Current Implementations

### PlaceholderCRMAdapter

A no-op implementation that returns placeholder data. Used when:
- CRM integration is disabled via configuration
- During development and testing
- As a fallback when the real CRM is unavailable

**Configuration:**
```typescript
const crmAdapter = new PlaceholderCRMAdapter(enabled);
```

Set `enabled = false` to disable all CRM operations (default).

## Future Implementations

### Planned CRM Integrations

1. **Salesforce Adapter** (`salesforce-adapter.ts`)
   - Use Salesforce REST API
   - Map User → Contact
   - Map Subscription → Opportunity or Custom Object
   - Map ChildRecord → Custom Object

2. **HubSpot Adapter** (`hubspot-adapter.ts`)
   - Use HubSpot CRM API
   - Map User → Contact
   - Map Subscription → Deal
   - Map ChildRecord → Custom Object

3. **Microsoft Dynamics Adapter** (`dynamics-adapter.ts`)
   - Use Dynamics 365 Web API
   - Map entities to Dynamics objects

## Interface Contract

### ICRMAdapter Methods

#### Sync Operations
- `syncUser(user: User): Promise<CRMContact>` - Create or update user in CRM
- `syncSubscription(subscription: Subscription): Promise<CRMSubscription>` - Sync subscription
- `syncChildRecord(subscriptionId: string, childRecord: ChildRecord): Promise<CRMChildRecord>` - Sync child record

#### Read Operations
- `getUserFromCRM(userId: string): Promise<CRMContact | null>` - Fetch user from CRM
- `getSubscriptionFromCRM(subscriptionId: string): Promise<CRMSubscription | null>` - Fetch subscription
- `getChildRecordFromCRM(childId: string): Promise<CRMChildRecord | null>` - Fetch child record

#### Delete Operations
- `deleteUserFromCRM(userId: string): Promise<void>` - Remove user from CRM
- `deleteSubscriptionFromCRM(subscriptionId: string): Promise<void>` - Remove subscription
- `deleteChildRecordFromCRM(childId: string): Promise<void>` - Remove child record

## Integration Patterns

### Pattern 1: Fire-and-Forget (Recommended for MVP)

```typescript
// In handlers, sync to CRM but don't block on result
await subscriptionRepository.upsertSubscription(subscription);

// Fire-and-forget CRM sync
crmAdapter.syncSubscription(subscription).catch((err) => {
  logger.error('CRM sync failed', { error: err, subscriptionId: subscription.subscriptionId });
});
```

### Pattern 2: Event-Driven (Future Enhancement)

```typescript
// Emit events for CRM sync
eventBus.emit('subscription.created', subscription);

// Separate worker processes events and syncs to CRM
eventBus.on('subscription.created', async (subscription) => {
  await crmAdapter.syncSubscription(subscription);
});
```

### Pattern 3: Synchronous (Use with caution)

```typescript
// Block until CRM sync completes
await subscriptionRepository.upsertSubscription(subscription);
await crmAdapter.syncSubscription(subscription);
```

## Error Handling

CRM adapters should:
1. Log all errors with context
2. Return meaningful error messages
3. Not throw errors that would break core operations
4. Implement retry logic with exponential backoff
5. Support circuit breaker pattern for failing CRM systems

## Testing

Each CRM adapter should have:
1. Unit tests with mocked CRM API calls
2. Integration tests against CRM sandbox environments
3. Contract tests to verify interface compliance

## Configuration

CRM adapters are configured via environment variables:

```bash
CRM_ENABLED=false
CRM_PROVIDER=placeholder  # placeholder | salesforce | hubspot | dynamics
CRM_API_KEY=<secret>
CRM_API_URL=<endpoint>
CRM_TIMEOUT_MS=5000
CRM_RETRY_ATTEMPTS=3
```

## Security Considerations

1. **API Keys**: Store in secure secret management (AWS Secrets Manager, Azure Key Vault)
2. **PII Protection**: Ensure CRM sync complies with data privacy regulations
3. **Audit Logging**: Log all CRM sync operations for compliance
4. **Rate Limiting**: Respect CRM API rate limits
5. **Data Minimization**: Only sync necessary fields to CRM

## Monitoring

Key metrics to track:
- CRM sync success rate
- CRM sync latency (p50, p95, p99)
- CRM API error rates
- CRM sync queue depth (if using async pattern)

## Migration Path

To add a new CRM integration:

1. Create new adapter file (e.g., `salesforce-adapter.ts`)
2. Implement `ICRMAdapter` interface
3. Add configuration for the new provider
4. Write unit and integration tests
5. Update factory/DI to instantiate correct adapter
6. Update documentation
7. Deploy with feature flag enabled
