// src/composables/useIsMobile.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useIsMobile(breakpoint = 768) {
  const isMobile = ref(window.innerWidth < breakpoint)

  const check = () => {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => window.addEventListener('resize', check))
  onBeforeUnmount(() => window.removeEventListener('resize', check))

  return { isMobile }
}
