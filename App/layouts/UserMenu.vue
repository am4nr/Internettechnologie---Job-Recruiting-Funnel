<!-- components/UserMenu.vue -->
<template>
  <div>
    <div v-if="user">
      <div class="flex flex-col items-start">
        <button @click="logout" class="text-red-600 hover:text-red-800 px-3 py-2">
          <div class="flex flex-col">
            <span>Logout</span>
            <span v-if="userRole" class="text-xs text-gray-500">
              {{ userRole }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const userRole = ref(null)

async function fetchUserRole() {
  if (user.value) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    
    if (!error && data) {
      userRole.value = data.role
    }
  }
}

watch(user, () => {
  fetchUserRole()
}, { immediate: true })

async function logout() {
  try {
    await supabase.auth.signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error(error)
  }
}
</script>