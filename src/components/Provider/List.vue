<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>User Funds</span>
        <v-btn
            :to="{ name: 'provider-create'}"
            text>
          Create
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
            :headers="headers"
            :items="funds"
            :items-per-page="10"
            hide-default-footer
            class="elevation-1"
        >
          <template v-slot:item.edit="{ item }">
            <v-btn
                :to="{ name: 'provider-edit', params: { id: item.id }}"
            >
              Edit
            </v-btn>
          </template>
          <template v-slot:item.delete="{ item }">
            <v-btn
                @click="deleteFund(item.id)"
            >
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.js'

const authStore = useAuthStore()

const funds = ref([])

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Amount', value: 'amount' },
  { text: 'Duration (Months)', value: 'duration_months' },
  { text: 'Created At', value: 'create_at' },
  { text: 'Updated At', value: 'update_at' },
  { text: 'Provider', value: 'provider' },
  { text: 'Loan Type', value: 'loan_type' },
  { text: 'Edit', value: 'edit'},
  { text: 'Delete', value: 'delete' }
]

const loadFunds = async () => {
  try {
    const fundsResponse = await authStore.fetchData(
        'loans/fund/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    funds.value = fundsResponse.results || []
  } catch (error) {
    console.error('Failed to fetch funds:', error)
  }
}

const deleteFund = async (id) => {
  await authStore.fetchData(
      `loans/fund/${id}/`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
      }
  )
  await loadFunds();
}

onMounted(() => {
  loadFunds()
})
</script>