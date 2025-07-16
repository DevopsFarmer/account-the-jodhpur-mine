const navItems = {
  admin: [
    {
      title: "Client Accounts",
      links: [
        { label: "Add Client Account", href: "/client/account/add" },
        { label: "View Client Account", href: "/client/account/view" },
      ],
    },
    {
      title: "Client Transactions",
      links: [
        { label: "Add Client Transaction", href: "/client/transaction/add" },
        { label: "View Client Transaction", href: "/client/transaction/view" },
        { label: "Voucher Client Transaction", href: "/client/transaction/voucher" },
      ],
    },
    {
      title: "Vendor Accounts",
      links: [
        { label: "Add Vendor Account", href: "/vendor/account/add" },
        { label: "View Vendor Account", href: "/vendor/account" },
      ],
    },
    {
      title: "Vendor Transactions",
      links: [
        { label: "Add Vendor Transaction", href: "/vendor/transaction/add" },
        { label: "View Vendor Transaction", href: "/vendor/transaction" },
      ],
    },
    {
      title: "Expense",
      links: [
        { label: "Add Expense", href: "/expense/add" },
        { label: "View Expense", href: "/expense" },
      ],
    },
  ],
  manager: [
    {
      title: "Client Accounts",
      links: [
        { label: "Add Client Account", href: "/client/account/add" },
        { label: "View Client Account", href: "/client/account/view" },
      ],
    },
    {
      title: "Client Transactions",
      links: [
        { label: "Add Client Transaction", href: "/client/transaction/add" },
        { label: "View Client Transaction", href: "/client/transaction/view" },
        { label: "Voucher Client Transaction", href: "/client/transaction/voucher" },
      ],
    },
    {
      title: "Vendor Accounts",
      links: [
        { label: "Add Vendor Account", href: "/vendor/account/add" },
        { label: "View Vendor Account", href: "/vendor/account" },
      ],
    },
    {
      title: "Vendor Transactions",
      links: [
        { label: "Add Vendor Transaction", href: "/vendor/transaction/add" },
        { label: "View Vendor Transaction", href: "/vendor/transaction" },
      ],
    },
  ],
  guest: [
    {
      title: "Voucher Transactions",
      links: [
        { label: "Create Voucher", href: "/client/transaction/add-voucher" },
        
      ],
    },
  ],
};


export default navItems;
