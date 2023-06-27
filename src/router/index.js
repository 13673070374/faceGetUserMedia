import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('@/views/index')
    },
    {
      path: '/bioassay',
      name: 'bioassay',
      component: () => import('@/views/bioassay.vue')
    },
    {
      path: '/bioassay2',
      name: 'bioassay2',
      component: () => import('@/views/bioassay2.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test.vue')
    },
    {
      path: '/test1',
      name: 'test1',
      component: () => import('@/views/test1.vue')
    }
  ]
})
