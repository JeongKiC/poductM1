<template>
  <header class="bg-gray-400 p-4 text-white fixed top-0 left-0 w-full z-1">
    <button id="menu-btn" class="md:hidden p-5">
      ☰
    </button>
  </header>
  <div class="flex">
    <aside id="sidebar"
           class="w-64 bg-teal-500 text-white p-5 fixed top-0 left-0 h-screen transform -translate-x-full md:translate-x-0 md:relative transition-transform duration-300 overflow-hidden">

      <nav>
        <ul class="ul mt-20 mb-20">
          <li v-for="(item, name) in componentMap" :key="name" class="li">
            <a href="#" @click.prevent="pageStore.setViewName(name)">
              <span class="mr-2">{{ item.icon }}</span> {{ name }}
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="flex-1 h-[calc(100vh-60px)] mt-20 md:mt-10 md:flex-row p-5 transition-all duration-300 overflow-auto">
      <Component :is="currentView" />
    </div>
  </div>
</template>


<script setup>
import Suika from './componets/suika.vue'
import Timer from './componets/timer.vue'
import Lotto from './componets/lotto.vue'
import { ref, onMounted, computed } from 'vue'
import { usePageStore } from './stores/pages.js'

const pageStore = usePageStore()

const componentMap = {
  Suika: { component: Suika, icon: '🍉' },
  Timer: { component: Timer, icon: '⏱️' },
  Lotto: { component: Lotto, icon: '🎰' }

}

const currentView = computed(() => {
  const viewName = pageStore.getViewName()
  return componentMap[viewName]?.component || 404
})


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

.ul {
  overflow: hidden; /* ul 내부 스크롤 방지 */
}

.ul .li {
  padding: 10px;
}
</style>
