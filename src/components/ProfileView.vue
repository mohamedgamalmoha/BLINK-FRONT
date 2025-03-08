<template>
  <v-card class="mx-auto my-12" max-width="600">
    <v-card-title class="text-h5 text-center py-4">
      Your Profile
    </v-card-title>

    <v-card-text>
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar color="primary" class="mr-3">
              <span class="text-h6 text-white">{{ userInitials }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h6">{{ displayName }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-4"></v-divider>

        <v-list-item>
          <template v-slot:prepend>
            <v-icon color="primary" class="mr-3">mdi-account</v-icon>
          </template>
          <v-list-item-title>Username</v-list-item-title>
          <v-list-item-subtitle>{{ user.username }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <v-icon color="primary" class="mr-3">mdi-badge-account</v-icon>
          </template>
          <v-list-item-title>Role</v-list-item-title>
          <v-list-item-subtitle>{{ getRoleName(user.role) }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <v-icon color="primary" class="mr-3">mdi-calendar</v-icon>
          </template>
          <v-list-item-title>Member Since</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(user.date_joined) }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="user.last_login">
          <template v-slot:prepend>
            <v-icon color="primary" class="mr-3">mdi-login</v-icon>
          </template>
          <v-list-item-title>Last Login</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(user.last_login) }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
          color="primary"
          :to="{ name: 'profile-edit' }"
      >
        Edit Profile
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.js'

const authStore = useAuthStore()

const user = await authStore.fetchCurrentUser()

const displayName = computed(() => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  } else if (user.first_name) {
    return user.first_name
  } else {
    return user.username
  }
})

const userInitials = computed(() => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  } else if (user.first_name) {
    return user.first_name[0].toUpperCase()
  } else {
    return user.username[0].toUpperCase()
  }
})

const getRoleName = (roleId) => {
  const roles = {
    0: 'Admin',
    1: 'Personnel',
    2: 'Provider',
    3: 'Customer'
  }
  return roles[roleId] || 'Unknown'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
