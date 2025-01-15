import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "Home", component: () => import("../views/HomeView.vue") },
  {
    path: "/lobby",
    name: "Lobby",
    component: () => import("../views/LobbyView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
