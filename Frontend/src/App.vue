<template>
  <RouterView />
  <AppBannerNotificacion />
  <AppLoader :visible="loader.visible" :mensaje="loader.mensaje" />
</template>

<script setup>
import AppBannerNotificacion from '@/components/AppBannerNotificacion.vue';
import AppLoader from './components/AppLoader.vue';
import { useLoaderStore } from '@/stores/loader.store';
const loader = useLoaderStore();

</script>
