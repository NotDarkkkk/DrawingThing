<template>
  <div id="app">
    <h1>Drawing App</h1>
    <GameCanvas />
  </div>
</template>

<script lang="ts">
import GameCanvas from "./components/GameCanvas.vue";

export default {
  name: "App",
  components: {
    GameCanvas,
  },
};
</script>

<style>
#app {
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
