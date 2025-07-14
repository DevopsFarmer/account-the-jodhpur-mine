//Expense Collection
import type { CollectionConfig } from 'payload'

export const Expense: CollectionConfig = {
  slug: 'expense',
  admin: {
    useAsTitle: 'nameOfExpense',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'nameOfExpense',
      type: 'text',
      required: true,
    },
   {
    name: 'initialBalanceAmount',
    type: 'number',
    required: true,
   },
   {
    name: 'addExpenseItems',
    type: 'array',
    
    fields: [
      {
        name: 'amount',
        type: 'number',
     
      },
      { name: 'date',
        type:'date',
       },
      {
        name: 'description',
        type: 'text',
      },
      {name:'subexpense',type:'array',
        fields:[
          {
            name:'amount',
            type:'number',
          },
          { name: 'date',
            type:'date',
           },
          {
            name:'description',
            type:'text',
          },
         {
          name:'addExpense',
          type:'array',
          fields:[
            {
              name:'amount',
              type:'number',
            },
            { name: 'date',
              type:'date',
             },
            {
              name:'description',
              type:'text',
            }
          ]
         }
        ]
      }
    ],
   },

  
   {
    name: 'expenseCreatedAt',
    type: 'date',
    required: true,
   },
   {
    name: 'expenseUpdatedAt',
    type: 'date',
    required: true,
   },
 
  ],
}