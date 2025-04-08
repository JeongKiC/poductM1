<template>
  <div class="lotto-container">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">로또 번호 추첨기</h1>
    <button @click="generateLottoNumbers"
            class="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-green-500 hover:to-blue-600 transition-all duration-300">
      번호 생성
    </button>

    <div v-if="lottoHistory.length" class="mt-6">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">최근 생성된 번호:</h2>
      <div v-for="(numbers, index) in lottoHistory" :key="index" class="mb-4">
        <div class="flex justify-center space-x-4">
          <span v-for="number in numbers" :key="number"
                :class="getNumberClass(number)"
                class="text-gray-800 font-bold px-5 py-3 rounded-full shadow-md text-lg">
            {{ number }}
          </span>
        </div>
      </div>
    </div>

    <!-- 연금복권 번호 생성기 -->
    <div class="mt-10 border-t pt-8">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">연금복권 번호 추첨기</h1>
      <button @click="generatePensionNumber"
              class="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-600 transition-all duration-300">
        연금 번호 생성
      </button>

      <div v-if="pensionHistory.length" class="mt-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">최근 생성된 연금번호:</h2>
        <div v-for="(entry, index) in pensionHistory" :key="index" class="mb-4">
          <div class="flex justify-center items-center space-x-4 text-xl">
            <div class="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">조: {{ entry.jo }}</div>
            <div class="bg-pink-300 text-gray-900 px-4 py-2 rounded-lg font-bold">번호: {{ entry.number }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 로또
const lottoHistory = ref([])

const generateLottoNumbers = () => {
  const numbers = new Set()
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  const sortedNumbers = Array.from(numbers).sort((a, b) => a - b)
  lottoHistory.value.unshift(sortedNumbers)
  if (lottoHistory.value.length > 5) {
    lottoHistory.value.pop()
  }
}

const getNumberClass = (number) => {
  if (number <= 9) return 'bg-yellow-300'
  if (number <= 18) return 'bg-blue-300'
  if (number <= 27) return 'bg-red-300'
  if (number <= 36) return 'bg-black text-white'
  return 'bg-green-300'
}

// 연금복권
const pensionHistory = ref([])

const generatePensionNumber = () => {
  const jo = Math.floor(Math.random() * 5) + 1 // 조 (1~5)
  const number = String(Math.floor(Math.random() * 1000000)).padStart(6, '0') // 000000 ~ 999999
  pensionHistory.value.unshift({ jo, number })
  if (pensionHistory.value.length > 5) {
    pensionHistory.value.pop()
  }
}
</script>

<style scoped>
.lotto-container {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button {
  cursor: pointer;
}

button:focus {
  outline: none;
}

span {
  display: inline-block;
  min-width: 50px;
  text-align: center;
}

.bg-yellow-300 {
  background-color: #fde68a;
}

.bg-blue-300 {
  background-color: #93c5fd;
}

.bg-red-300 {
  background-color: #fca5a5;
}

.bg-black {
  background-color: #000000;
}

.bg-green-300 {
  background-color: #6ee7b7;
}

.text-white {
  color: white;
}
</style>
