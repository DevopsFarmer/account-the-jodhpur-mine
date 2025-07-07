//Expense Collection
import type { CollectionConfig } from 'payload'

export const Expense: CollectionConfig = {
  slug: 'expense',
  admin: {
    useAsTitle: 'nameOfExpense',
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
