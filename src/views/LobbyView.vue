<template>
  <div class="lobby">
    <h1>Lobby</h1>
    <p>Waiting for players to join...</p>
    <router-link to="/draw">Start Drawing</router-link>
  </div>
</template>

<script lang="ts">
export default {
  name: "LobbyView",
};
</script>

<style scoped>
.lobby {
  text-align: center;
}
</style>
