<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <div class="relative w-48 h-48">

      <div class="absolute inset-0 border-4 border-teal-500 rounded-full"></div>


      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100"/>

      <!-- 초침 -->
      <div
        class="absolute left-23 top-1 w-1 h-20 bg-red-500 origin-bottom transition-transform duration-1000"
        :style="{ transform: `rotate(${handRotation}deg)` }"
      ></div>

      <div class="absolute inset-0 flex items-center justify-center text-2xl font-bold">
        {{ time }}
      </div>
    </div>

    <!-- 버튼 -->
    <div class="mt-4">
      <button @click="startTimer" class="px-4 py-2 bg-teal-500 text-white rounded">
        시작
      </button>
      <button @click="resetTimer" class="ml-2 px-4 py-2 bg-gray-400 text-white rounded">
        초기화
      </button>
    </div>
  </div>


  ----------------------------------------------------------

  <div class="flex w- flex-col items-center justify-center min-h-screen bg-gray-500 p-6">
    <div class="bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full text-center">
      <h1 class="text-2xl font-bold text-gray-700 mb-4">타이머 설정</h1>
      <div class="flex items-center justify-center space-x-2 mb-4">
        <input v-model.number="minutes" type="number" min="0" max="59" class="w-16 text-center border p-2 rounded" placeholder="분" />
        <span class="text-xl font-semibold">:</span>
        <input v-model.number="seconds" type="number" min="0" max="59" class="w-16 text-center border p-2 rounded" placeholder="초" />
      </div>
      <p class="text-3xl font-bold text-gray-800 mb-4">{{ formattedTime }}</p>
      <div class="flex space-x-3">
        <button @click="startTimer" class="px-4 py-2 bg-green-500 text-white rounded-lg">시작</button>
        <button @click="pauseTimer" class="px-4 py-2 bg-yellow-500 text-white rounded-lg">멈춤</button>
        <button @click="resetTimer" class="px-4 py-2 bg-red-500 text-white rounded-lg">초기화</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const minutes = ref(0);
const seconds = ref(0);
const timeLeft = ref(0);
let timerInterval = null;

const formattedTime = computed(() => {
  const hour = Math.floor(timeLeft.value / 3600).toString().padStart(2, '0');
  const min = Math.floor(timeLeft.value / 60).toString().padStart(2, '0');
  const sec = (timeLeft.value % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
});

const startTimer = () => {
  if (timerInterval) return;
  timeLeft.value = minutes.value * 60 + seconds.value;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
};

const pauseTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

const resetTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft.value = 0;
  minutes.value = 0;
  seconds.value = 0;
};

function playBeep(frequency = 1000, duration = 500, volume = 0.5) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); // 🔹 볼륨 조절 (0.0 ~ 1.0)

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, duration);
}

doneSound()
function doneSound (){
  const repeat = 3;
  for (let i = 0; i < repeat; i++) {
    setTimeout(() => {
      playBeep(800, 200, 0.2);
    }, i * 250);
  }
}



</script>


<style scoped>

</style>