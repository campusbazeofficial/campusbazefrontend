<template>
  <!-- EditPlan delegates entirely to CreatePlan.
       isEdit is detected automatically via route.params.id. -->
  <CreatePlan />
</template>

<script setup>
import CreatePlan from "./CreatePlan.vue";
</script>