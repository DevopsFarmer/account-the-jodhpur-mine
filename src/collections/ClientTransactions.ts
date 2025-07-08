// ClientTransactions collection
import type { CollectionConfig } from 'payload'
// Remove these lines if not used
// import { v4 as uuidv4 } from 'uuid';

export const ClientTransactions: CollectionConfig = {
  slug: 'client-transaction',
  admin: {
    useAsTitle: 'voucherNo',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          // Generate a unique voucher number in format: V-YYYYMMDD-XXXXX
          const date = new Date();
          const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
          const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
          return {
            ...data,
            voucherNo: `V-${dateStr}-${randomStr}`,
          };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'voucherNo',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'clientName',
      type: 'relationship',
      relationTo: 'client-accounts',
      required: true,
    },
    {
      name: 'query_license',
      type: 'relationship',
      relationTo: 'client-accounts',
      required: true,
    },
    {
      name: 'near_village',
      type: 'relationship',
      relationTo: 'client-accounts',
      required: true,
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
        }
      ],
    },
    {
      name: 'workingStageclient',
      type: 'array',

      fields: [
        {
          name: 'workingStageclient',
          type: 'text',
        },
        {
          name: 'workingDescriptionclient',
          type: 'text',
        },
        {
          name: 'stageDate',
          type: 'date',
          required: true,
        }
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
    },
    {
      name: 'totalAmountclient',
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
      name: 'clientCreatedAt',
      type: 'date',

    },
    {
      name: 'clientUpdatedAt',
      type: 'date',

    },
    {
      name: 'paymentstatus',
      type: 'text',
      defaultValue: 'pending',
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Guest', value: 'guest' },
        { label: 'Manager', value: 'manager' },
      ],
      required: true,
      defaultValue: 'guest',
      admin: {
        position: 'sidebar',
      },
    }
  ],
}