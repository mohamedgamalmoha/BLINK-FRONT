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
        <div v-for="loan in loans" :key="loan.id" class="mb-8">
          <v-card outlined>
            <v-card-title class="subtitle-1 font-weight-bold">
              Loan #{{ loan.id }}
              <v-chip
                  :color="getStatusColor(loan.status)"
                  dark
                  class="ml-4"
              >
                {{ getStatusText(loan.status) }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn
                  small
                  :to="{ name: 'customer-edit', params: { id: loan.id }}"
                  class="mr-2"
              >
                Edit
              </v-btn>
              <v-btn
                  small
                  @click="deleteLoan(loan.id)"
                  color="red"
              >
                Delete
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <div class="caption grey--text">Amount</div>
                  <div>{{ formatCurrency(loan.amount) }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="caption grey--text">Duration</div>
                  <div>{{ loan.duration_months }} months</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="caption grey--text">Start Date</div>
                  <div>{{ formatDate(loan.start_at) }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="caption grey--text">Customer ID</div>
                  <div>{{ loan.customer }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <div class="subtitle-1 font-weight-bold mb-3">Amortization Schedule</div>
              <v-data-table
                  :headers="amortizationHeaders"
                  :items="loan.amortizations || []"
                  dense
                  hide-default-footer
                  class="elevation-1"
                  :items-per-page="10"
              >
                <template v-slot:item.payment_date="{ item }">
                  {{ formatDate(item.payment_date) }}
                </template>
                <template v-slot:item.principal_amount="{ item }">
                  {{ formatCurrency(item.principal_amount) }}
                </template>
                <template v-slot:item.interest_amount="{ item }">
                  {{ formatCurrency(item.interest_amount) }}
                </template>
                <template v-slot:item.total_payment="{ item }">
                  {{ formatCurrency(item.total_payment) }}
                </template>
                <template v-slot:item.remaining_balance="{ item }">
                  {{ formatCurrency(item.remaining_balance) }}
                </template>
                <template v-slot:item.is_paid="{ item }">
                  <v-chip
                      :color="item.is_paid ? 'green' : 'grey'"
                      small
                      dark
                  >
                    {{ item.is_paid ? 'Paid' : 'Unpaid' }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>

        <div v-if="loans.length === 0" class="text-center py-5">
          <p>No loans found</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.js'

const authStore = useAuthStore()
const loans = ref([])

const amortizationHeaders = [
  { text: '#', value: 'payment_number', width: '5%' },
  { text: 'Payment Date', value: 'payment_date', width: '15%' },
  { text: 'Principal', value: 'principal_amount', width: '15%' },
  { text: 'Interest', value: 'interest_amount', width: '15%' },
  { text: 'Total Payment', value: 'total_payment', width: '15%' },
  { text: 'Remaining Balance', value: 'remaining_balance', width: '20%' },
  { text: 'Status', value: 'is_paid', width: '15%' }
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

const loadLoans = async () => {
  try {
    const loansResponse = await authStore.fetchData(
        'loans/?expand=amortizations',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    console.log(loansResponse)
    loans.value = loansResponse.results || []

    // Sort amortizations by payment number for each loan
    loans.value.forEach(loan => {
      if (loan.amortizations) {
        loan.amortizations.sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));
      }
    });
  } catch (error) {
    console.error('Failed to fetch loans:', error)
  }
}

const deleteLoan = async (id) => {
  try {
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
  } catch (error) {
    console.error('Failed to delete loan:', error)
  }
}

onMounted(() => {
  loadLoans()
})
</script>