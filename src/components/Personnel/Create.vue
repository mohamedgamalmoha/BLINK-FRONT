<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title class="text-h5 text-center py-4">
      <span v-if="isFund">Add Fund Type</span>
      <span v-else>Add Loan Type</span>
    </v-card-title>

    <v-card-text>
      <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSubmit"
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
            Save Product
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
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const notify = inject('notify')

const form = ref(null)
const valid = ref(false)
const name = ref('')
const min_amount = ref('')
const max_amount = ref('')
const interest_rate = ref('')
const min_duration_months = ref('')
const max_duration_months = ref('')
const loading = ref(false)
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
  return router.currentRoute.value.query.isFund
})
const onSubmit = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    let url
    if (isFund) {
      url = 'loans/fund-type/'
    } else {
      url = 'loans/type/'
    }
    console.log(url)

    await authStore.fetchData(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formData.value)
    })
    success.value = 'Loan product added successfully!'
    notify('Loan product added successfully!')
    resetForm()
    router.push('/personnel')
    window.location.reload()
  } catch (err) {
    console.error(err)

    error.value = err.response?.data?.message || 'Failed to add loan product'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  name.value = ''
  min_amount.value = ''
  max_amount.value = ''
  interest_rate.value = ''
  min_duration_months.value = ''
  max_duration_months.value = ''
  error.value = ''

  // Only reset success message if not coming from a successful submission
  if (!success.value) {
    success.value = ''
  }

  if (form.value) {
    form.value.resetValidation()
  }
}
</script>
