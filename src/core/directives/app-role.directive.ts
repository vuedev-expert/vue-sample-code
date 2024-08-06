import { useAuthStore } from '@/store/use-auth-store'

export default {
  created(el: any, binding: any) {
    const authStore = useAuthStore()
    const role = authStore.userRole
    if (!role) {
      el.style.display = 'none'
      return
    }
    const { exclude } = binding.modifiers
    const roles: string[] = binding.value ?? []

    if ((exclude && roles.includes(role.name)) || (!exclude && !roles.includes(role.name))) {
      el.style.display = 'none'
    }
  }
}
