// ClientTransactions collection
import type { CollectionConfig } from 'payload'
export const ClientTransactions: CollectionConfig = {
  slug: 'client-transaction',
  admin: {
    useAsTitle: 'clientName',
  },
 
  fields: [
    {
      name: 'clientName',
      type: 'relationship',
      relationTo: 'client-accounts',
      required: true,
    },
    {
      name:'query_license',
      type:'relationship',
      relationTo:'client-accounts',
      required:true,
    },
    {
      name:'near_village',
      type:'relationship',
      relationTo:'client-accounts',
      required:true,
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
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
    },
    {
      name:'totalAmountclient',
      type:'number',
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
      name:'paymentstatus',
      type:'text',
      defaultValue:'pending',
    }
  ],
}
