<template>
  <div id="app">
    <div id="Header">
      <h1 class="left-text">Beri Beri Drawing</h1>
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
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; 
}
#Header {
  width: 100vw;
  height: 7vh;
  background-color: #3e3e59;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  /* border-bottom: 2px solid rgb(23, 128, 0); */
  margin: 0;
  position: fixed; 
  top: 0;
  left: 0;
  z-index: 10;
}

#Header .left-text {
  color: rgb(0, 0, 0);
  font-size: 4vh; 
}

#Header .right-text {
  color: white;
  font-size: 2vh;
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
  border: 3px solid rgb(61, 60, 73);
}
</style>
