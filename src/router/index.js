import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'


const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/components/LoginForm.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/components/RegisterForm.vue'),
        meta: { requiresGuest: true }
    },
    /* Profile Routes */
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/components/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile/edit',
        name: 'profile-edit',
        component: () => import('@/components/ProfileEditForm.vue'),
        meta: { requiresAuth: true }
    },
    /* Personnel Routes */
    {
        path: '/personnel',
        name: 'personnel',
        component: () => import('@/components/Personnel/List.vue'),
        meta: { requiresAuth: true , requiresPersonnel: true }
    },
    {
        path: '/personnel/create',
        name: 'personnel-create',
        component: () => import('@/components/Personnel/Create.vue'),
        meta: { requiresAuth: true , requiresPersonnel: true }
    },
    {
        path: '/personnel/:id/edit',
        name: 'personnel-edit',
        component: () => import('@/components/Personnel/Update.vue'),
        meta: { requiresAuth: true , requiresPersonnel: true }
    },
    /* Provider Routes */
    {
        path: '/provider',
        name: 'provider',
        component: () => import('@/components/Provider/List.vue'),
        meta: { requiresAuth: true , requiresProvider: true }
    },
    {
        path: '/provider/create',
        name: 'provider-create',
        component: () => import('@/components/Provider/Create.vue'),
        meta: { requiresAuth: true , requiresProvider: true }
    },
    {
        path: '/provider/:id/edit',
        name: 'provider-edit',
        component: () => import('@/components/Provider/Update.vue'),
        meta: { requiresAuth: true , requiresProvider: true }
    },
    /* Provider Routes */
    {
        path: '/customer',
        name: 'customer',
        component: () => import('@/components/Customer/List.vue'),
        meta: { requiresAuth: true , requiresCustomer: true },
    },
    {
        path: '/customer/create',
        name: 'customer-create',
        component: () => import('@/components/Customer/Create.vue'),
        meta: { requiresAuth: true , requiresCustomer: true }
    },
    {
        path: '/customer/:id/edit',
        name: 'customer-edit',
        component: () => import('@/components/Customer/Update.vue'),
        meta: { requiresAuth: true , requiresCustomer: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/profile')
    } else {
        if (to.meta.requiresPersonnel && !authStore.isPersonnel) {
            next('/profile')
        } else if (to.meta.requiresProvider && !authStore.isProvider) {
            next('/profile')
        } else if (to.meta.requiresCustomer && !authStore.isCustomer) {
            next('/profile')
        } else {
            next()
        }
    }
})

export default router
