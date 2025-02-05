<script lang="ts">
import GameCanvas from "@/components/GameCanvas.vue";

export default {
  name: "HomeView",
  components: {
    GameCanvas,
  },
};
</script>

<template>
  <GameCanvas />
</template>

<style>
#GameCanvas {
  background-color: rgb(255, 255, 255);
  height: 80vh;
  width: 100vh;
  box-shadow: inset 2px black;
  border: 3px solid rgb(61, 60, 73);
}
</style>
