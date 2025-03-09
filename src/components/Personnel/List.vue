<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Loan Types</span>
        <v-btn
            :to="{ name: 'personnel-create'}"
            text>
          Create
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
            :headers="headers"
            :items="loanTypes"
            :items-per-page="10"
            hide-default-footer
            class="elevation-1"
        >
          <template v-slot:item.edit="{ item }">
            <v-btn
              :to="{ name: 'personnel-edit', params: { id: item.id }}"
            >
              Edit
            </v-btn>
          </template>
          <template v-slot:item.delete="{ item }">
            <v-btn
                @click="deleteType(item.id)"
                color="red"
            >
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Fund Types</span>
        <v-btn
            :to="{ name: 'personnel-create', query: { isFund: true }}"
            text>
          Create
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
            :headers="headers"
            :items="fundTypes"
            :items-per-page="5"
            hide-default-footer
            class="elevation-1"
        >
          <template v-slot:item.edit="{ item }">
            <v-btn
                :to="{ name: 'personnel-edit', params: { id: item.id }, query: { isFund: true }}"
            >
              Edit
            </v-btn>
          </template>
          <template v-slot:item.delete="{ item }">
            <v-btn
                @click="deleteType(item.id, true)"
                color="red"
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

const loanTypes = ref([])
const fundTypes = ref([])

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Name', value: 'name' },
  { text: 'Personnel', value: 'personnel' },
  { text: 'Min Amount', value: 'min_amount' },
  { text: 'Max Amount', value: 'max_amount' },
  { text: 'Interest Rate', value: 'interest_rate' },
  { text: 'Min Duration (Months)', value: 'min_duration_months' },
  { text: 'Max Duration (Months)', value: 'max_duration_months' },
  { text: 'Create At', value: 'create_at' },
  { text: 'Update At', value: 'update_at' },
  { text: 'Edit', value: 'edit' },
  { text: 'Delete', value: 'delete' }
]

const deleteType = async (id, isFund = false) => {
  let url;
  if (isFund) {
    url = 'loans/fund-type'
  } else {
    url = 'loans/type'
  }
  await authStore.fetchData(
      `${url}/${id}/`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
      }
  )
  await loadTypes()
}

const loadTypes = async () => {
  try {
    // Fetch loan types
    const loanTypesResponse = await authStore.fetchData(
        'loans/type/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )

    loanTypes.value = loanTypesResponse.results || []

    // Fetch fund types
    const fundTypesResponse = await authStore.fetchData(
        'loans/fund-type/',
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        }
    )
    fundTypes.value = fundTypesResponse.results || []

  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

onMounted(() => {
  loadTypes();
})
</script>
