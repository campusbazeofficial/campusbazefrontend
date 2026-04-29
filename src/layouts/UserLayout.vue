<template>
  <DashboardLayout :navLinks="userLinks" />
</template>

<script setup>
import DashboardLayout from './dashboard/DashboardLayout.vue'
import { userLinks } from '@/navlinks'
</script>