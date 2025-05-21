import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; // Adjust path if necessary

// View Components (Lazy Loaded - define them directly in the routes array)
// No need to assign them to constants here if only used in routes array.

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingView.vue'), // Direct dynamic import
    meta: { redirectIfAuth: true }
  },
  {
    path: '/login', // L&D Manager Login
    name: 'Login',
    component: () => import('../views/LoginView.vue'), // Direct dynamic import
    meta: { requiresGuest: true }
  },
  {
    path: '/employee-login', 
    name: 'EmployeeLogin',
    component: () => import('../views/EmployeeLoginView.vue'), // <<< CORRECTED: Direct dynamic import
    meta: { requiresGuest: true }
  },
  {
    path: '/signup', // L&D Manager Signup
    name: 'Signup',
    component: () => import('../views/SignupView.vue'), // Direct dynamic import
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'LDDashboard',
    component: () => import('../views/LDDashboardView.vue'), // Direct dynamic import
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/employees',
    name: 'EmployeeList',
    component: () => import('../views/EmployeeListView.vue'), // Direct dynamic import
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: () => import('../views/EmployeeDetailView.vue'), // Direct dynamic import
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
  {
    path: '/mylearning/:employeeId',
    name: 'EmployeeLearningPath',
    component: () => import('../views/EmployeeLearningPathView.vue'), // Direct dynamic import
    props: true,
    meta: { requiresAuth: true, requiresEmployeeOrOwner: true }
  },
  {
    path: '/mylearning/:employeeId/step/:stepId',
    name: 'LearningStep',
    component: () => import('../views/LearningStepView.vue'), // Direct dynamic import
    props: true,
    meta: { requiresAuth: true, requiresEmployeeOrOwner: true }
  },
  { 
    path: '/subscription', 
    name: 'Subscription', 
    component: () => import('../views/SubscriptionView.vue'), // Direct dynamic import
    meta: { requiresAuth: true, requiresLDManager: true } 
  },
  { 
    path: '/subscription-success', 
    name: 'SubscriptionSuccess', 
    component: () => import('../views/SubscriptionSuccessView.vue'), // Direct dynamic import
    meta: { requiresAuth: true } 
  },
  { 
    path: '/subscription-canceled', 
    name: 'SubscriptionCanceled', 
    component: () => import('../views/SubscriptionCanceledView.vue'), // Direct dynamic import
    meta: { requiresAuth: true } 
  },
  { 
    path: '/contact', 
    name: 'Contact', 
    component: () => import('../views/ContactView.vue'), // Direct dynamic import
    meta: { redirectIfAuth: false } 
  },
  { 
    path: '/privacy-policy', 
    name: 'PrivacyPolicy', 
    component: () => import('../views/PrivacyPolicyView.vue'), // Direct dynamic import
    meta: { redirectIfAuth: false } 
  },
  { 
    path: '/terms-of-service', 
    name: 'TermsOfService', 
    component: () => import('../views/TermsOfServiceView.vue'), // Direct dynamic import
    meta: { redirectIfAuth: false } 
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue') // Direct dynamic import
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // ... (scrollBehavior remains the same) ...
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const header = document.querySelector('header.sticky');
          const headerOffset = header ? header.offsetHeight : 70;
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

// ... (router.beforeEach guard remains the same as your provided version) ...
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.checkAuthStatus();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);
  const requiresEmployeeOrOwner = to.matched.some(record => record.meta.requiresEmployeeOrOwner);
  const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);


  if (authStore.isAuthenticated) {
    if (redirectIfAuth) {
      if (authStore.isEmployee) next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id } });
      else next({ name: 'LDDashboard' });
      return;
    }
    if (requiresGuest) {
      if (authStore.isEmployee) next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id } });
      else next({ name: 'LDDashboard' });
      return;
    }

    if (requiresLDManager && !authStore.isLdManager) {
      if (authStore.isEmployee) next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id }});
      else next({ name: 'Landing' });
      return;
    }

    if (requiresEmployeeOrOwner) {
      const targetEmployeeId = to.params.employeeId;
      if (authStore.isEmployee && authStore.currentUser._id.toString() !== targetEmployeeId.toString()) {
        next({ name: 'NotFound' });
        return;
      }
    }
    
    if (authStore.isLdManager) {
        const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);
        if (requiresSubscription && !authStore.hasActiveSubscription) {
          if (!['Subscription', 'SubscriptionSuccess', 'SubscriptionCanceled'].includes(to.name)) {
            next({ name: 'Subscription', query: { message: 'Active subscription required.' } });
            return;
          }
        }
    }
    next();
  } else { // Not Authenticated
    if (requiresAuth) {
      if (requiresEmployeeOrOwner || to.name === 'EmployeeLearningPath' || to.name === 'LearningStep') {
        next({ name: 'EmployeeLogin', query: { redirect: to.fullPath } });
      } else {
        next({ name: 'Login', query: { redirect: to.fullPath } });
      }
    } else {
      next();
    }
  }
});


export default router;