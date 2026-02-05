import type { CollectionConfig } from 'payload'

const CHILD_ID_REGEX = /^[A-Z]{3}-\d{6}-\d{4}$/

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
        description: 'Unique child identifier (format: ABC-123456-7890)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) {
          return 'Child ID is required'
        }
        if (!CHILD_ID_REGEX.test(value)) {
          return 'Child ID must match format: ABC-123456-7890 (3 uppercase letters, dash, 6 digits, dash, 4 digits)'
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
        description: 'Sponsorship end date (optional, must be >= start date)',
      },
      validate: (value: unknown, { data }: { data: Record<string, unknown> }) => {
        if (!value) {
          return true
        }
        if (typeof value !== 'string' || !data.sponsorshipStartDate || typeof data.sponsorshipStartDate !== 'string') {
          return true
        }
        const endDate = new Date(value)
        const startDate = new Date(data.sponsorshipStartDate)
        if (endDate < startDate) {
          return 'Sponsorship end date must be on or after the start date'
        }
        return true
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
