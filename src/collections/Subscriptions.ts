import type { CollectionConfig } from 'payload'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'subscriptionId',
  },
  fields: [
    {
      name: 'supporter',
      type: 'relationship',
      relationTo: 'supporters',
      required: true,
      admin: {
        description: 'Supporter who owns this subscription',
      },
    },
    {
      name: 'subscriptionId',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique subscription identifier (UUID format)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) {
          return 'Subscription ID is required'
        }
        if (!UUID_REGEX.test(value)) {
          return 'Subscription ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)'
        }
        return true
      },
    },
    {
      name: 'productId',
      type: 'text',
      required: true,
      admin: {
        description: 'Product identifier (UUID format)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) {
          return 'Product ID is required'
        }
        if (!UUID_REGEX.test(value)) {
          return 'Product ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Paused',
          value: 'paused',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Current subscription status',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Subscription start date',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'Subscription end date (optional, must be >= start date)',
      },
      validate: (value: unknown, { data }: { data: Record<string, unknown> }) => {
        if (!value) {
          return true
        }
        if (typeof value !== 'string' || !data.startDate || typeof data.startDate !== 'string') {
          return true
        }
        const endDate = new Date(value)
        const startDate = new Date(data.startDate)
        if (endDate < startDate) {
          return 'End date must be on or after the start date'
        }
        return true
      },
    },
  ],
}
