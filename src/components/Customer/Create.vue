<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      Add Loan
    </v-card-title>

    <v-card-text>
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
            Save Loan
          </v-btn>

          <v-btn
              color="secondary"
              block
              @click="resetForm"
              :disabled="loading"
          >
            Reset Form
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const notify = inject('notify')

const form = ref(null)
const valid = ref(false)
const amount = ref('')
const duration_months = ref('')
const start_at = ref(null) // Default to current date
const loan_type = ref(null)
const loading = ref(false)
const loadingLoanTypes = ref(true)
const error = ref('')
const success = ref('')
const loanTypes = ref([])

const rules = {
  required: v => !!v || 'This field is required',
  positiveNumber: v => (v && parseFloat(v) >= 0) || 'Must be a positive number',
  positiveInteger: v => (v && parseInt(v) > 0) || 'Must be a positive integer'
}

function formattedDate(date) {
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
    const url = 'loans/'

    await authStore.fetchData(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formData.value)
    })

    success.value = 'Loan added successfully!'
    notify('Loan added successfully!')
    resetForm()
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to add loan'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  amount.value = ''
  duration_months.value = ''
  start_at.value = null
  loan_type.value = null
  error.value = ''

  // Only reset success message if not coming from a successful submission
  if (!success.value) {
    success.value = ''
  }

  if (form.value) {
    form.value.resetValidation()
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
  fetchLoanTypes()
})
</script>
