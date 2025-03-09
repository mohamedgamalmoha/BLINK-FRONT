<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      Create New Account
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
            v-model="firstName"
            label="First Name"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="lastName"
            label="Last Name"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
        />

        <v-select
            v-model="role"
            label="Account Type"
            :items="roleOptions"
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

        <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showConfirmPassword ? 'text' : 'password'"
            :rules="[rules.required, passwordMatch]"
            @click:append="showConfirmPassword = !showConfirmPassword"
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
            Register
          </v-btn>

          <div class="text-center">
            Already have an account?
            <router-link to="/login">Login</router-link>
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

const router = useRouter()
const authStore = useAuthStore()
const notify = inject('notify')

const form = ref(null)
const valid = ref(false)
const username = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const role = ref(3) // Default to Customer (3)
const roleOptions = [
  { title: 'Provider', value: 2 },
  { title: 'Customer', value: 3 }
]
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
  min: v => v.length >= 6 || 'Password must be at least 6 characters'
}

const passwordMatch = () => {
  return password.value === confirmPassword.value || 'Passwords do not match'
}

const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      username: username.value,
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      role: Number(role.value),
      password: password.value
    })
    notify('Registration successful!')
    router.push({ name: 'profile' })
    window.location.reload();
  } catch (err) {
    error.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>