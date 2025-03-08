<template>
<v-app>
<NavBar />
<v-main>
  <v-container>
    <router-view></router-view>
  </v-container>
</v-main>
<v-snackbar
    v-model="showSnackbar"
    :color="snackbarColor"
    :timeout="3000"
>
  {{ snackbarText }}
</v-snackbar>
</v-app>
</template>

<script setup>
import { ref, provide } from 'vue'
import NavBar from '@/components/NavBar.vue'
import router from "@/router/index.js";

const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const notify = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}

provide('notify', notify)
</script>
