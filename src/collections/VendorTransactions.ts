// VendorTransactions collection
import type { CollectionConfig } from 'payload'

export const VendorTransactions: CollectionConfig = {
  slug: 'vendor-transaction',
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
      type: 'relationship',
      relationTo: 'vendor',
      required: true,
    },
    {
      name: 'query_license',
      type: 'relationship',
      relationTo: 'vendor',

    },
    {
      name: 'near_village',
      type: 'relationship',
      relationTo: 'vendor',
  
    },
    {
      name: 'workingStage',
      type: 'array',

      fields: [
        {
          name: 'workingStage',
          type: 'text',
        },
        {
          name: 'workingDescription',
          type: 'text',
        },
        {
          name: "workstatus",
          type: 'text',
          defaultValue: 'incomplete',
        },
        {
          name: "stageDate",
          type: 'date',
          
          
        }
      ],
    },
    {
      name: 'workingStagevendor',
      type: 'array',

      fields: [
        {
          name: 'workingStagevendor',
          type: 'text',

        },
        {
          name: 'workingDescriptionvendor',
          type: 'text',

        },
        {
          name: "stageDate",
          type: 'date',
          
          
        }
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
    },
    {
      name: 'totalAmountvendor',
      type: 'number',
    },
    {
      name: 'remainingAmount',
      type: 'number',

    },
    {
      name: 'description',
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
    {
      name: 'paymentstatus',
      type: 'text',
      defaultValue: 'pending',
    }
  ],
}