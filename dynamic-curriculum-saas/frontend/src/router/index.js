import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; // Adjust path if necessary

// View Components (Lazy Loaded)
const LandingView = () => import('../views/LandingView.vue');
const LoginView = () => import('../views/LoginView.vue');
const SignupView = () => import('../views/SignupView.vue');
const LDDashboardView = () => import('../views/LDDashboardView.vue');
const EmployeeListView = () => import('../views/EmployeeListView.vue'); // You added this - good!
const EmployeeDetailView = () => import('../views/EmployeeDetailView.vue');
const EmployeeLearningPathView = () => import('../views/EmployeeLearningPathView.vue');
const LearningStepView = () => import('../views/LearningStepView.vue'); // <<< NEW: For individual interactive steps
const SubscriptionView = () => import('../views/SubscriptionView.vue');
const SubscriptionSuccessView = () => import('../views/SubscriptionSuccessView.vue');
const SubscriptionCanceledView = () => import('../views/SubscriptionCanceledView.vue');
const NotFoundView = () => import('../views/NotFoundView.vue');
const ContactView = () => import('../views/ContactView.vue');
const PrivacyPolicyView = () => import('../views/PrivacyPolicyView.vue');
const TermsOfServiceView = () => import('../views/TermsOfServiceView.vue');


const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView,
    meta: { redirectIfAuth: true } // Corrected: if authenticated, redirect from landing
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
    path: '/employees/:id', // 'id' here is employeeId for detail view
    name: 'EmployeeDetail',
    component: EmployeeDetailView,
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/mylearning/:employeeId', // Renamed pathId to employeeId for clarity
    name: 'EmployeeLearningPath',    // This view would list all steps of a path
    component: EmployeeLearningPathView,
    props: true, // employeeId will be passed as a prop
    meta: { requiresAuth: true } // Or public if links are shareable without login
  },
  {
    path: '/mylearning/:employeeId/step/:stepId', // <<< NEW ROUTE for individual step view
    name: 'LearningStep',
    component: LearningStepView, // You will need to create this view component
    props: true, // employeeId and stepId will be passed as props
    meta: { requiresAuth: true } // Or public, consistent with EmployeeLearningPath
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
  { path: '/contact', name: 'Contact', component: ContactView, meta: { redirectIfAuth: false } }, // Public page
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicyView, meta: { redirectIfAuth: false } },
  { path: '/terms-of-service', name: 'TermsOfService', component: TermsOfServiceView, meta: { redirectIfAuth: false } },
  {
    path: '/:pathMatch(.*)*', // Catch-all for 404 Not Found
    name: 'NotFound',
    component: NotFoundView
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Offset for sticky header if you have one
          const headerOffset = document.querySelector('header.sticky') ? document.querySelector('header.sticky').offsetHeight : 0;
          resolve({ el: to.hash, behavior: 'smooth', top: headerOffset });
        }, 100); // Short delay for DOM to be ready
      });
    } else if (savedPosition) {
      return savedPosition;
    } else {
      // Scroll to top for new page navigations, unless it's just a hash change on the same page
      if (to.path !== from.path || Object.keys(to.query).length !== Object.keys(from.query).length) {
        return { top: 0, behavior: 'smooth' };
      }
    }
    return false; // Prevent scrolling if only hash changes and already handled or no change needed
  }
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Ensure auth status is checked, especially on page reload or direct navigation
  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.checkAuthStatus();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);

  if (redirectIfAuth && authStore.isAuthenticated) {
    // If trying to access a page like Landing while already logged in, redirect to dashboard
    next({ name: 'LDDashboard' });
  } else if (requiresGuest && authStore.isAuthenticated) {
    // If trying to access login/signup while already logged in, redirect to dashboard
    next({ name: 'LDDashboard' });
  } else if (requiresAuth && !authStore.isAuthenticated) {
    // If route requires authentication and user is not logged in, redirect to login
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAuth && authStore.isAuthenticated) {
    // User is authenticated and accessing a protected route, proceed with other checks
    const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);
    const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);

    // Check for active subscription if required by the route
    if (requiresSubscription && !authStore.hasActiveSubscription) {
      if (!['Subscription', 'SubscriptionSuccess', 'SubscriptionCanceled'].includes(to.name)) {
        next({ name: 'Subscription', query: { message: 'Active subscription required to access this page.' } });
        return;
      }
    }

    // Role checks (e.g., L&D Manager)
    if (requiresLDManager && !authStore.isLdManager) {
      next({ name: 'NotFound' }); // Or a specific 'Access Denied' page/view
      return;
    }
    next();
  } else {
    // For public routes or if no specific conditions above are met
    next();
  }
});

export default router;