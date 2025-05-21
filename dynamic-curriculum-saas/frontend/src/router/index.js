import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; // Adjust path if necessary

// View Components (Lazy Loaded)
const LandingView = () => import('../views/LandingView.vue');
const LoginView = () => import('../views/LoginView.vue');
const SignupView = () => import('../views/SignupView.vue');
const LDDashboardView = () => import('../views/LDDashboardView.vue');
const EmployeeListView = () => import('../views/EmployeeListView.vue');
const EmployeeDetailView = () => import('../views/EmployeeDetailView.vue');
const EmployeeLearningPathView = () => import('../views/EmployeeLearningPathView.vue');
const LearningStepView = () => import('../views/LearningStepView.vue');
const SubscriptionView = () => import('../views/SubscriptionView.vue');
const SubscriptionSuccessView = () => import('../views/SubscriptionSuccessView.vue');
const SubscriptionCanceledView = () => import('../views/SubscriptionCanceledView.vue');
const NotFoundView = () => import('../views/NotFoundView.vue');
const ContactView = () => import('../views/ContactView.vue');
const PrivacyPolicyView = () => import('../views/PrivacyPolicyView.vue');
const TermsOfServiceView = () => import('../views/TermsOfServiceView.vue');

const routes = [
  { path: '/', name: 'Landing', component: LandingView, meta: { redirectIfAuth: true } },
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/signup', name: 'Signup', component: SignupView, meta: { requiresGuest: true } },
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
    path: '/employees/:id', // 'id' here is employeeId for detail view
    name: 'EmployeeDetail',
    component: EmployeeDetailView,
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/mylearning/:employeeId', // Using employeeId consistently
    name: 'EmployeeLearningPath',
    component: EmployeeLearningPathView,
    props: true,
    meta: { requiresAuth: true } // Or public, depends on your access model
  },
  {
    path: '/mylearning/:employeeId/step/:stepId',
    name: 'LearningStep',
    component: LearningStepView,
    props: true,
    meta: { requiresAuth: true } // Or public
  },
  { path: '/subscription', name: 'Subscription', component: SubscriptionView, meta: { requiresAuth: true }},
  { path: '/subscription-success', name: 'SubscriptionSuccess', component: SubscriptionSuccessView, meta: { requiresAuth: true }},
  { path: '/subscription-canceled', name: 'SubscriptionCanceled', component: SubscriptionCanceledView, meta: { requiresAuth: true }},
  { path: '/contact', name: 'Contact', component: ContactView, meta: { redirectIfAuth: false } },
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicyView, meta: { redirectIfAuth: false } },
  { path: '/terms-of-service', name: 'TermsOfService', component: TermsOfServiceView, meta: { redirectIfAuth: false } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const header = document.querySelector('header.sticky'); // Assuming sticky header has 'sticky' class
          const headerOffset = header ? header.offsetHeight : 70; // Default offset
          resolve({ el: to.hash, behavior: 'smooth', top: headerOffset });
        }, 100);
      });
    } else if (savedPosition) {
      return savedPosition;
    } else {
      if (to.path !== from.path || Object.keys(to.query).length !== Object.keys(from.query).length) {
        return { top: 0, behavior: 'smooth' };
      }
    }
    return false;
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
    next({ name: 'LDDashboard' });
  } else if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'LDDashboard' });
  } else if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAuth && authStore.isAuthenticated) {
    const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);
    const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);

    if (requiresSubscription && !authStore.hasActiveSubscription) {
      if (!['Subscription', 'SubscriptionSuccess', 'SubscriptionCanceled'].includes(to.name)) {
        next({ name: 'Subscription', query: { message: 'Active subscription required.' } });
        return;
      }
    }
    if (requiresLDManager && !authStore.isLdManager) {
      next({ name: 'NotFound' });
      return;
    }
    next();
  } else {
    next();
  }
});

export default router;