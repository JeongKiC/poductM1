import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScoreStore = defineStore("Score", ()=>{
  const score = ref(0)
  const name = ref("")
})