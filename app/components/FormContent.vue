<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'vue-sonner';

const nom = ref('');
const prenom = ref('');
const email = ref('');
const message = ref('');
const messageError = ref('');
const pending = ref(false);

const validateAndSubmit = async (e) => {
  e.preventDefault();

  if (!message.value || message.value.trim().length < 2) {
    messageError.value = "Votre message est trop court. Veuillez écrire un message plus détaillé.";
    return;
  }

  messageError.value = "";
  pending.value = true;

  try {
    const data = await $fetch('/api/contact', {
      method: 'POST',
      body: {
        nom: nom.value,
        prenom: prenom.value,
        email: email.value,
        message: message.value
      }
    });

    if (data.success) {
      toast.success(data.message);
      // reset form
      nom.value = '';
      prenom.value = '';
      email.value = '';
      message.value = '';
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <Card class="max-w-2xl mx-auto p-4 md:p-6 mt-32">
    <CardTitle class="text-xl md:text-2xl font-bold mb-4 text-[#613213] font-playfair">
      Contactez-moi
    </CardTitle>
    <CardDescription class="mb-4 md:mb-6 text-[#9e8b8b]">
      Pour toute demande, n'hésitez pas à m'écrire. Je serai ravie de vous
      répondre rapidement.
    </CardDescription>
    <form @submit="validateAndSubmit" class="space-y-4 md:space-y-6 text-[#9e8b8b]">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid w-full items-center gap-2">
          <Label for="nom">Votre nom</Label>
          <Input type="text" id="nom" v-model="nom" placeholder="Dupont" />
        </div>
        <div class="grid w-full items-center gap-2">
          <Label for="prenom">Votre prénom</Label>
          <Input type="text" id="prenom" v-model="prenom" placeholder="Jean" />
        </div>
      </div>
      <div class="grid w-full items-center gap-2">
        <Label for="email">Votre email</Label>
        <Input type="email" id="email" v-model="email" placeholder="jean.dupont@example.com" />
      </div>
      <div class="grid w-full gap-2">
        <Label for="message">Votre message</Label>
        <Textarea required placeholder="Écrivez votre message ici..." id="message" v-model="message"
          :class="['min-h-37.5', messageError ? 'border-red-500' : '']" @input="messageError = ''" />
        <p v-if="messageError" class="text-red-500 text-sm mt-1">{{ messageError }}</p>
      </div>
      <div class="flex justify-center">
        <Button type="submit" :disabled="pending">
          {{ pending ? 'Envoi en cours...' : 'Envoyer' }}
        </Button>
      </div>
    </form>
  </Card>
</template>
