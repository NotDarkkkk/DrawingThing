<template>
  <div id="app">
    <h1>Beri Beri Drawing</h1>
    <GameCanvas id="GameCanvas" />
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
  background-color: #424258;
  border: 2px solid purple;
}
#GameCanvas {
  background-color: antiquewhite;
  height: 40vh;
}
</style>
