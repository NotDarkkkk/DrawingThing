<template>
  <div id="app">
    <div id="Header">
      <h1>Beri Beri Drawing</h1>
    </div>
    <div id="GameCanvas">
      <GameCanvas />
    </div>
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
#Header {
  width: 100vw;
  height: 60px;
  background-color: #3e3e59;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  /* border-bottom: 2px solid rgb(23, 128, 0); */
  margin: 0;
  position: fixed; /* Fix the header at the top of the screen */
  top: 0;
  left: 0;
  z-index: 10;
}

#Header .left-text {
  color: white;
  font-size: 20px; /* Adjust font size */
}

#Header .right-text {
  color: white;
  font-size: 20px; /* Adjust font size */
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
  margin-top: 0; /* Ensure the content below the header starts at the top */
}

#GameCanvas {
  background-color: rgb(255, 255, 255);
  height: 80vh;
  width: 100vh;
  box-shadow: inset 2px black;
  /* border: 3px solid rgb(77, 68, 176); */
}
</style>
