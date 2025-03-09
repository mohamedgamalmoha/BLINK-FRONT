<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>User Loans</span>
        <v-btn
            :to="{ name: 'customer-create'}"
            text>
          Create
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
            :headers="headers"
            :items="loans"
            :items-per-page="10"
            hide-default-footer
            class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
                :color="getStatusColor(item.status)"
                dark
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          <template v-slot:item.edit="{ item }">
            <v-btn
                :to="{ name: 'customer-edit', params: { id: item.id }}"
            >
              Edit
            </v-btn>
          </template>
          <template v-slot:item.delete="{ item }">
            <v-btn
                @click="deleteLoan(item.id)"
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

const loans = ref([])

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Status', value: 'status' },
  { text: 'Amount', value: 'amount' },
  { text: 'Duration (Months)', value: 'duration_months' },
  { text: 'Start Date', value: 'start_at' },
  { text: 'Created At', value: 'create_at' },
  { text: 'Updated At', value: 'update_at' },
  { text: 'Customer', value: 'customer' },
  { text: 'Loan Type', value: 'loan_type' },
  { text: 'Edit', value: 'edit'},
  { text: 'Delete', value: 'delete' }
]

const getStatusColor = (status) => {
  const statusMap = {
    0: 'grey',
    1: 'green',
    2: 'red',
    3: 'blue',
    4: 'green'
  }
  return statusMap[status] || 'grey'
}

const getStatusText = (status) => {
  const statusMap = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Active',
    4: 'Completed'
  }
  return statusMap[status] || 'Unknown'
}

const loadLoans = async () => {
  try {
    const loansResponse = await authStore.fetchData(
        'loans/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    loans.value = loansResponse.results || []
  } catch (error) {
    console.error('Failed to fetch loans:', error)
  }
}

const deleteLoan = async (id) => {
  await authStore.fetchData(
      `loans/${id}/`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
      }
  )
  await loadLoans();
}

onMounted(() => {
  loadLoans()
})
</script>