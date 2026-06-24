// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import AdminLayout from "@/layouts/AdminLayout.vue";
import UserLayout from "@/layouts/UserLayout.vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import EmptyLayout from "@/layouts/EmptyLayout.vue";

const routes = [
  // ── Public ──────────────────────────────────────────────
  {
    path: "/",
    component: PublicLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/pages/public/Home.vue"),
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/pages/public/About.vue"),
      },
      {
        path: "contact",
        name: "Contact",
        component: () => import("@/pages/public/Contact.vue"),
      },
      {
        path: "subscription",
        name: "PublicSubscriptionPlans",
        component: () => import("@/pages/public/PublicSubscriptionPlans.vue"),
      },
      {
        path: "privacy-policy",
        name: "PrivacyPolicy",
        component: () => import("@/pages/public/legal/PrivacyPolicy.vue"),
      },
      {
        path: "terms-of-service",
        name: "TermsOfService",
        component: () => import("@/pages/public/legal/TermsOfService.vue"),
      },
      {
        path: "cookie-policy",
        name: "CookiePolicy",
        component: () => import("@/pages/public/legal/CookiePolicy.vue"),
      },
      {
        path: "disclaimer",
        name: "Disclaimer",
        component: () => import("@/pages/public/legal/Disclaimer.vue"),
      },
    ],
  },

  // ── User ─────────────────────────────────────────────────
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "UserDashboard",
        component: () => import("@/pages/user/Dashboard.vue"),
      },
      {
        path: "wallet",
        name: "Wallet",
        component: () => import("@/pages/user/Wallet.vue"),
      },
      {
        path: "errand-market",
        name: "ErrandMarket",
        component: () => import("@/pages/user/ErrandMarket.vue"),
      },
      {
        path: "services",
        name: "Services",
        component: () => import("@/pages/user/Services.vue"),
      },
      {
        path: "my-services",
        name: "MyServices",
        component: () => import("@/pages/user/MyServices.vue"),
      },
      {
        path: "services/create",
        name: "CreateService",
        component: () => import("@/pages/user/CreateService.vue"),
      },
      // ── Static service sub-routes must come BEFORE :id dynamic routes ──
      {
        path: "services/payment/callback",
        name: "ServicePaymentCallback",
        component: () => import("@/pages/ServicePaymentCallback.vue"),
      },
      {
        path: "services/:id/edit",
        name: "EditService",
        component: () => import("@/pages/user/CreateService.vue"),
      },
      // ── Service detail page (replaces ServiceDetailDrawer) ──
      {
        path: "services/:id",
        name: "ServiceDetail",
        component: () => import("@/pages/user/ServiceDetailPage.vue"),
      },
      // ── Order detail page (replaces OrderDetailDrawer) ──
      {
        path: "orders/:id",
        name: "OrderDetail",
        component: () => import("@/pages/user/OrderDetailPage.vue"),
      },
      {
        path: "post-errand",
        name: "PostErrand",
        component: () => import("@/pages/user/PostErrand.vue"),
      },
      {
        path: "my-errands",
        name: "MyErrands",
        component: () => import("@/pages/user/MyErrands.vue"),
      },
      // ── Static errand sub-routes BEFORE any dynamic :id routes ──
      {
        path: "errands/payment/callback",
        name: "ErrandPaymentCallback",
        component: () => import("@/pages/ErrandPaymentCallback.vue"),
      },
      // ── Errand detail page (replaces ErrandDetailDrawer) ──
      {
        path: "errands/:id",
        name: "ErrandDetail",
        component: () => import("@/pages/user/ErrandDetailPage.vue"),
      },
      {
        path: "subscriptions",
        name: "MySubscriptions",
        component: () => import("@/pages/user/MySubscriptions.vue"),
      },
      {
        path: "subscription-plans",
        name: "SubscriptionPlans",
        component: () => import("@/pages/user/SubscriptionPlans.vue"),
      },
      {
        path: "referrals",
        name: "Referrals",
        component: () => import("@/pages/user/Referrals.vue"),
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/pages/user/Profile.vue"),
      },
      {
        path: "security",
        name: "Security",
        component: () => import("@/pages/user/SecurityPage.vue"),
      },
      {
        path: "verification",
        name: "Verification",
        component: () => import("@/pages/user/VerificationPage.vue"),
      },
      {
        path: "skills",
        name: "Skills",
        component: () => import("@/pages/user/SkillsPage.vue"),
      },
      {
        path: "chat/:roomId?",
        name: "Chat",
        component: () => import("@/pages/user/Chat.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/provider/:identifier/profile",
        name: "ServiceProviderProfile",
        component: () => import("@/pages/user/ServiceProviderProfile.vue"),
        meta: { requiresAuth: false },
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/pages/user/Notifications.vue"),
      },
      {
        path: "transaction-history",
        name: "TransactionHistory",
        component: () => import("@/pages/user/TransactionHistory.vue"),
      },
      // ── Support ──────────────────────────────────────────────
      {
        path: "support",
        name: "SupportHome",
        component: () => import("@/pages/user/SupportHome.vue"),
      },
      {
        path: "support/tickets",
        name: "Support",
        component: () => import("@/pages/user/Support.vue"),
      },
      {
        path: "support/new",
        name: "CreateTicket",
        component: () => import("@/pages/user/CreateTicketPage.vue"),
      },
      {
        path: "support/:ticketId",
        name: "SupportTicket",
        component: () => import("@/pages/user/SupportTicketDetail.vue"),
      },
    ],
  },

  // ── Admin ────────────────────────────────────────────────
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/pages/admin/Dashboard.vue"),
      },

      // ─── Users ─────────────────
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/pages/admin/users/Users.vue"),
      },
      {
        path: "users/:id",
        name: "AdminUserDetail",
        component: () => import("@/pages/admin/users/UserDetail.vue"),
      },

      // ─── Verifications ─────────
      {
        path: "verifications",
        name: "AdminVerifications",
        component: () =>
          import("@/pages/admin/verifications/Verifications.vue"),
      },
      {
        path: "verifications/:id",
        name: "AdminVerificationDetail",
        component: () =>
          import("@/pages/admin/verifications/VerificationDetail.vue"),
      },

      // ─── Errands ───────────────
      {
        path: "errands",
        name: "AdminErrands",
        component: () => import("@/pages/admin/errands/Errands.vue"),
      },
      {
        path: "errands/:id",
        name: "AdminErrandDetail",
        component: () => import("@/pages/admin/errands/ErrandDetail.vue"),
      },

      // ─── Orders ────────────────
      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("@/pages/admin/orders/Orders.vue"),
      },
      {
        path: "orders/:id",
        name: "AdminOrderDetail",
        component: () => import("@/pages/admin/orders/OrderDetail.vue"),
      },

      // ─── Subscriptions ─────────
      {
        path: "subscriptions",
        name: "AdminSubscriptions",
        component: () =>
          import("@/pages/admin/subscriptions/Subscriptions.vue"),
      },
      {
        path: "subscriptions/:id",
        name: "AdminSubscriptionDetail",
        component: () =>
          import("@/pages/admin/subscriptions/SubscriptionDetail.vue"),
      },

      // ─── Plans (NEW) ───────────
      {
        path: "plans",
        name: "AdminPlans",
        component: () => import("@/pages/admin/plans/Plans.vue"),
      },
      {
        path: "plans/new",
        name: "CreatePlan",
        component: () => import("@/pages/admin/plans/CreatePlan.vue"),
      },
      {
        path: "plans/:id/edit",
        name: "EditPlan",
        component: () => import("@/pages/admin/plans/EditPlan.vue"),
      },

      // ─── Clearances ────────────
      {
        path: "clearances",
        name: "AdminClearances",
        component: () => import("@/pages/admin/Clearances/Clearances.vue"),
      },
      {
        path: "clearances/:id",
        name: "AdminClearanceDetail",
        component: () => import("@/pages/admin/Clearances/ClearanceDetail.vue"),
      },

      // ─── Withdrawals ───────────
      {
        path: "withdrawals",
        name: "AdminWithdrawals",
        component: () => import("@/pages/admin/withdrawals/AdminWithdrawals.vue"),
      },

      // ─── Support ───────────────
      {
        path: "support",
        name: "AdminSupport",
        component: () => import("@/pages/admin/support/AdminSupport.vue"),
      },
      {
        path: "support/:ticketId",
        name: "AdminSupportDetail",
        component: () => import("@/pages/admin/support/AdminSupportDetail.vue"),
      },
    ],
  },

  // ── Auth ─────────────────────────────────────────────────
  {
    path: "/auth",
    component: EmptyLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("@/pages/auth/Login.vue"),
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/pages/auth/Register.vue"),
      },
      {
        path: "verify-email",
        name: "VerifyEmail",
        component: () => import("@/pages/auth/VerifyEmail.vue"),
      },
      {
        path: "forgot-password",
        name: "ForgotPassword",
        component: () => import("@/pages/auth/ForgotPassword.vue"),
      },
      {
        path: "reset-password",
        name: "ResetPassword",
        component: () => import("@/pages/auth/ResetPassword.vue"),
      },
    ],
  },

  // ── Admin Auth (no guestOnly — admin login is separate) ──
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/pages/auth/AdminLogin.vue"),
    meta: { adminGuestOnly: true },
  },

  // ── 404 ──────────────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return false;
    return { top: 0, behavior: "auto" };
  },
});

// ── Navigation Guard ──────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = !!authStore.accessToken;
  const role = authStore.userRole;

  if (isAuthenticated && role === null) {
    try {
      const { useUserStore } = await import("@/stores/userStore");
      const userStore = useUserStore();
      if (!userStore.user) {
        await userStore.fetchMe();
      }
    } catch {
      authStore.clearAuth();
      return next({ name: "Login", query: { redirect: to.fullPath } });
    }
  }

  const resolvedRole = authStore.userRole;

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      const loginRoute =
        to.meta.role === "admin"
          ? { name: "AdminLogin" }
          : {
              name: "Login",
              query: { redirect: sanitizeRedirect(to.fullPath) },
            };
      return next(loginRoute);
    }

    if (to.meta.role) {
      if (resolvedRole !== to.meta.role) {
        return next(
          resolvedRole === "admin"
            ? { name: "AdminDashboard" }
            : { name: "UserDashboard" },
        );
      }
    }
  }

  if (to.meta.guestOnly) {
    if (to.name === "VerifyEmail") return next();

    if (isAuthenticated) {
      return next(
        resolvedRole === "admin"
          ? { name: "AdminDashboard" }
          : { name: "UserDashboard" },
      );
    }
  }

  if (to.meta.adminGuestOnly && isAuthenticated) {
    return next(
      resolvedRole === "admin"
        ? { name: "AdminDashboard" }
        : { name: "UserDashboard" },
    );
  }

  next();
});

router.afterEach((to) => {
  // Hash navigation — jump instantly to the target element.
  // Uses a double rAF so Vue finishes rendering before we measure position,
  // and temporarily overrides CSS scroll-behavior: smooth (if set globally)
  // so the browser never animates past intermediate sections.
  if (to.hash) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(to.hash);
        if (!el) return;

        // Kill smooth scrolling for this jump — restore it after
        document.documentElement.style.scrollBehavior = "auto";
        const container = document.querySelector("[data-scroll-container]");
        if (container) container.style.scrollBehavior = "auto";

        el.scrollIntoView({ block: "start" });

        // Restore on next frame, after the position is applied
        requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = "";
          if (container) container.style.scrollBehavior = "";
        });
      });
    });
    return;
  }

  // Normal navigation — reset scroll to top.
  // DashboardLayout uses overflow-y: auto on [data-scroll-container], not window,
  // so we must scroll both the container AND window to cover all layout types.
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    const container = document.querySelector("[data-scroll-container]");
    if (container) container.scrollTop = 0;
  });
});

function sanitizeRedirect(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("//")) return null;
  return url.startsWith("/") ? url : null;
}

export default router;