<template>
  <div id="app">
    <MainHeader />
    <HomeView id="GameCanvas" />
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

#app {
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #5f5f78;
  /* border: 3px solid rgb(68, 156, 176); */
  margin-top: 0;
}
</style>
