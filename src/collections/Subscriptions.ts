import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'subscriptionId',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who owns this subscription',
      },
    },
    {
      name: 'subscriptionId',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique subscription identifier',
      },
    },
    {
      name: 'productId',
      type: 'text',
      required: true,
      admin: {
        description: 'Product identifier',
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
        description: 'Subscription end date (optional)',
      },
    },
  ],
}
