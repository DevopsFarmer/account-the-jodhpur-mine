import type { CollectionConfig } from 'payload'

export const Vendor: CollectionConfig = {
  slug: 'vendor',
  admin: {
    useAsTitle: 'vendorName',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' ,
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' ,
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' ,
  },
  fields: [
    {
      name: 'vendorName',
      type: 'text',
      required: true,
    },
    {
      name: 'vendorMobile',
      type: 'text',
      required: true,
    },
    {
      name: 'query_license',
      type: 'text',
    },
    {
      name: 'mining_license',
      type: 'text',

    },
    {
      name: 'near_village',
      type: 'text',
    },
    {
      name: 'tehsil',
      type: 'text',

    },
    {
      name: 'district',
      type: 'text',

    },
    {
      name: 'state',
      type: 'text',

    },

    {
      name: 'country',
      type: 'text',

    },
    {
      name: 'vendorCreatedAt',
      type: 'date',

    },
    {
      name: 'vendorUpdatedAt',
      type: 'date',

    },
  ],
}
