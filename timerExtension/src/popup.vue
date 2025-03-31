<template>
  <div class="flex justify-start px-10 items-center min-h-screen bg-gray-100 relative">
    <!-- 타이머 영역 -->
    <div class="relative flex flex-col items-center">
      <!-- 둥근 원 -->
      <div class="w-50 h-50 bg-white shadow-lg rounded-full flex flex-col justify-center items-center text-3xl font-bold">
        {{ formattedTime }}
        <span class="text-lg text-gray-500 mt-2">{{ elapsedSeconds }} {{langText.elapsed}}</span>
      </div>

      <!-- 시작/중단 버튼 (토글) -->
      <button v-if="!isRunning" @click="startTimer"
              class="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full text-lg">
        ▶ {{langText.start}}
      </button>
      <button v-else @click="stopTimer"
              class="mt-6 bg-red-500 text-white px-6 py-3 rounded-full text-lg">
        ✖ {{langText.stop}}
      </button>
    </div>

    <!-- 우측 버튼 그룹 -->
    <div class="absolute right-0 flex flex-col space-y-4 px-6 items-end">
      <button v-for="time in timerOptions" :key="time"
              @click="addTime(time)"
              class="bg-white text-black border border-gray-400 px-3 py-3 rounded-lg text-lg shadow-md w-28">
        +{{ time }}{{ langText.minutes }}
      </button>

      <!-- 초기화 버튼 -->
      <button @click="resetTimer"
              class="bg-gray-500 text-white px-6 py-3 rounded-lg text-lg shadow-md w-28">
        {{langText.reset}}
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

const userLanguage = navigator.language || navigator.userLanguage;
const isKorean = userLanguage.startsWith('ko');

const langText = computed(() => {
  return isKorean
    ? { start: "시작", stop: "중단", reset: "초기화", minutes: "분", elapsed: "초 경과" }
    : { start: "Start", stop: "Stop", reset: "Reset", minutes: "min", elapsed: "seconds elapsed" };
});


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

const audioSrc = "/Beep.mp4"; // 알람 효과음 파일 경로
const audio = ref(null);
const audioVolume = ref(0.3); // 볼륨 조절 추후 조절 업데이트
// 알람 효과음 함수
function doneSound() {
  audio.value = new Audio(audioSrc);
  audio.value.volume = audioVolume.value; // 볼륨 조절 추후 조절 업데이트
  audio.value.play().catch((error) => {
    console.error("Audio play failed:", error);
  });
}

const updateVolume = (newVolume) => {
  audioVolume.value = newVolume;
  if (audio.value) {
    audio.value.volume = newVolume // 볼륨 조절 (0.0 ~ 1.0);
  }
};

</script>

<style>
@import "tailwindcss";
/* 버튼 애니메이션 */
button {
  transition: transform 0.2s ease-in-out;
}

button:active {
  transform: scale(0.95);
}
</style>
