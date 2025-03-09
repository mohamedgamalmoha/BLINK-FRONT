<template>
  <v-card class="mx-auto my-12" max-width="600">
    <v-card-title class="text-h5 text-center py-4">
      Edit Your Profile
    </v-card-title>

    <v-card-text>
      <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSubmit"
      >
        <v-text-field
            v-model="formData.username"
            label="Username"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="formData.first_name"
            label="First Name"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="formData.last_name"
            label="Last Name"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
            disabled
        />

        <v-divider class="my-4"></v-divider>

        <v-alert
            v-if="error"
            type="error"
            class="mt-4"
        >
          {{ error }}
        </v-alert>

        <div class="d-flex justify-space-between mt-6">
          <v-btn
              color="secondary"
              :to="{ name: 'profile' }"
          >
            Cancel
          </v-btn>

          <v-btn
              color="primary"
              type="submit"
              :loading="loading"
              :disabled="!valid"
          >
            Save Changes
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const notify = inject('notify')
const user = computed(() => authStore.currentUser)

const form = ref(null)
const valid = ref(true)
const formData = reactive({
  id: user.value.id,
  username: user.value.username || '',
  first_name: user.value.first_name || '',
  last_name: user.value.last_name || '',
  email: user.value.email || '',
})

const loading = ref(false)
const error = ref('')

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Email must be valid'
}

const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''

  // Only include password if it was changed
  const updateData = { ...formData }
  if (!updateData.password) {
    delete updateData.password
  }

  try {
    await authStore.fetchData(`users/${user.value.id}/`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
    notify('Profile updated successfully!')
    await authStore.fetchCurrentUser(true)
    router.push({ name: 'profile' })
    window.location.reload()
  } catch (err) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}
</script>
