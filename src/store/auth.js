import { defineStore } from 'pinia'
import authService from '@/services/auth.service'
import router from '@/router'


export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
    }),

    getters: {
        currentUser: (state) => state.user,
        isAuthenticated: () => authService.isAuthenticated(),
        isAdmin: (state) => state.user && state.user.role === 0,
        isProvider: (state) => state.user && state.user.role === 2,
        isCustomer: (state) => state.user && state.user.role === 3,
        isPersonnel: (state) => state.user && state.user.role === 1,
    },

    actions: {
        getUser() {
            return this.user
        },

        setUser(user) {
            this.user = user
            localStorage.setItem('user', JSON.stringify(user))
        },

        async login({ username, password }) {
            try {
                // Updated to match auth service which expects username and password separately
                const userData = await authService.login(username, password)
                this.setUser(userData)
                return Promise.resolve(userData)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        async register(userData) {
            try {
                const response = await authService.register(userData)
                // After successful registration, we can either:
                // 1. Set the user directly if the API returns user data
                // 2. Log them in automatically if needed
                if (response.user) {
                    this.setUser(response.user)
                }
                return Promise.resolve(response)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        async logout() {
            try {
                // The authService.logout will clear localStorage credentials
                await authService.logout()
            } catch (error) {
                console.warn('Error during logout:', error)
            } finally {
                // Clear store state regardless of server response
                this.user = null
                localStorage.removeItem('user')
                await router.push('/login')
            }
        },

        async fetchCurrentUser(forceReload = false) {
            try {
                // Only attempt to fetch if we're authenticated
                if (!this.isAuthenticated) {
                    return Promise.reject(new Error('Not authenticated'))
                }

                // If user exists and not forcing reload, return current user
                if (this.user && !forceReload) {
                    return this.getUser()
                }

                // Otherwise, fetch from API
                const userData = await authService.getCurrentUser()
                this.setUser(userData)
                return Promise.resolve(userData)
            } catch (error) {
                // If we can't fetch the user, we're likely not authenticated
                await this.logout()
                return Promise.reject(error)
            }
        },

        async fetchData(endpoint, options = {}) {
            try {
                return await authService.fetchAuthenticated(endpoint, options)
            } catch (error) {
                // If the error is authentication related, log the user out
                if (error.message.includes('authentication') || error.message.includes('401')) {
                    await this.logout()
                }
                return Promise.reject(error)
            }
        },
    }
})
