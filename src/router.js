import Vue from 'vue'
import Router from 'vue-router'

import foodFinder from './components/foodFinder.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'foodFinder',
      component: foodFinder
    }
  ]
})