<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  contractId: z.string('Contract ID is required'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  contractId: undefined,
})

const toast = useToast()
const loading = ref(false)
const { apiBase } = useRuntimeConfig().public

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; txId: string }>(`${apiBase}/release`, {
      method: 'POST',
      body: {
        contractId: Number(event.data.contractId),
      },
    })
    toast.add({ title: 'Released', description: `txId=${res.txId}`, color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.error || e?.message || 'Release failed', color: 'error' })
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
            <UFormField label="Contract ID" name="contractId">
            <UInput v-model="state.contractId" />
            </UFormField>

            <UButton type="submit" :loading="loading">
              Release Payment
            </UButton>
        </UForm>
    </UPageCard>
  </div>
</template>


