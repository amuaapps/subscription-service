import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'userId',
  },
  auth: true,
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
    {
      name: 'name',
      type: 'text',
    },
  ],
}
