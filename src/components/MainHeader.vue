<template>
  <div id="Header">
    <h1 class="left-text">Drawing Thing</h1>
  </div>
</template>

<script>
export default {
  name: "MainHeader",
};
</script>

<style>
#Header {
  width: 100vw;
  height: 7vh;
  background-color: #3e3e59;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  /* border: 2px solid rgb(124, 1, 247); */
  margin: 0;
  position: relative;
  top: 0;
  left: 0;
  z-index: 10;
  font-family: "Basier circle", -apple-system, system-ui, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

#Header .left-text {
  color: rgb(0, 0, 0);
  font-size: 4vh;
}

#Header .right-text {
  color: white;
  font-size: 2vh;
}
</style>
