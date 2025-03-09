<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      Edit Fund
    </v-card-title>

    <v-card-text>
      <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          class="d-flex mx-auto my-8"
      ></v-progress-circular>

      <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSubmit"
          v-else
      >
        <v-text-field
            v-model="amount"
            label="Fund Amount"
            type="number"
            :rules="[rules.required, rules.positiveNumber]"
        />

        <v-text-field
            v-model="duration_months"
            label="Duration (Months)"
            type="number"
            :rules="[rules.required, rules.positiveInteger]"
        />

        <v-select
            v-model="loan_type"
            :items="fundTypes"
            item-title="name"
            item-value="id"
            label="Fund Type"
            :rules="[rules.required]"
            :loading="loadingFundTypes"
            :disabled="loadingFundTypes"
        />

        <v-alert
            v-if="error"
            type="error"
            class="mt-4"
        >
          {{ error }}
        </v-alert>

        <v-alert
            v-if="success"
            type="success"
            class="mt-4"
        >
          {{ success }}
        </v-alert>

        <div class="d-flex flex-column gap-4 mt-6">
          <v-btn
              color="primary"
              type="submit"
              block
              :loading="loading"
              :disabled="!valid || loadingFundTypes"
          >
            Save Changes
          </v-btn>

          <v-btn
              color="secondary"
              block
              @click="resetForm"
              :disabled="loading"
          >
            Reset Form
          </v-btn>

          <v-btn
              color="error"
              block
              @click="goBack"
              :disabled="loading"
          >
            Cancel
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notify = inject('notify')

const id = computed(() => route.params.id)
const form = ref(null)
const valid = ref(false)
const amount = ref('')
const duration_months = ref('')
const loan_type = ref(null)
const loading = ref(false)
const isLoading = ref(true)
const loadingFundTypes = ref(true)
const error = ref('')
const success = ref('')
const fundTypes = ref([])

const rules = {
  required: v => !!v || 'This field is required',
  positiveNumber: v => (v && parseFloat(v) >= 0) || 'Must be a positive number',
  positiveInteger: v => (v && parseInt(v) > 0) || 'Must be a positive integer'
}

const formData = computed(() => {
  return {
    amount: amount.value,
    duration_months: parseInt(duration_months.value),
    loan_type: loan_type.value
  }
})

// Fetch fund types
const fetchFundTypes = async () => {
  loadingFundTypes.value = true
  try {
    const response = await authStore.fetchData(
        'loans/fund-type/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    fundTypes.value = response.results || []
  } catch (err) {
    console.error('Failed to fetch fund types:', err)
    error.value = 'Failed to load fund types. Please refresh the page.'
  } finally {
    loadingFundTypes.value = false
  }
}

// Fetch fund data by ID
const fetchFundData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const url = `loans/fund/${id.value}/`

    const response = await authStore.fetchData(url, {
      method: 'GET'
    })

    // Populate form fields with fetched data
    amount.value = response.amount.toString()
    duration_months.value = response.duration_months.toString()
    loan_type.value = response.loan_type
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to fetch fund data'
    notify('Failed to fetch fund data', 'error')
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const url = `loans/fund/${id.value}/`

    await authStore.fetchData(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT', // Using PUT for updates
      body: JSON.stringify(formData.value)
    })

    success.value = 'Fund updated successfully!'
    notify('Fund updated successfully!')
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to update fund'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  // Instead of clearing fields, fetch the original data again
  fetchFundData()
  error.value = ''
  success.value = ''

  if (form.value) {
    form.value.resetValidation()
  }
}

const goBack = () => {
  router.back()
}

// Fetch data when component mounts
onMounted(async () => {
  await fetchFundTypes()
  await fetchFundData()
})
</script>