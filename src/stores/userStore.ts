import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'goodlearnai',
  () => {
    // State
    const email = ref<string>('')
    const id = ref<number>(0)
    const name = ref<string>('')
    const role = ref<string>('')
    const token = ref<string>('')
    const birthday = ref<string | null>(null)
    const address = ref<string | null>(null)
    const cqipcId = ref<string | null>(null)
    const avatar = ref<string | null>(null)

    // Actions
    function setUser(user: any) {
      email.value = user.user_email || user.email
      id.value = user.id
      name.value = user.name
      role.value = user.role
      token.value = user.token
      birthday.value = user.birthday
      address.value = user.address
      cqipcId.value = user.cqipc_id || user.cqipcId
      avatar.value = user.avatar
    }

    function clearUser() {
      email.value = ''
      id.value = 0
      name.value = ''
      role.value = ''
      token.value = ''
      birthday.value = null
      address.value = null
      cqipcId.value = null
      avatar.value = null
    }
    
    return {
      email,
      id,
      name,
      role,
      token,
      birthday,
      address,
      cqipcId,
      avatar,
      setUser,
      clearUser
    }
  },
  {
    persist: true
  }
)
