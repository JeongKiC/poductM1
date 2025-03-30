<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 relative">
    <!-- 타이머 영역 -->
    <div class="relative flex flex-col items-center">
      <!-- 둥근 원 -->
      <div class="w-64 h-64 bg-white shadow-lg rounded-full flex flex-col justify-center items-center text-4xl font-bold">
        {{ formattedTime }}
        <span class="text-lg text-gray-500 mt-2">{{ elapsedSeconds }}초 경과</span>
      </div>

      <!-- 시작/중단 버튼 (토글) -->
      <button v-if="!isRunning" @click="startTimer"
              class="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full text-lg">
        ▶ 시작
      </button>
      <button v-else @click="stopTimer"
              class="mt-6 bg-red-500 text-white px-6 py-3 rounded-full text-lg">
        ✖ 중단
      </button>
    </div>

    <!-- 우측 버튼 그룹 -->
    <div class="absolute right-10 flex flex-col space-y-4 items-end">
      <button v-for="time in timerOptions" :key="time"
              @click="addTime(time)"
              class="bg-white text-black border border-gray-400 px-6 py-3 rounded-lg text-lg shadow-md w-28">
        +{{ time }}분
      </button>

      <!-- 초기화 버튼 -->
      <button @click="resetTimer"
              class="bg-gray-500 text-white px-6 py-3 rounded-lg text-lg shadow-md w-28">
        초기화
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'

const timeLeft = ref(0); // 남은 시간 (초)
const elapsedSeconds = ref(0); // 경과 시간
const isRunning = ref(false);
let timerInterval = null;

// 선택할 타이머 옵션 (1, 5, 10분)
const timerOptions = [1, 5, 10];

const formattedTime = computed(() => {
  const hours = String(Math.floor(timeLeft.value / 3600)).padStart(2, "0");
  const minutes = String(Math.floor(timeLeft.value / 60) % 60).padStart(2, "0");
  const seconds = String(timeLeft.value % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
});

// 시간 추가 기능
const addTime = (minutes) => {
  if (!minutes || minutes <= 0) return;
  timeLeft.value += minutes * 60; // 기존 시간에 추가
};

// 타이머 시작
const startTimer = () => {
  if (timeLeft.value <= 0 || isRunning.value) return;

  isRunning.value = true;
  elapsedSeconds.value = 0;

  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
      elapsedSeconds.value++;
    } else {
      stopTimer();
      doneSound(); // 타이머 끝날 때 알람 실행
    }
  }, 1000);
};

// 타이머 중단
const stopTimer = () => {
  clearInterval(timerInterval);
  isRunning.value = false;
};

// 타이머 초기화
const resetTimer = () => {
  stopTimer();
  timeLeft.value = 0;
  elapsedSeconds.value = 0;
};

onUnmounted(() => {
  clearInterval(timerInterval);
});

// ✅ 알람 효과음 함수
function playBeep(frequency = 1000, duration = 500, volume = 0.5) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); // 볼륨 조절 (0.0 ~ 1.0)

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, duration);
}

function doneSound() {
  for (let i = 0; i < 3; i++) {
    console.log('--')
    setTimeout(() => {
      playBeep(800, 200, 0.2);
    }, i * 250);
  }
}
</script>

<style scoped>
/* 버튼 애니메이션 */
button {
  transition: transform 0.2s ease-in-out;
}

button:active {
  transform: scale(0.95);
}
</style>
