import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
      name: 'layout',
      path: '/',
      children: [
        {
          path: '/index',
          name: 'index',
          meta: { keepAlive: true },
          component: () => import('@/views/index/index.vue')
        },
      ]
    }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})

export default router