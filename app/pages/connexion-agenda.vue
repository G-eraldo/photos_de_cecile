<script setup>
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Connexion Google Agenda',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const setupSecret = ref('')
const refreshToken = ref('')
const errorMessage = ref(route.query.error || '')
const isConnecting = ref(false)
const isCopying = ref(false)

const beginAuthorization = async () => {
  errorMessage.value = ''
  isConnecting.value = true

  try {
    await $fetch('/api/google-calendar/setup/session', {
      method: 'POST',
      body: { secret: setupSecret.value },
    })
    const { authorizationUrl } = await $fetch('/api/google-calendar/setup/authorize')
    await navigateTo(authorizationUrl, { external: true })
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Impossible de démarrer la connexion Google.'
    isConnecting.value = false
  }
}

const loadRefreshToken = async () => {
  try {
    const result = await $fetch('/api/google-calendar/setup/token')
    refreshToken.value = result.refreshToken
    window.history.replaceState({}, '', '/connexion-agenda')
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Le token temporaire est indisponible. Recommence la connexion.'
  }
}

const copyRefreshToken = async () => {
  try {
    await navigator.clipboard.writeText(refreshToken.value)
    isCopying.value = true
    window.setTimeout(() => { isCopying.value = false }, 2500)
  } catch {
    errorMessage.value = 'Copie le token manuellement, puis ferme cette page.'
  }
}

onMounted(() => {
  if (route.query.connected === '1') loadRefreshToken()
})
</script>

<template>
  <main class="flex min-h-screen items-center bg-[#E6DFDD] px-4 py-12 font-poppins sm:px-6">
    <Card class="mx-auto w-full max-w-xl border-0 bg-white shadow-xl">
      <CardHeader class="space-y-3 px-6 pt-8 text-center sm:px-10">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#5A3419]">
          Les Photos de Cécile
        </p>
        <CardTitle class="font-playfair text-3xl font-semibold text-[#5A3419] sm:text-4xl">
          Connexion Google Agenda
        </CardTitle>
        <CardDescription class="text-sm leading-6 text-[#676463]">
          Connecte le compte Google de Cécile, puis copie le refresh token dans les variables de production.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-6 px-6 pb-8 sm:px-10">
        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Connexion interrompue</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <template v-if="refreshToken">
          <div class="rounded-xl border border-[#D9D2CF] bg-[#FAF8F7] p-4">
            <Label for="refresh-token" class="text-sm font-semibold text-[#5A3419]">
              GOOGLE_REFRESH_TOKEN
            </Label>
            <Textarea
              id="refresh-token"
              v-model="refreshToken"
              readonly
              class="mt-3 min-h-36 border-[#D9D2CF] bg-white font-mono text-xs leading-5 text-[#503D30]"
            />
          </div>

          <p class="text-sm leading-6 text-[#676463]">
            Copie-le maintenant dans les variables de production, puis ferme cette page. Il n’est affiché qu’une seule fois.
          </p>

          <Button class="w-full bg-[#5A3419] hover:bg-[#432615]" @click="copyRefreshToken">
            {{ isCopying ? 'Token copié' : 'Copier le refresh token' }}
          </Button>
        </template>

        <form v-else class="space-y-5" @submit.prevent="beginAuthorization">
          <div class="space-y-2">
            <Label for="setup-secret" class="text-sm font-semibold text-[#5A3419]">
              Secret de configuration
            </Label>
            <Input
              id="setup-secret"
              v-model="setupSecret"
              type="password"
              autocomplete="off"
              required
              class="border-[#D9D2CF]"
            />
            <p class="text-xs leading-5 text-[#8F8C85]">
              Il correspond à la variable serveur <code>GOOGLE_OAUTH_SETUP_SECRET</code>.
            </p>
          </div>

          <Button type="submit" :disabled="isConnecting || !setupSecret" class="w-full bg-[#5A3419] hover:bg-[#432615]">
            {{ isConnecting ? 'Redirection vers Google…' : 'Connecter le compte Google de Cécile' }}
          </Button>
        </form>

        <ol v-if="!refreshToken" class="list-decimal space-y-2 pl-5 text-xs leading-5 text-[#8F8C85]">
          <li>Connecte-toi au compte Google de Cécile dans l’écran qui s’ouvre.</li>
          <li>Accepte l’accès à Google Agenda.</li>
          <li>Copie le token affiché ici dans <code>GOOGLE_REFRESH_TOKEN</code>, puis redéploie.</li>
        </ol>
      </CardContent>
    </Card>
  </main>
</template>
