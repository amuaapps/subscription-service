import type { CollectionConfig } from 'payload'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Supporters: CollectionConfig = {
  slug: 'supporters',
  admin: {
    useAsTitle: 'userId',
  },
  labels: {
    singular: 'Supporter',
    plural: 'Supporters',
  },
  fields: [
    {
      name: 'userId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique user identifier (UUID format)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) {
          return 'User ID is required'
        }
        if (!UUID_REGEX.test(value)) {
          return 'User ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)'
        }
        return true
      },
    },
    {
      name: 'createdByTestRunId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Test run identifier for seeded data',
      },
    },
  ],
}
