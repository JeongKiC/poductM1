import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePageStore = defineStore("Page", ()=>{
  const score = ref(0)
  const viewName = ref("")

  const setScore = (newScore) => {
    score.value = newScore
  }
  const setViewName = (newViewName) => {
    viewName.value = newViewName
  }
  const getScore = () => {
    return score.value
  }
  const getViewName = () => {
    return viewName.value
  }

  return {score, viewName, setScore, setViewName, getScore, getViewName}

})