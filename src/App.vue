<template>
  <div class="app">
    <div><MainHeader /></div>
    <div class="HomeContainer"><HomeView /></div>
  </div>
</template>

<script lang="ts">
import MainHeader from "./components/MainHeader.vue";
import HomeView from "./views/HomeView.vue";
export default {
  name: "App",
  components: {
    HomeView,
    MainHeader,
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #66667d;
}

.HomeContainer {
  /* border: 4px solid pink; */
  flex-grow: 1;
}
</style>
