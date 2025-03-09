<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      <span v-if="isFund">Edit Fund Type</span>
      <span v-else>Edit Loan Type</span>
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
            v-model="name"
            label="Loan Type Name"
            :rules="[rules.required]"
        />

        <v-text-field
            v-model="min_amount"
            label="Minimum Amount"
            type="number"
            :rules="[rules.required, rules.positiveNumber]"
        />

        <v-text-field
            v-model="max_amount"
            label="Maximum Amount"
            type="number"
            :rules="[rules.required, rules.positiveNumber, rules.maxAmount]"
        />

        <v-text-field
            v-model="interest_rate"
            label="Interest Rate (%)"
            type="number"
            step="0.01"
            :rules="[rules.required, rules.positiveNumber]"
        />

        <v-text-field
            v-model="min_duration_months"
            label="Minimum Duration (Months)"
            type="number"
            :rules="[rules.required, rules.positiveInteger]"
        />

        <v-text-field
            v-model="max_duration_months"
            label="Maximum Duration (Months)"
            type="number"
            :rules="[rules.required, rules.positiveInteger, rules.maxDuration]"
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
              :disabled="!valid"
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
const name = ref('')
const min_amount = ref('')
const max_amount = ref('')
const interest_rate = ref('')
const min_duration_months = ref('')
const max_duration_months = ref('')
const loading = ref(false)
const isLoading = ref(true)
const error = ref('')
const success = ref('')

const rules = {
  required: v => !!v || 'This field is required',
  positiveNumber: v => (v && parseFloat(v) >= 0) || 'Must be a positive number',
  positiveInteger: v => (v && parseInt(v) > 0) || 'Must be a positive integer',
  maxAmount: v => !min_amount.value || parseFloat(v) >= parseFloat(min_amount.value) || 'Maximum amount must be greater than minimum amount',
  maxDuration: v => !min_duration_months.value || parseInt(v) >= parseInt(min_duration_months.value) || 'Maximum duration must be greater than minimum duration'
}

const formData = computed(() => {
  return {
    name: name.value,
    min_amount: parseFloat(min_amount.value),
    max_amount: parseFloat(max_amount.value),
    interest_rate: parseFloat(interest_rate.value),
    min_duration_months: parseInt(min_duration_months.value),
    max_duration_months: parseInt(max_duration_months.value)
  }
})

const isFund = computed(() => {
  return route.query.isFund === 'true'
})

// Fetch loan type data by ID
const fetchLoanTypeData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const url = isFund.value
        ? `loans/fund-type/${id.value}/`
        : `loans/type/${id.value}/`

    const response = await authStore.fetchData(url, {
      method: 'GET'
    })

    // Populate form fields with fetched data
    name.value = response.name
    min_amount.value = response.min_amount.toString()
    max_amount.value = response.max_amount.toString()
    interest_rate.value = response.interest_rate.toString()
    min_duration_months.value = response.min_duration_months.toString()
    max_duration_months.value = response.max_duration_months.toString()
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to fetch loan type data'
    notify('Failed to fetch loan type data', 'error')
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
    const url = isFund.value
        ? `loans/fund-type/${id.value}/`
        : `loans/type/${id.value}/`

    await authStore.fetchData(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT', // Using PUT for updates
      body: JSON.stringify(formData.value)
    })

    success.value = 'Loan product updated successfully!'
    notify('Loan product updated successfully!')
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to update loan product'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  // Instead of clearing fields, fetch the original data again
  fetchLoanTypeData()
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
onMounted(() => {
  fetchLoanTypeData()
})
</script>