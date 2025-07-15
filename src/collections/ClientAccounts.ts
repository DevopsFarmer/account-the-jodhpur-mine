// ClientAccounts collection
import type { CollectionConfig } from 'payload'
export const ClientAccounts: CollectionConfig = {
  slug: 'client-accounts',
  admin: {
    useAsTitle: 'clientName',
  },
  access: {
  read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' || user?.role === 'guest',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' || user?.role === 'guest',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' ,
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'manager' ,
  },
  fields: [
    {
      name: 'clientName',
      type: 'text',
      required: true,
    },
    {
      name: 'clientMobile',
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
      required: true,
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
      name: 'clientCreatedAt',
      type: 'date',

    },
    {
      name: 'clientUpdatedAt',
      type: 'date',

    },
  ],
}
