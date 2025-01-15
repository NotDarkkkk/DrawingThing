<!-- <template>
  <div class="toolbar">
    <button @click="setColor('black')" style="background-color: black;"></button>
    <button @click="setColor('red')" style="background-color: red;"></button>
    <button @click="setColor('blue')" style="background-color: blue;"></button>
    <button @click="clearCanvas">Clear</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

export default defineComponent({
  name: 'Toolbar',
  setup() {
    const ctx = inject('ctx'); // Pass the canvas context from parent

    const setColor = (color: string) => {
      if (ctx) {
        ctx.strokeStyle = color;
      }
    };

    const clearCanvas = () => {
      if (ctx && ctx.canvas) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    };

    return { setColor, clearCanvas };
  },
});
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
}
button {
  width: 30px;
  height: 30px;
  border: none;
  cursor: pointer;
  outline: none;
}
</style> -->
