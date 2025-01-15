<template>
  <div class="home">
    <h1>Welcome to the Drawing App!</h1>
    <router-link to="/lobby">Enter Lobby</router-link>
  </div>
</template>

<script lang="ts">
export default {
  name: "HomeView",
};
</script>

<style scoped>
.home {
  text-align: center;
  border: 2px solid pink;
}
</style>
