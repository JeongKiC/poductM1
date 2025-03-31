<template>
  <div class="flex justify-between items-center min-h-screen bg-gray-100">

    <!-- 타이머 영역 -->
    <div class="flex flex-col items-center">
      <!-- 둥근 원 -->
      <div
        class="w-64 h-64 bg-white shadow-lg rounded-full flex flex-col justify-center items-center text-4xl font-bold">
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
    <div class="flex flex-col space-y-4 items-end">
      <!-- 볼륨 조절 버튼 -->
      <div class="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-md">
        <button @click="toggleMute" class="text-gray-600 hover:text-gray-800">
          <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <input
          type="range"
          v-model="audioVolume"
          min="0"
          max="1"
          step="0.1"
          @input="updateVolume(parseFloat($event.target.value))"
          class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />

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
  </div>
</template>


<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'

const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime?.id

const timeLeft = ref(0)
const elapsedSeconds = ref(0)
const isRunning = ref(false)
let timerInterval = null

const audioSrc = '/Beep.mp4'
const audio = ref(null)
const audioVolume = ref(0.3)
const previousVolume = ref(audioVolume.value)
const isMuted = ref(false)

const timerOptions = [1, 5, 10]

const formattedTime = computed(() => {
  const h = String(Math.floor(timeLeft.value / 3600)).padStart(2, '0')
  const m = String(Math.floor(timeLeft.value / 60) % 60).padStart(2, '0')
  const s = String(timeLeft.value % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
})

function doneSound() {
  if (isChromeExtension) return // 확장 환경에서는 background에서 재생
  audio.value = new Audio(audioSrc)
  audio.value.volume = isMuted.value ? 0 : audioVolume.value
  audio.value.play().catch(console.error)
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (isMuted.value) {
    previousVolume.value = audioVolume.value
    audioVolume.value = 0
  } else {
    audioVolume.value = previousVolume.value || 0.3
  }
}

function updateVolume(newVolume) {
  audioVolume.value = newVolume
  if (audio.value) audio.value.volume = newVolume
  isMuted.value = newVolume === 0
  if (isChromeExtension) {
    chrome.runtime.sendMessage({ type: 'setVolume', volume: newVolume })
  }
}

function addTime(minutes) {
  if (!minutes || minutes <= 0) return
  timeLeft.value += minutes * 60
}

function startTimer() {
  if (timeLeft.value <= 0 || isRunning.value) return

  if (isChromeExtension && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(
      { type: 'startTimer', timeLeft: timeLeft.value },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message Error:', chrome.runtime.lastError.message)
          return
        }
        if (response?.success) {
          isRunning.value = true
          elapsedSeconds.value = 0
        } else {
          console.warn('No success response from background.')
        }
      }
    )
  } else {
    // 웹 환경에서는 직접 타이머 실행
    isRunning.value = true
    elapsedSeconds.value = 0

    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
        elapsedSeconds.value++
      } else {
        stopTimer()
        doneSound()
      }
    }, 1000)
  }
}


function stopTimer() {
  isRunning.value = false
  if (timerInterval) clearInterval(timerInterval)
  if (isChromeExtension) {
    chrome.runtime.sendMessage({ type: 'stopTimer' })
  }
}

function resetTimer() {
  stopTimer()
  timeLeft.value = 0
  elapsedSeconds.value = 0
  if (isChromeExtension) {
    chrome.runtime.sendMessage({ type: 'resetTimer' })
  }
}

// 메시지 수신 (확장 전용)
onMounted(() => {
  if (isChromeExtension) {
    chrome.runtime.sendMessage({ type: 'getTimerState' }, (res) => {
      timeLeft.value = res.timeLeft || 0
      isRunning.value = res.isRunning || false
    })

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'timerUpdate') {
        timeLeft.value = msg.timeLeft
        isRunning.value = msg.isRunning
        elapsedSeconds.value = msg.elapsedSeconds || 0
      }
    })
  }
})

onUnmounted(() => {
  if (!isChromeExtension && timerInterval) clearInterval(timerInterval)
})


</script>

<style>
@import 'tailwindcss';
/* 버튼 애니메이션 */
button {
  transition: transform 0.2s ease-in-out;
}

button:active {
  transform: scale(0.95);
}
</style>
