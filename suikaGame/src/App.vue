<template>
  <header class="bg-gray-400 p-4 text-white fixed top-0 left-0 w-full z-1">
    <button id="menu-btn" class="md:hidden p-5">
      ☰
    </button>
  </header>
  <div class="flex">
    <aside id="sidebar"
           class="w-64 bg-teal-500 text-white p-5 top-5 fixed inset-y-0 left-0 transform -translate-x-full md:translate-x-0 md:relative transition-transform duration-300">
      <nav>
        <ul class="ul mt-20 mb-20 h-400">
          <li class="li">
            <a href="#" @click.prevent="pageStore.setViewName('Suika')">Suika</a>
          </li>
          <li class="li">
            <a href="#" @click.prevent="pageStore.setViewName('Timer')">Timer</a>
          </li>
        </ul>
      </nav>
    </aside>
    <div class="flex-1 h-[calc(100vh-60px)] mt-20 md:mt-10 md:flex-row p-5 transition-all duration-300">
      <Component :is="componentMap[pageStore.getViewName()]" />
    </div>
  </div>
</template>

<script setup>
import Suika from './componets/suika.vue'
import Timer from './componets/timer.vue'
import { ref, onMounted, computed } from 'vue'
import { usePageStore } from './stores/pages.js'

const pageStore = usePageStore()

const componentMap = {
  Suika,
  Timer
}


onMounted(() => {

  document.title = 'Home'

  const menuBtn = document.getElementById('menu-btn')
  const sidebar = document.getElementById('sidebar')

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full')
  })

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.add('-translate-x-full')
    }
  })


})
</script>
<style>
@import "tailwindcss";

.ul .li {
  padding: 10px;
}

</style>
