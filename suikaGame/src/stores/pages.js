import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePageStore = defineStore("Page", ()=>{
  const score = ref(0)
  const viewName = ref("Timer")

  const setScore = (newScore) => {
    console.log("setScore: ", newScore)
    score.value = newScore
  }
  const setViewName = (newViewName) => {
    console.log("setViewName: ", newViewName)
    viewName.value = newViewName
  }
  const getScore = () => {
    return score.value
  }
  const getViewName = () => {
    return viewName.value
  }

  return {viewName,setScore, setViewName, getScore, getViewName}

})