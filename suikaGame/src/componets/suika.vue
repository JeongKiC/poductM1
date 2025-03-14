
<template>
  <div ref="matterContainer" style="width: 100%; height: 100%;"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Engine, Render, Runner, Bodies, World, Events, Body } from 'matter-js'

import { Icons } from './icons.js'

const matterContainer = ref(null)
let engine = null
let render = null
let runner = null
let world = null
const currentIcon = ref(null)
const currentBody = ref(null)
const disable = ref(false)
const interval = ref(null)
const victory = ref(false)


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


  world = engine.world

  // x, y, width, height, options 중심
  const leftEnd = Bodies.rectangle(15, 400, 30, 800, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })

  const rightEnd = Bodies.rectangle(605, 400, 30, 800, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })

  const ground = Bodies.rectangle(310, 825, 620, 50, {
    isStatic: true,
    render: { fillStyle: '#EF9813FF' }
  })
  const top = Bodies.rectangle(310, 150, 620, 2, {
      name: 'top',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#EF9813FF' }
    }
  )

  World.add(world, [rightEnd, leftEnd, ground, top])
  Render.run(render)
  Runner.run(runner, engine)

  function addIcons() {
    const index = Math.floor(Math.random() * 5)
    const item = Icons[index]
    let path = `/icons/${encodeURIComponent(item.name)}.png`

    const img = new Image()
    img.src = path

    img.onload = () => {

      const objectRadius = item.radius
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight

      //비율 조정
      const scale = (objectRadius * 2) / Math.max(imgWidth, imgHeight)

      const body = Bodies.circle(300, 50, item.radius, {
        index: index,
        isSleeping: true,
        render: {
          sprite: {
            texture: path,
            xScale: scale,
            yScale: scale
          }
        },
        restitution: 0.3 //탄성값
      })
      currentBody.value = body
      currentIcon.value = item
      World.add(world, body)

    }

    img.onerror = () => {
      console.error('Failed to load image:', path)
    }
  }

  addIcons()

  const keyLeft = new Set(['KeyA', 'ArrowLeft'])
  const keyRight = new Set(['KeyD', 'ArrowRight'])
  const keyDown = new Set(['KeyS', 'ArrowDown', 'Space'])


  addEventListener('keyup', (e) => {

    if(keyLeft.has(e.code) || keyRight.has(e.code) || keyDown.has(e.code)){
      clearInterval(interval.value)
      interval.value = null
    }
    console.log('interval',interval.value)
  })

  addEventListener('keydown', (e) => {
    if (!disable.value) {

      if (interval.value) return

      if (keyLeft.has(e.code) && (currentBody.value.position.x) - currentIcon.value.radius > 30) {
        interval.value = setInterval(() => {
          Body.setPosition(currentBody.value, {
            x: currentBody.value.position.x - 1,
            y: currentBody.value.position.y
          })
        }, 5)
      } else if (keyRight.has(e.code) && (currentBody.value.position.x) + currentIcon.value.radius < 590) {
        interval.value = setInterval(() => {
          Body.setPosition(currentBody.value, {
            x: currentBody.value.position.x + 1,
            y: currentBody.value.position.y
          })
        }, 5)
      } else if (keyDown.has(e.code)) {
        currentBody.value.isSleeping = false
        disable.value = true
        setTimeout(() => {
          if(!victory.value){
            addIcons()
          }
          disable.value = false
        }, 700)

      }


    }
  })

  Events.on(engine, 'collisionStart', (event) => {

    event.pairs.forEach((collision) => {
      if (collision.bodyA.index === collision.bodyB.index) {
        const index = collision.bodyA.index
        if (index === Icons.length - 2) {
          victory.value = true
          setTimeout(()=>{
            victory.value = true
            alert('Victory !')
          },1000)
        }

        World.remove(world, [collision.bodyA, collision.bodyB])

        const newIcon = Icons[index + 1]
        let path = `/icons/${encodeURIComponent(newIcon.name)}.png`
        const img = new Image()
        img.src = path

        img.onload = () => {
          const objectRadius = newIcon.radius
          const imgWidth = img.naturalWidth
          const imgHeight = img.naturalHeight
          const scale = (objectRadius * 2) / Math.max(imgWidth, imgHeight)

          const newBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newIcon.radius,
            {
              index: index + 1,
              render: {
                sprite: {
                  texture: path,
                  xScale: scale,
                  yScale: scale
                }
              }
            }
          )
          World.add(world, newBody)

        }
      }

      if (!disable.value &&
        (collision.bodyA.name === 'top' || collision.bodyB.name === 'top')
      ) {
        alert('Game Over !')
      }

    })
  })


})

onUnmounted(() => {
  Render.stop(render)
  runner && Runner.stop(runner)
  render.canvas.remove() // 캔버스 삭제
  render.textures = {} // 텍스처 초기화
})

</script>

<style scoped>

</style>