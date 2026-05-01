// OPTIMIZED SIDEBAR ORDER
// Principle used:
// 1. Core daily actions first
// 2. Marketplace actions grouped by user workflow
// 3. Communication center
// 4. Financial/account management
// 5. Personal settings last
// This structure improves UX, discoverability, and natural product flow.

export const userLinks = [
  // PRIMARY NAVIGATION
  {
    group: null,
    items: [
        {
      path: "/",
      label: "Home",
      icon: "fa-solid fa-house-chimney",
    },
    {
      path: "/user/dashboard",
      label: "Dashboard",
      icon: "fa-solid fa-gauge-high", 
    },
      {
        path: "/user/chat",
        label: "Messages",
        icon: "fa-solid fa-comments",
        badge: "unreadCount",
      },
      {
        path: "/user/notifications",
        label: "Notifications",
        icon: "fa-solid fa-bell",
        badge: "notificationCount",
      },
      {
        path: "/user/wallet",
        label: "Wallet",
        icon: "fa-solid fa-wallet",
      },
    ],
  },

  // ERRANDS WORKFLOW
  {
    group: "Errands",
    items: [
      {
        path: "/user/errand-market",
        label: "Errand Market",
        icon: "fa-solid fa-shop",
      },
      {
        path: "/user/post-errand",
        label: "Post Errand",
        icon: "fa-solid fa-circle-plus",
      },
      {
        path: "/user/my-errands",
        label: "My Errands",
        icon: "fa-solid fa-clipboard-list",
      },
    ],
  },

  // SERVICES WORKFLOW
  {
    group: "Services",
    items: [
      {
        path: "/user/services",
        label: "Service Market",
        icon: "fa-solid fa-handshake",
      },
      {
        path: "/user/services/create",
        label: "Post Service",
        icon: "fa-solid fa-screwdriver-wrench",
      },
      {
        path: "/user/my-services",
        label: "My Services",
        icon: "fa-solid fa-layer-group",
      },
    ],
  },

  // SUBSCRIPTIONS & GROWTH
  {
    group: "Subscription",
    items: [
      {
        path: "/user/subscriptions",
        label: "Subscriptions",
        icon: "fa-solid fa-star",
      },
      {
        path: "/user/subscription-plans",
        label: "Subscription Plans",
        icon: "fa-solid fa-tags",
      },
      {
        path: "/user/referrals",
        label: "Referrals",
        icon: "fa-solid fa-user-plus",
      },
    ],
  },

  // FINANCE
  {
    group: "Finance",
    items: [
      {
        path: "/user/transaction-history",
        label: "Transaction History",
        icon: "fa-solid fa-receipt",
      },
    ],
  },

  // ACCOUNT SETTINGS
  {
    group: "Account",
    items: [
      {
        path: "/user/profile",
        label: "Profile",
        icon: "fa-solid fa-id-badge",
      },
      {
        path: "/user/verification",
        label: "Verification",
        icon: "fa-solid fa-id-card",
      },
      {
        path: "/user/security",
        label: "Security",
        icon: "fa-solid fa-shield-halved",
      },
      {
        path: "/user/skills",
        label: "Skills",
        icon: "fa-solid fa-code",
      },
      {
        path: "/user/support",
        label: "Support",
        icon: "fa-solid fa-headset",
      },
    ],
  },
];

export const adminLinks = [
  // PRIMARY
  {
    group: null,
    items: [
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        icon: "fa-solid fa-house",
      },
    ],
  },

  // USER & PLATFORM CONTROL
  {
    group: "Management",
    items: [
      {
        path: "/admin/users",
        label: "Users",
        icon: "fa-solid fa-user-group",
      },
      {
        path: "/admin/verifications",
        label: "Verifications",
        icon: "fa-solid fa-id-card",
      },
      {
        path: "/admin/support",
        label: "Support",
        icon: "fa-solid fa-headset",
      },
    ],
  },

  // MARKET OPERATIONS
  {
    group: "Marketplace",
    items: [
      {
        path: "/admin/orders",
        label: "Orders",
        icon: "fa-solid fa-bag-shopping",
      },
      {
        path: "/admin/errands",
        label: "Errands",
        icon: "fa-solid fa-clipboard-list",
      },
    ],
  },

  // REVENUE & MONETIZATION
  {
    group: "Finance",
    items: [
      {
        path: "/admin/clearances",
        label: "Clearances",
        icon: "fa-solid fa-money-check-dollar",
      },
      {
        path: "/admin/subscriptions",
        label: "Subscriptions",
        icon: "fa-solid fa-star",
      },
      {
        path: "/admin/plans",
        label: "Plans",
        icon: "fa-solid fa-layer-group",
      },
    ],
  },
];