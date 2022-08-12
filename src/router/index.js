import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/trtystat',
    name: 'trtystat',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/TrTyStatView.vue')
  },
  {
    path: '/nodelink',
    name: 'nodelink',
    component: () => import(/* webpackChunkName: "nodelink" */ '../views/NodeLinkView.vue')
  },
  {
    path: '/rltmcntrl',
    name: 'rltmcntrl',
    component: () => import(/* webpackChunkName: "nodelink" */ '../views/RltmCntrlView.vue')
  },
  {
    path: '/colorpicker',
    name: 'colorpicker',
    component: () => import(/* webpackChunkName: "color" */ '../views/ColorPickerView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  routes: routes
})

export default router
