<template>
    <div class="bg-gray-100 py-12 px-4">
      <div class="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 
          @click="alert('clicked')" 
          class="text-3xl font-bold text-gray-800 mb-6 cursor-pointer text-center hover:underline"
        >
          Über uns
        </h2>
        
        <div class="flex justify-center mb-8">
          <img 
            src="~/assets/images/Team.jpeg" 
            alt="Team von Kistenkönige Logistik" 
            class="rounded-lg shadow-lg w-1/3 hover:scale-105 transform transition duration-300 border-2 border-gray-300"
          />
        </div>
        
        <div class="text-gray-800 p-6 rounded-lg mb-6 shadow-inner">
          <p class="text-gray-700 text-lg leading-relaxed">
            Moin und herzlich willkommen bei <strong>Kistenkönige Logistik</strong> – dem Transportunternehmen, das nicht nur Stückgut, sondern auch jede Menge gute Laune durch Kiel und Umgebung fährt!
          </p>
          <p class="text-gray-700 text-lg leading-relaxed mt-4">
            Wir sind Rojda, Mike und Julia, drei Küstenkinder mit Benzin im Blut und der festen Überzeugung, dass der Nahverkehr mehr kann als nur Ware von A nach B zu bringen. Seit fünf Jahren sind wir für Sie unterwegs – bei Wind, Wetter und manchmal auch mit einer ordentlichen Portion norddeutschem Schnack.
          </p>
          <p class="text-gray-700 text-lg leading-relaxed mt-4">
            Unser Revier: der Raum Kiel und Umgebung. Ob kleine Kartons oder größere Ladungen – wir packen's an und bringen alles sicher ans Ziel. Wir kennen jede Ecke, jede Straße und jeden Kreisverkehr (auch den, den man zweimal umfahren muss, weil’s so schön war).
          </p>
        </div>
        
        <div class="bg-gray-50 p-6 rounded-lg mb-6 shadow-md">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4">
            Was macht uns besonders?
          </h3>
          <ul class="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li><strong>Wir sind nah dran:</strong> Nicht nur geografisch, sondern auch menschlich. Persönlicher Service ist für uns keine Floskel, sondern Programm.</li>
            <li><strong>Wir haben Spaß:</strong> Bei uns wird die Ladefläche nicht nur voll, sondern auch die Stimmung. Denn gute Arbeit macht nur mit guter Laune richtig Spaß.</li>
            <li><strong>Wir lieben die Herausforderung:</strong> Egal, ob sperrig, schwer oder „wie kriegt man das denn da rein?!“ – wir finden eine Lösung.</li>
          </ul>
        </div>
        
        <div class="text-gray-800 p-6 rounded-lg shadow-inner">
          <p class="text-gray-700 text-lg leading-relaxed">
            Also, wenn Sie ein Transportunternehmen suchen, das pünktlich liefert, dabei noch ein Lächeln auf den Lippen hat und nie die Küstenluft vergisst, dann sind Sie bei uns genau richtig.
          </p>
          <p class="text-gray-700 text-lg leading-relaxed mt-4">
            <strong>Ihr Team von Kistenkönige Logistik</strong><br>
            Rojda, Mike und Julia – die, die’s bringen!
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // 
  </script>
  
  <style scoped>
  </style>
  