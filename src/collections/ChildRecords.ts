import type { CollectionConfig } from 'payload'

export const ChildRecords: CollectionConfig = {
  slug: 'childRecords',
  admin: {
    useAsTitle: 'childId',
  },
  labels: {
    singular: 'Child Record',
    plural: 'Child Records',
  },
  fields: [
    {
      name: 'subscription',
      type: 'relationship',
      relationTo: 'subscriptions',
      required: true,
      admin: {
        description: 'Associated subscription',
      },
    },
    {
      name: 'childId',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique child identifier',
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
          label: 'Replacing',
          value: 'replacing',
        },
        {
          label: 'Replaced',
          value: 'replaced',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
        {
          label: 'Dropped',
          value: 'dropped',
        },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Current child record status',
      },
    },
    {
      name: 'sponsorshipStartDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Sponsorship start date',
      },
    },
    {
      name: 'sponsorshipEndDate',
      type: 'date',
      admin: {
        description: 'Sponsorship end date (optional)',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'Child first name',
      },
    },
  ],
}
