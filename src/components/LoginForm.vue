<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      Login to Your Account
    </v-card-title>

    <v-card-text>
      <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSubmit"
      >
        <v-text-field
            v-model="username"
            label="Username"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="password"
            label="Password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            :rules="[rules.required, rules.min]"
            @click:append="showPassword = !showPassword"
        />

        <v-alert
            v-if="error"
            type="error"
            class="mt-4"
        >
          {{ error }}
        </v-alert>

        <div class="d-flex flex-column gap-4 mt-6">
          <v-btn
              color="primary"
              type="submit"
              block
              :loading="loading"
              :disabled="!valid"
          >
            Login
          </v-btn>

          <div class="text-center">
            Don't have an account?
            <router-link to="/register">Register</router-link>
          </div>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { nextTick } from 'vue';

const router = useRouter()
const authStore = useAuthStore()
const notify = inject('notify')

const form = ref(null)
const valid = ref(false)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: v => !!v || 'This field is required',
  min: v => v.length >= 6 || 'Password must be at least 6 characters'
}

const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.login({
      username: username.value,
      password: password.value
    })
    notify('Login successful!')
    await nextTick()
    router.push('/profile')
    // window.location.reload();
  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
