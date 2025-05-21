import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

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
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: EmployeeDetailView,
    props: true,
    meta: { requiresAuth: true, requiresLDManager: true, requiresSubscription: true }
  },
   {
    path: '/employee-login', 
    name: 'EmployeeLogin',
    component: EmployeeLoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/mylearning/:employeeId',
    name: 'EmployeeLearningPath',
    component: EmployeeLearningPathView,
    props: true,
    meta: { requiresAuth: true, requiresEmployeeRole: true }
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.checkAuthStatus();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);
  const requiresLDManager = to.matched.some(record => record.meta.requiresLDManager);
  const requiresEmployeeOrOwner = to.matched.some(record => record.meta.requiresEmployeeOrOwner);

  if (authStore.isAuthenticated) {
    if (redirectIfAuth) { 
      if (authStore.isEmployee) {
        next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id } });
      } else { 
        next({ name: 'LDDashboard' });
      }
      return;
    }
    if (requiresGuest) { 
      if (authStore.isEmployee) {
        next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id } });
      } else {
        next({ name: 'LDDashboard' });
      }
      return;
    }

    if (requiresLDManager && !authStore.isLdManager) {

      if (authStore.isEmployee) {
          next({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id }});
      } else {
          next({ name: 'Landing' }); 
      }
      return;
    }

    if (requiresEmployeeOrOwner) {
      const targetEmployeeId = to.params.employeeId;
      if (authStore.isEmployee) {
        if (authStore.currentUser._id.toString() !== targetEmployeeId.toString()) {
          next({ name: 'NotFound' });
          return;
        }
      } else if (authStore.isLdManager) {

        console.log(`L&D Manager accessing employee path for ${targetEmployeeId}. Backend will verify company.`);
      } else {
        next({ name: 'Login' }); 
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

  } else {
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