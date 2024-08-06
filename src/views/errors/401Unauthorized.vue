<script lang="ts" setup>
import { RouteNames } from '@/core/models/app-router.model'
import router from '@/router'
import { useAuthStore } from '@/store/use-auth-store'

const toHome = () => {
  router.push({ name: RouteNames.RISK_MANAGEMENT })
}

const signOut = () => {
  const authStore = useAuthStore()
  authStore.logout()
}
</script>

<template>
  <div class="h-screen w-full bg-base-background flex items-center justify-center">
    <div class="text-center">
      <div class="text-9xl font-bold mb-4 tracking-widest">401</div>
      <p class="uppercase text-2xl tracking-widest">Unauthorized</p>
      <div class="mt-2 space-x-4">
        <AppButton type="dark" icon="arrow-left" @click="toHome"> Return to Dashboard </AppButton> <span>Or</span>
        <AppButton type="light" @click="signOut"> Sign out </AppButton>
      </div>
    </div>
  </div>
</template>
