<template>
  <v-app-bar
      color="primary"
      dark
      app
  >
    <v-app-bar-title>Blink App</v-app-bar-title>

    <v-spacer></v-spacer>

    <template v-if="isAuthenticated">
      <v-btn
          :to="{ name: 'profile' }"
          text
      >
        Profile
      </v-btn>
      <v-btn v-if="isPersonnel"
             :to="{ name: 'provider' }"
             text
      >
        Provider
      </v-btn>
      <v-btn v-if="isProvider"
          :to="{ name: 'personnel' }"
          text
      >
        Personnel
      </v-btn>
      <v-btn v-if="isCustomer"
             :to="{ name: 'customer' }"
             text
      >
        Customer
      </v-btn>
      <v-btn
          @click="logout"
          text
      >
        Logout
      </v-btn>
    </template>
    <template v-else>
      <v-btn
          :to="{ name: 'login' }"
          text
      >
        Login
      </v-btn>
      <v-btn
          :to="{ name: 'register' }"
          text
      >
        Register
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isPersonnel = computed(() => authStore.isPersonnel)
const isProvider = computed(() => authStore.isProvider)
const isCustomer = computed(() => authStore.isCustomer)

const logout = () => {
  authStore.logout()
}
</script>
