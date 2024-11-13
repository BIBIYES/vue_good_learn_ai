import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/models/User'

export const useUserStore = defineStore(
  'goodlearnai',
  () => {
    // State
    const email = ref<string>('')
    const id = ref<number>(0)
    const name = ref<string>('')
    const role = ref<string>('')
    const token = ref<string>('')

    // Actions
    function setUser(user: User) {
      email.value = user.email
      id.value = user.id
      name.value = user.name
      role.value = user.role
      token.value = user.token
    }

    function clearUser() {
      email.value = ''
      id.value = 0
      name.value = ''
      role.value = ''
      token.value = ''
    }
    
    return {
      email,
      id,
      name,
      role,
      token,
      setUser,
      clearUser
    }
  },
  {
    persist: true
  }
)
