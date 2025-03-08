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
        next()
    }
})

export default router
