<template>
  <div class="canvas-container">
    <canvas
      ref="canvas"
      @pointerdown="startDrawing"
      @pointermove="draw"
      @pointerup="stopDrawing"
      @pointerleave="stopDrawing"
    ></canvas>
    <input
      type="color"
      id="colorPicker"
      v-model="currentColor"
      @input="updateColor"
    />
    <input
      type="range"
      id="lineWidthSlider"
      v-model="lineWidth"
      min="1"
      max="10"
      step="1"
      @input="updateLineWidth"
    />
    <input
      type="range"
      id="opacitySlider"
      v-model="opacity"
      min="0"
      max="1"
      step="0.01"
      @input="updateOpacity"
    />
    <button @click="switchDrawingMode">Erase/Clear</button>
    <button @click="clearCanvas">Clear</button>
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
    const currentColor = ref("#000000");
    let drawingMode = true;
    const opacity = ref(1);
    const lineWidth = ref(5);
    let lastX = 0;
    let lastY = 0;

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
      lastX = pos.x;
      lastY = pos.y;

      if (!drawingMode) {
        ctx.value.globalCompositeOperation = "destination-out";
      } else {
        ctx.value.globalCompositeOperation = "source-over";
      }
    };

    const draw = (event: PointerEvent) => {
      if (!isDrawing.value || !ctx.value) return;
      const pos = getMousePos(event);

      if (drawingMode) {
        // Normal drawing
        ctx.value.beginPath();
        ctx.value.moveTo(lastX, lastY);
        ctx.value.lineTo(pos.x, pos.y);
        ctx.value.stroke();
      } else {
        // Erasing - using a line-based approach for smoother erasing
        ctx.value.beginPath();
        ctx.value.moveTo(lastX, lastY);
        ctx.value.lineTo(pos.x, pos.y);
        //ctx.value.lineWidth = lineWidth.value * 2; // Wider stroke for eraser
        ctx.value.stroke();

        // Add circular caps at the start and end points for smoother erasing
        ctx.value.beginPath();
        ctx.value.arc(lastX, lastY, lineWidth.value, 0, Math.PI * 2);
        ctx.value.fill();
        ctx.value.beginPath();
        ctx.value.arc(pos.x, pos.y, lineWidth.value, 0, Math.PI * 2);
        ctx.value.fill();
      }

      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDrawing = () => {
      if (!ctx.value) return;
      isDrawing.value = false;
      // Reset composite operation to default
      ctx.value.globalCompositeOperation = "source-over";
    };

    const switchDrawingMode = () => {
      drawingMode = !drawingMode;
      if (ctx.value) {
        if (!drawingMode) {
          ctx.value.globalCompositeOperation = "destination-out";
        } else {
          ctx.value.globalCompositeOperation = "source-over";
        }
      }
    };

    const updateColor = () => {
      if (ctx.value) {
        const rgba = hexToRgba(currentColor.value, opacity.value);
        ctx.value.strokeStyle = rgba;
        ctx.value.fillStyle = rgba;
      }
    };

    const updateOpacity = () => {
      if (ctx.value) {
        const rgba = hexToRgba(currentColor.value, opacity.value);
        ctx.value.strokeStyle = rgba;
        ctx.value.fillStyle = rgba;
      }
    };

    const hexToRgba = (hex: string, opacity: number): string => {
      let r: number, g: number, b: number;
      if (hex.startsWith("#")) {
        hex = hex.slice(1);
      }
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const updateLineWidth = () => {
      if (ctx.value) {
        ctx.value.lineWidth = lineWidth.value;
      }
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
    const clearCanvas = () => {
      if (!canvas.value || !ctx.value) return;
      // Clear the entire canvas
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    };

    onMounted(() => {
      if (canvas.value) {
        const resolutionWidth = 800;
        const resolutionHeight = 600;
        canvas.value.width = resolutionWidth;
        canvas.value.height = resolutionHeight;

        ctx.value = canvas.value.getContext("2d", {
          willReadFrequently: true, // Optimize for frequent pixel manipulation
        });

        if (ctx.value) {
          ctx.value.strokeStyle = "black";
          ctx.value.lineWidth = lineWidth.value;
          ctx.value.lineCap = "round"; // Rounded line endings
          ctx.value.lineJoin = "round"; // Rounded line joins
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
      clearCanvas,
      switchDrawingMode,
      currentColor,
      updateColor,
      opacity,
      lineWidth,
      updateOpacity,
      updateLineWidth,
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
