<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  clientAddress: z.string('Client Address is required'),
  freelancerAddress: z.string('Freelancer Address is required'),
  amount: z.number('Amount is required').min(0, 'Amount must be greater than 0'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  clientAddress: undefined,
  freelancerAddress: undefined,
  amount: 0,
})

const toast = useToast()
const loading = ref(false)
const { apiBase } = useRuntimeConfig().public

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; contractId: number; txId: string }>(`${apiBase}/fund`, {
      method: 'POST',
      body: {
        client: event.data.clientAddress,
        freelancer: event.data.freelancerAddress,
        amount: Number(event.data.amount),
      },
    })
    toast.add({ title: 'Funded', description: `contractId=${res.contractId}\ntxId=${res.txId}`, color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.error || e?.message || 'Fund failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>


  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UButton @click="navigateTo('/')">Back to Home</UButton>
    <UPageCard class="w-full max-w-md">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Wallet Client Address" name="clientAddress">
            <UInput v-model="state.clientAddress" />
            </UFormField>   

            <UFormField label="Wallet Freelancer Address" name="freelancerAddress">
            <UInput v-model="state.freelancerAddress" type="text" />
            </UFormField>   

            <UFormField label="Amount" name="amount">
            <UInput v-model="state.amount" type="number" min="0" />
            </UFormField>

            <UButton type="submit" :loading="loading">
              Fund Contract
            </UButton>
        </UForm>
    </UPageCard>
  </div>
</template>

