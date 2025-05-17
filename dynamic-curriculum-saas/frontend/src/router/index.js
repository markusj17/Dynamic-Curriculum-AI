import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const LandingView = () => import('../views/LandingView.vue');
const LoginView = () => import('../views/LoginView.vue');
const SignupView = () => import('../views/SignupView.vue');
const LDDashboardView = () => import('../views/LDDashboardView.vue');
const EmployeeDetailView = () => import('../views/EmployeeDetailView.vue');
const EmployeeLearningPathView = () => import('../views/EmployeeLearningPathView.vue');
const SubscriptionView = () => import('../views/SubscriptionView.vue');
const SubscriptionSuccessView = () => import('../views/SubscriptionSuccessView.vue');
const SubscriptionCanceledView = () => import('../views/SubscriptionCanceledView.vue');
const NotFoundView = () => import('../views/NotFoundView.vue');

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView,
    meta: {
      redirectIfAuth: true
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
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: EmployeeDetailView,
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/mylearning/:pathId',
    name: 'EmployeeLearningPath',
    component: EmployeeLearningPathView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription',
    name: 'Subscription',
    component: SubscriptionView,
    meta: { requiresAuth: true }
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
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 70 };
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.checkAuthStatus();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);

  if (redirectIfAuth && authStore.isAuthenticated) {
    console.log("Router: Authenticated user accessing redirectIfAuth route. Redirecting to dashboard.");
    next({ name: 'LDDashboard' });

  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log("Router: Authenticated user accessing requiresGuest route. Redirecting to dashboard.");
    next({ name: 'LDDashboard' });

  } else if (requiresAuth && !authStore.isAuthenticated) {
    console.log("Router: Unauthenticated user accessing requiresAuth route. Redirecting to login.");
    next({ name: 'Login', query: { redirect: to.fullPath } });

  } else if (requiresAuth && authStore.isAuthenticated) {
    console.log("Router: Authenticated user accessing requiresAuth route. Proceeding with checks.");
    const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);
    const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);

    if (requiresSubscription && !authStore.hasActiveSubscription) {
      if (!['Subscription', 'SubscriptionSuccess', 'SubscriptionCanceled'].includes(to.name)) {
        console.log("Router: Subscription required. Redirecting to Subscription page.");
        next({ name: 'Subscription', query: { message: 'Active subscription required to access this page.' } });
        return;
      }
    }

    if (requiresLDManager && !authStore.isLdManager) {
      console.log("Router: LD Manager role required. Redirecting to NotFound (or Access Denied).");
      next({ name: 'NotFound' });
      return;
    }
    console.log("Router: All checks passed for authenticated route. Calling next().");
    next();
  } else {
    console.log("Router: Public route or no specific guard matched. Calling next().");
    next();
  }
});

export default router;