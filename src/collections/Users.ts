import type { CollectionConfig } from 'payload'

export type UserRole = 'admin' | 'manager' | 'guest'

export interface User {
  id: string
  email: string
  role: UserRole
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'guest',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Guest', value: 'guest' }
      ],
      required: true,
    }
  ]
}
