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
      <!-- 볼륨 조절 버튼 -->
      <div class="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-md">
        <button @click="toggleMute" class="text-gray-600 hover:text-gray-800">
          <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <input type="range" v-model="audioVolume" min="0" max="1" step="0.1" 
               class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>

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

    <!-- 알림 모달 -->
    <div v-if="showModal" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div class="text-2xl font-bold mb-4 text-blue-600">타이머 완료!</div>
        <p class="text-gray-600 mb-6">설정한 시간이 완료되었습니다.</p>
        <div class="flex justify-end">
          <button @click="closeModal" 
                  class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
            확인
          </button>
        </div>
      </div>
    </div>

    <!-- 토스트 알림 -->
    <div v-if="showToast" 
         class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50">
      타이머가 완료되었습니다!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'

const timeLeft = ref(0); // 남은 시간 (초)
const elapsedSeconds = ref(0); // 경과 시간
const isRunning = ref(false);
const showModal = ref(false);
const showToast = ref(false);
const audio = ref(null);
const audioVolume = ref(0.3); // 볼륨 조절
const isMuted = ref(false); // 음소거 상태
let timerInterval = null;
let modalTimeout = null;
let toastTimeout = null;

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
      showNotification();
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

// 알림 표시
const showNotification = () => {
  doneSound(); // 알람 소리 재생
  showModal.value = true;
  showToast.value = true;

  // 5초 후 자동으로 모달과 토스트 닫기
  modalTimeout = setTimeout(() => {
    closeModal();
  }, 5000);

  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 5000);
};

// 모달 닫기
const closeModal = () => {
  showModal.value = false;
  showToast.value = false;
  clearTimeout(modalTimeout);
  clearTimeout(toastTimeout);
  
  // 알림음 멈추기
  if (audio.value) {
    audio.value.pause();
    audio.value.currentTime = 0;
  }
};

// 음소거 토글
const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (audio.value) {
    audio.value.volume = isMuted.value ? 0 : audioVolume.value;
  }
};

onUnmounted(() => {
  clearInterval(timerInterval);
  clearTimeout(modalTimeout);
  clearTimeout(toastTimeout);
});

// ✅ 알람 효과음 함수
function doneSound() {
  audio.value = new Audio("/Beep.mp4");
  audio.value.volume = isMuted.value ? 0 : audioVolume.value;
  audio.value.play().catch((error) => {
    console.error("Audio play failed:", error);
  });
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

/* 토스트 알림 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
