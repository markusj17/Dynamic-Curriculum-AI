import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; // Adjust path if needed

// View Components (Lazy Loaded)
const LandingView = () => import('../views/LandingView.vue');
const LoginView = () => import('../views/LoginView.vue');
const SignupView = () => import('../views/SignupView.vue');
const LDDashboardView = () => import('../views/LDDashboardView.vue');
const EmployeeListView = () => import('../views/EmployeeListView.vue'); // Make sure this file exists
const EmployeeDetailView = () => import('../views/EmployeeDetailView.vue');
const SubscriptionView = () => import('../views/SubscriptionView.vue');
const SubscriptionSuccessView = () => import('../views/SubscriptionSuccessView.vue');
const SubscriptionCanceledView = () => import('../views/SubscriptionCanceledView.vue');
const TermsOfServiceView = () => import('../views/TermsOfServiceView.vue'); // Make sure this file exists
const PrivacyPolicyView = () => import('../views/PrivacyPolicyView.vue');
const EmployeeLearningPathView = () => import('../views/EmployeeLearningPathView.vue'); // Make sure this file exists
const NotFoundView = () => import('../views/NotFoundView.vue');

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView,
    meta: {
      
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'LDDashboard',
    component: LDDashboardView,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/employees',
    name: 'EmployeeList',
    component: EmployeeListView,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: EmployeeDetailView,
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/mylearning/:pathId',
    name: 'EmployeeLearningPath',
    component: EmployeeLearningPathView, // Make sure this file exists
    props: true,
    meta: { requiresAuth: true /*, requiresEmployeeRole: true */ }
  },
  {
    path: '/subscription',
    name: 'Subscription',
    component: SubscriptionView,
    meta: { requiresAuth: true } // Does not require active subscription to view/manage
  },
  {
    path: '/subscription-success',
    name: 'SubscriptionSuccess',
    component: SubscriptionSuccessView,
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription-canceled',
    name: 'SubscriptionCanceled',
    component: SubscriptionCanceledView,
    meta: { requiresAuth: true }
  },
  { path: '/terms-of-service', name: 'TermsOfService', component: TermsOfServiceView },
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicyView },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 70 }; // Adjust top offset
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Ensure auth status is checked, especially on page reload or direct navigation
  if (localStorage.getItem('token') && !authStore.user && !authStore.isFetchingCurrentUser) {
    // Added !authStore.isFetchingCurrentUser to prevent multiple calls if navigation is rapid
    await authStore.checkAuthStatus();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);

  if (redirectIfAuth && authStore.isAuthenticated) {
    console.log("Router: Authenticated user accessing Landing/Public page. Redirecting to dashboard.");
    next({ name: 'LDDashboard' });
  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log("Router: Authenticated user accessing Login/Signup. Redirecting to dashboard.");
    next({ name: 'LDDashboard' });
  } else if (requiresAuth && !authStore.isAuthenticated) {
    console.log("Router: Unauthenticated user accessing protected route. Redirecting to login for:", to.fullPath);
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAuth && authStore.isAuthenticated) {
    console.log("Router: Authenticated user. Checking further requirements for:", to.name);
    const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);
    const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);

    if (requiresSubscription && !authStore.hasActiveSubscription) {
      if (!['Subscription', 'SubscriptionSuccess', 'SubscriptionCanceled'].includes(to.name)) {
        console.log("Router: Subscription required for", to.name, ". Redirecting to Subscription page.");
        next({ name: 'Subscription', query: { message: 'An active subscription is required.' } });
        return;
      }
    }

    if (requiresLDManager && !authStore.isLdManager) {
      console.log("Router: LD Manager role required for", to.name, ". Redirecting to NotFound.");
      next({ name: 'NotFound' });
      return;
    }
    console.log("Router: All checks passed for authenticated route", to.name);
    next();
  } else {
    console.log("Router: Public route or no specific guard matched for", to.name);
    next();
  }
});

export default router;