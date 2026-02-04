import type { CollectionConfig } from 'payload'

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
        description: 'Unique user identifier',
      },
    },
  ],
}
