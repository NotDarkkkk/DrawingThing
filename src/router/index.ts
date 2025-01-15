import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/game', name: 'Game', component: () => import('../views/Game.vue') },
  { path: '/lobby', name: 'Lobby', component: () => import('../views/Lobby.vue') },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;