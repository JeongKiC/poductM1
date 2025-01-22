<template>
  <div ref="matterContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Engine, Render, Runner, Bodies, World } from 'matter-js'

const matterContainer = ref(null)
let engine = null
let render = null
let runner = null


onMounted(() => {

  engine = Engine.create()
  runner = Runner.create()
  render = Render.create({
    engine: engine,
    element: matterContainer.value,
    options: {
      wireframes: false,
      background: '#F7F4C8',
      width: 620,
      height: 850
    }
  })


  const world = engine.world

  // x, y, width, height, options 중심
  const leftEnd = Bodies.rectangle(15, 400, 30, 800, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })

 const rightEnd = Bodies.rectangle(605,400, 30, 800, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })

  const ground = Bodies.rectangle(310, 825, 620, 50, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })

  World.add(world, [rightEnd, leftEnd, ground])

  Render.run(render)
  Runner.run(runner, engine)

})
onUnmounted(()=>{
  Render.stop(render)
  runner && Runner.stop(runner)
  render.canvas.remove() // 캔버스 삭제
  render.textures = {} // 텍스처 초기화
})

</script>
