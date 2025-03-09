<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      Edit Loan
    </v-card-title>

    <v-card-text>
      <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          class="d-flex mx-auto my-8"
      >
      </v-progress-circular>
      <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSubmit"
      >
        <v-text-field
            v-model="amount"
            label="Loan Amount"
            type="number"
            :rules="[rules.required, rules.positiveNumber]"
        />

        <v-text-field
            v-model="duration_months"
            label="Duration (Months)"
            type="number"
            :rules="[rules.required, rules.positiveInteger]"
        />

        <v-date-picker
            v-model="start_at"
            label="Start Date"
            :rules="[rules.required]"
            class="mb-4"
        ></v-date-picker>

        <v-select
            v-model="loan_type"
            :items="loanTypes"
            item-title="name"
            item-value="id"
            label="Loan Type"
            :rules="[rules.required]"
            :loading="loadingLoanTypes"
            :disabled="loadingLoanTypes"
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
              :disabled="!valid || loadingLoanTypes"
          >
            Update Loan
          </v-btn>

          <v-btn
              color="secondary"
              block
              @click="resetForm"
              :disabled="loading"
          >
            Reset to Original
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
const loanId = route.params.id // Get loan ID from URL
const authStore = useAuthStore()
const notify = inject('notify')

const form = ref(null)
const valid = ref(false)
const amount = ref('')
const duration_months = ref('')
const start_at = ref(null)
const loan_type = ref(null)
const loading = ref(false)
const isLoading = ref(true) // Initial loading state while fetching loan data
const loadingLoanTypes = ref(true)
const error = ref('')
const success = ref('')
const loanTypes = ref([])
const originalLoanData = ref(null) // Store original data for reset functionality

const rules = {
  required: v => !!v || 'This field is required',
  positiveNumber: v => (v && parseFloat(v) >= 0) || 'Must be a positive number',
  positiveInteger: v => (v && parseInt(v) > 0) || 'Must be a positive integer'
}

function formattedDate(date) {
  if (!date) return null;

  // Handle string dates
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null;
    date = parsedDate;
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const formData = computed(() => {
  return {
    amount: amount.value,
    duration_months: parseInt(duration_months.value),
    start_at: formattedDate(start_at.value),
    loan_type: loan_type.value
  }
})

const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const url = `loans/${loanId}/`

    await authStore.fetchData(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT', // Using PUT for updates
      body: JSON.stringify(formData.value)
    })

    success.value = 'Loan updated successfully!'
    notify('Loan updated successfully!')
    setTimeout(() => {
      router.push('/customer')
    }, 1500)
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to update loan'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  // Reset to original data instead of clearing
  if (originalLoanData.value) {
    amount.value = originalLoanData.value.amount || ''
    duration_months.value = originalLoanData.value.duration_months || ''
    start_at.value = originalLoanData.value.start_at || null
    loan_type.value = originalLoanData.value.loan_type || null
  }

  error.value = ''
  success.value = ''

  if (form.value) {
    form.value.resetValidation()
  }
}

const fetchLoanData = async () => {
  isLoading.value = true
  try {
    const response = await authStore.fetchData(
        `loans/${loanId}/`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )

    // Store original data for reset functionality
    originalLoanData.value = { ...response }

    // Populate form with existing data
    amount.value = response.amount || ''
    duration_months.value = response.duration_months || ''

    // Convert string date to Date object if needed
    if (response.start_at) {
      try {
        start_at.value = new Date(response.start_at)
      } catch (e) {
        console.error('Error parsing date:', e)
        start_at.value = null
      }
    }

    loan_type.value = response.loan_type || null

  } catch (err) {
    console.error('Failed to fetch loan data:', err)
    error.value = 'Failed to load loan data. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const fetchLoanTypes = async () => {
  loadingLoanTypes.value = true
  try {
    const response = await authStore.fetchData(
        'loans/type/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    loanTypes.value = response.results || []
  } catch (err) {
    console.error('Failed to fetch loan types:', err)
    error.value = 'Failed to load loan types. Please refresh the page.'
  } finally {
    loadingLoanTypes.value = false
  }
}

onMounted(() => {
  // Fetch loan types and loan data
  Promise.all([
    fetchLoanTypes(),
    fetchLoanData()
  ]).catch(err => {
    console.error('Error during initialization:', err)
  })
})
</script>