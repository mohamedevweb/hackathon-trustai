<script setup lang="ts">
const links = ref([
  {
    label: 'Client - Funding',
    to: '/fund',
    trailingIcon: 'i-lucide-arrow-right'
  },
  {
    label: 'Freelancer - Submit Project',
    to: '/submit',
    color: 'neutral',
    trailingIcon: 'i-lucide-arrow-right'
  }
  ,
  {
    label: 'Release Payment',
    to: '/release',
    color: 'primary',
    trailingIcon: 'i-lucide-arrow-right'
  }
])
</script>

<template>
  <UPageHero
      title="Trust AI"
      description="Smartest Escrow System"
      :links="links"
  />


</template>

