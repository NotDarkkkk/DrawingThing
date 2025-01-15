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
/* Global Reset */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Optional: Ensures no scrollbars appear */
}

#app {
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #3b3ba7;
  /* border: 2px solid rgb(23, 128, 0); */
}
#GameCanvas {
  background-color: rgb(255, 255, 255);
  height: 70vh;
  box-shadow: inset 2px black;
}
</style>
