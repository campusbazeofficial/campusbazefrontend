<template>
  <DashboardLayout :navLinks="adminLinks" title="Admin Panel" />
</template>

<script setup>
import DashboardLayout from './dashboard/DashboardLayout.vue'
import { adminLinks } from '@/navlinks'
</script>