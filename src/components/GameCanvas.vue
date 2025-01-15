<template>
  <div class="canvas-container">
    <canvas
      ref="canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";

export default {
  name: "GameCanvas",
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const isDrawing = ref(false);

    const getMousePos = (event: MouseEvent) => {
      if (!canvas.value) return { x: 0, y: 0 };
      const rect = canvas.value.getBoundingClientRect();
      return {
        x: event.clientX - rect.left, // Adjust X relative to canvas
        y: event.clientY - rect.top, // Adjust Y relative to canvas
      };
    };

    const startDrawing = (event: MouseEvent) => {
      if (!ctx.value) return;
      isDrawing.value = true;
      const pos = getMousePos(event);
      ctx.value.beginPath();
      ctx.value.moveTo(pos.x, pos.y);
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing.value || !ctx.value) return;
      const pos = getMousePos(event);
      ctx.value.lineTo(pos.x, pos.y);
      ctx.value.stroke();
    };

    const stopDrawing = () => {
      if (!ctx.value) return;
      isDrawing.value = false;
      ctx.value.closePath();
    };

    onMounted(() => {
      if (canvas.value) {
        canvas.value.width = window.innerWidth * 0.7; // Example: 80% of window width
        canvas.value.height = window.innerHeight * 0.7; // Example: 80% of window height
        ctx.value = canvas.value.getContext("2d");
        if (ctx.value) {
          ctx.value.strokeStyle = "black";
          ctx.value.lineWidth = 2;
        }
      }
    });

    return { canvas, startDrawing, draw, stopDrawing };
  },
};
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}
canvas {
  /* border: 2px solid rgb(218, 32, 32); */
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
