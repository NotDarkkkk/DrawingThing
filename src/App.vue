<template>
  <div id="app">
    <h1>Drawing App</h1>
    <Canvas/>
  </div>
</template>

<script lang="ts">
import Canvas from './components/Canvas.vue';

export default {
  name: 'App',
  components: {
    Canvas,
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
