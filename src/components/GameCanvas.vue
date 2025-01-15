<template>
  <div class="canvas-container">
    <canvas
      ref="canvas"
      @pointerdown="startDrawing"
      @pointermove="draw"
      @pointerup="stopDrawing"
      @pointerleave="stopDrawing"
    ></canvas>
    <button @click="downloadCanvas">Download</button>
    <button @click="downloadCanvasBackgroundless">
      Download Backgroundless
    </button>
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

    const getMousePos = (event: PointerEvent) => {
      if (!canvas.value) return { x: 0, y: 0 };
      const rect = canvas.value.getBoundingClientRect();
      const scaleX = canvas.value.width / rect.width;
      const scaleY = canvas.value.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (event: PointerEvent) => {
      if (!ctx.value) return;
      isDrawing.value = true;
      const pos = getMousePos(event);
      ctx.value.beginPath(); // Start a new path when drawing starts
      ctx.value.moveTo(pos.x, pos.y); // Set the starting position
    };

    const draw = (event: PointerEvent) => {
      if (!isDrawing.value || !ctx.value) return;
      const pos = getMousePos(event);
      ctx.value.lineTo(pos.x, pos.y); // Draw to the new position
      ctx.value.stroke(); // Apply the stroke
    };

    const stopDrawing = () => {
      if (!ctx.value) return;
      isDrawing.value = false;
      ctx.value.closePath(); // End the drawing path
    };

    const downloadCanvasBackgroundless = () => {
      if (!canvas.value) return;

      // Convert canvas content to a data URL
      const dataURL = canvas.value.toDataURL("image/png");

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-drawing.png"; // Name of the downloaded file

      // Trigger the download
      link.click();
    };

    const downloadCanvas = () => {
      if (!canvas.value || !ctx.value) return;

      // Get the image data from the canvas
      const imageData = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      const data = imageData.data;

      // Loop through all the pixels and check for transparency
      for (let i = 0; i < data.length; i += 4) {
        // If the alpha value (data[i + 3]) is 0 (transparent), set the pixel to white
        if (data[i + 3] === 0) {
          data[i] = 255; // R (Red) = 255 (white)
          data[i + 1] = 255; // G (Green) = 255 (white)
          data[i + 2] = 255; // B (Blue) = 255 (white)
          data[i + 3] = 255; // A (Alpha) = 255 (fully opaque)
        }
      }

      // Put the updated image data back on the canvas
      ctx.value.putImageData(imageData, 0, 0);

      // Convert canvas content to a data URL
      const dataURL = canvas.value.toDataURL("image/png");

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-drawing.png"; // Name of the downloaded file

      // Trigger the download
      link.click();
    };

    onMounted(() => {
      if (canvas.value) {
        // Set canvas resolution
        const resolutionWidth = 800; // Example: Set your desired resolution width
        const resolutionHeight = 600; // Example: Set your desired resolution height
        canvas.value.width = resolutionWidth;
        canvas.value.height = resolutionHeight;

        ctx.value = canvas.value.getContext("2d");
        if (ctx.value) {
          ctx.value.strokeStyle = "black";
          ctx.value.lineWidth = 2;
        }
      }
    });

    return {
      canvas,
      startDrawing,
      draw,
      stopDrawing,
      downloadCanvas,
      downloadCanvasBackgroundless,
    };
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
  touch-action: none; /* Disable touch gestures that interfere with drawing */
  pointer-events: auto; /* Ensure pointer events are enabled */
}
</style>
