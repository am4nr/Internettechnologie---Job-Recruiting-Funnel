<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-semibold mb-6 text-center">Kontakt</h1>
        <form @submit.prevent="sendEmail" class="space-y-4">
          <div>
            <label for="to" class="block text-sm font-medium text-gray-700">Empfänger E-Mail</label>
            <input
              v-model="to"
              type="email"
              id="to"
              placeholder="Empfänger E-Mail"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700">Betreff</label>
            <input
              v-model="subject"
              type="text"
              id="subject"
              placeholder="Betreff"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label for="text" class="block text-sm font-medium text-gray-700">Nachricht</label>
            <textarea
              v-model="text"
              id="text"
              placeholder="Nachricht"
              rows="4"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              E-Mail senden
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  const to = ref('');
  const subject = ref('');
  const text = ref('');
  
  const sendEmail = async () => {
    try {
      const { data, error } = await useFetch('/api/send-email', {
        method: 'POST',
        body: { to: to.value, subject: subject.value, text: text.value }
      });
  
      if (error.value) {
        alert('Fehler beim Senden der E-Mail: ' + error.value.message);
      } else {
        alert('E-Mail gesendet: ' + data.value.message);
      }
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      alert('Fehler beim Senden der E-Mail');
    }
  };
  </script>
  