<template>
  <div class="canvas-container">
    <div id="custom-cursor" :style="cursorStyle"></div>
    <canvas
      ref="canvas"
      @pointerdown="startDrawing"
      @pointermove="handlePointerMove"
      @pointerup="stopDrawing"
      @pointerleave="stopDrawing"
    ></canvas>
    <div class="control-item">
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
        max="20"
        step="1"
        @input="updateCursorSize"
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
      <button @click="switchDrawingMode">Erase/Draw</button>
      <button @click="clearCanvas">Clear</button>
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
      <button @click="downloadCanvas" class="icon-button">
        <img
          :src="require('@/assets/download-button.svg')"
          alt="Download Canvas"
        />
      </button>
      <button @click="downloadCanvasBackgroundless">
        Download Backgroundless
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

export default {
  name: "GameCanvas",
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const isDrawing = ref(false);
    const currentColor = ref("#000000");
    let drawingMode = true;
    const opacity = ref(1);
    const lineWidth = ref(10);
    let lastX = 0;
    let lastY = 0;
    let currentPath: Path2D | null = null;
    const cursorX = ref(0);
    const cursorY = ref(0);
    const cursorVisible = ref(false);
    const cursorSize = ref(lineWidth.value);
    const undoStack = ref<ImageData[]>([]);
    const redoStack = ref<ImageData[]>([]);
    const maxStackSize = 50;
    let savedState: ImageData | null = null;
    let isUndoRedoing = false; // Flag to prevent saving states during undo/redo

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

    const handlePointerMove = (event: PointerEvent) => {
      updateCursorPosition(event);
      if (isDrawing.value) {
        draw(event);
      }
    };

    // New function to handle window-level pointer move
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (isDrawing.value) {
        updateCursorPosition(event);
        draw(event);
      }
    };

    const updateCursorPosition = (event: PointerEvent) => {
      if (!canvas.value) return;
      const rect = canvas.value.getBoundingClientRect();
      const padding = cursorSize.value * 10;

      // Calculate cursor position even when outside canvas
      cursorX.value = event.clientX - rect.left;
      cursorY.value = event.clientY - rect.top;

      // Update cursor visibility with extended range
      cursorVisible.value =
        cursorX.value >= -padding &&
        cursorX.value <= rect.width + padding &&
        cursorY.value >= -padding &&
        cursorY.value <= rect.height + padding;
    };

    const hideCursor = () => {
      cursorVisible.value = false;
    };

    const cursorStyle = computed(() => ({
      width: `${cursorSize.value}px`,
      height: `${cursorSize.value}px`,
      left: `${cursorX.value}px`,
      top: `${cursorY.value}px`,
      opacity: cursorVisible.value ? 1 : 0,
      transform: "translate(-50%, -50%)",
      backgroundColor: drawingMode
        ? "rgba(120, 120, 120, 0.0)"
        : "rgba(255, 255, 255, 0.6)",
      border: drawingMode
        ? "2px solid rgba(0, 0, 0, 0.5)"
        : "2px solid rgba(120, 120, 120, 0.5)",
    }));

    const updateCursorSize = () => {
      cursorSize.value = drawingMode ? lineWidth.value : lineWidth.value * 2;
      console.log("Updated Cursor Size");
    };

    const startDrawing = (event: PointerEvent) => {
      if (!ctx.value || !canvas.value) return;
      savedState = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );

      isDrawing.value = true;
      const pos = getMousePos(event);
      lastX = pos.x;
      lastY = pos.y;

      currentPath = new Path2D();
      currentPath.moveTo(pos.x, pos.y);

      if (!drawingMode) {
        ctx.value.globalCompositeOperation = "destination-out";
        ctx.value.lineWidth = lineWidth.value * 2;
        cursorSize.value = lineWidth.value * 2;
      } else {
        ctx.value.globalCompositeOperation = "source-over";
        ctx.value.lineWidth = lineWidth.value;
        cursorSize.value = lineWidth.value;
      }
    };

    const draw = (event: PointerEvent) => {
      if (!isDrawing.value || !ctx.value || !currentPath || !canvas.value)
        return;
      const pos = getMousePos(event);

      const dx = pos.x - lastX;
      const dy = pos.y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        if (distance < 3) {
          currentPath.quadraticCurveTo(
            lastX,
            lastY,
            (pos.x + lastX) / 2,
            (pos.y + lastY) / 2
          );
        } else {
          const ctrl1x = lastX + dx / 3;
          const ctrl1y = lastY + dy / 3;
          const ctrl2x = pos.x - dx / 3;
          const ctrl2y = pos.y - dy / 3;
          currentPath.bezierCurveTo(
            ctrl1x,
            ctrl1y,
            ctrl2x,
            ctrl2y,
            pos.x,
            pos.y
          );
        }

        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

        if (savedState) {
          ctx.value.putImageData(savedState, 0, 0);
        }

        ctx.value.beginPath();
        ctx.value.stroke(currentPath);
      }

      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDrawing = () => {
      if (!ctx.value || !currentPath || !canvas.value) return;
      isDrawing.value = false;

      if (!isUndoRedoing && savedState) {
        undoStack.value.push(savedState);
        redoStack.value = [];
      }

      savedState = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );

      currentPath = null;

      ctx.value.globalCompositeOperation = "source-over";
      ctx.value.lineWidth = lineWidth.value;
    };

    const switchDrawingMode = () => {
      drawingMode = !drawingMode;
      if (ctx.value) {
        if (!drawingMode) {
          ctx.value.globalCompositeOperation = "destination-out";
          ctx.value.lineWidth = lineWidth.value * 2;
          cursorSize.value = lineWidth.value * 2;
        } else {
          ctx.value.globalCompositeOperation = "source-over";
          ctx.value.lineWidth = lineWidth.value;
          cursorSize.value = lineWidth.value;
        }
      }
      updateCursorSize();
      console.log("Switched Drawing Mode");
    };

    const updateColor = () => {
      if (ctx.value) {
        const rgba = hexToRgba(currentColor.value, opacity.value);
        ctx.value.strokeStyle = rgba;
        ctx.value.fillStyle = rgba;
      }
      console.log("Switched Color");
    };

    const updateOpacity = () => {
      if (ctx.value) {
        const rgba = hexToRgba(currentColor.value, opacity.value);
        ctx.value.strokeStyle = rgba;
        ctx.value.fillStyle = rgba;
      }
      console.log("Switched Opacity");
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
      console.log("Updated Line Width");
    };

    const downloadCanvasBackgroundless = () => {
      if (!canvas.value) return;
      const dataURL = canvas.value.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-drawing.png";
      link.click();
    };

    const downloadCanvas = () => {
      if (!canvas.value || !ctx.value) return;
      const imageData = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      }

      ctx.value.putImageData(imageData, 0, 0);
      const dataURL = canvas.value.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-drawing.png";
      link.click();
    };

    const clearCanvas = () => {
      if (!canvas.value || !ctx.value) return;
      saveState();
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    };

    const saveState = () => {
      if (!canvas.value || !ctx.value || isUndoRedoing) return;

      const imageData = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );

      undoStack.value.push(imageData);
      redoStack.value = [];

      if (undoStack.value.length > maxStackSize) {
        undoStack.value.shift();
      }
    };

    const undo = () => {
      if (!canvas.value || !ctx.value || undoStack.value.length === 0) return;

      isUndoRedoing = true;

      const currentState = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      redoStack.value.push(currentState);

      const previousState = undoStack.value.pop();
      if (previousState) {
        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        ctx.value.putImageData(previousState, 0, 0);
      }

      isUndoRedoing = false;
    };

    const redo = () => {
      if (!canvas.value || !ctx.value || redoStack.value.length === 0) return;

      isUndoRedoing = true;

      const currentState = ctx.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      undoStack.value.push(currentState);

      const nextState = redoStack.value.pop();
      if (nextState) {
        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        ctx.value.putImageData(nextState, 0, 0);
      }

      isUndoRedoing = false;
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" || event.key === "Z") {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (event.key === "y") {
          event.preventDefault();
          redo();
        }
      }
    };

    onMounted(() => {
      if (canvas.value) {
        const resolutionWidth = 800;
        const resolutionHeight = 600;
        canvas.value.width = resolutionWidth;
        canvas.value.height = resolutionHeight;

        ctx.value = canvas.value.getContext("2d", {
          willReadFrequently: true,
        });

        if (ctx.value) {
          ctx.value.strokeStyle = "black";
          ctx.value.lineWidth = lineWidth.value;
          ctx.value.lineCap = "round";
          ctx.value.lineJoin = "round";
          // Enable stroke smoothing
          ctx.value.imageSmoothingEnabled = true;
          ctx.value.imageSmoothingQuality = "high";
          // Prevent jagged edges
          ctx.value.miterLimit = 1;
        }
        window.addEventListener("keydown", handleKeyboard);
        window.addEventListener("pointermove", handleWindowPointerMove);
        window.addEventListener("pointerup", () => {
          if (isDrawing.value) {
            stopDrawing();
          }
        });
        if (ctx.value) {
          saveState();
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", () => {
        if (isDrawing.value) {
          stopDrawing();
        }
      });
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
      handlePointerMove,
      updateCursorPosition,
      hideCursor,
      cursorStyle,
      updateCursorSize,
      undo,
      redo,
    };
  },
};
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: flex;
  flex-direction: row-reverse;
}
canvas {
  box-shadow: 2vh;
  display: block;
  width: 100%;
  height: 100%;
  cursor: none;
  touch-action: none;
  /* pointer-events: auto; */
}

#custom-cursor {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: width 0.1s, height 0.1s, transform 0.02s linear;
  z-index: 1000;
}

button {
  background-color: #72788b;
  border: 0 solid #6d6b7460;
  border-radius: 0.5rem;
  box-sizing: border-box;
  color: #0d172a;
  cursor: pointer;
  display: inline-block;
  font-family: "Basier circle", -apple-system, system-ui, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 0.5rem;
  font-weight: 600;
  line-height: 1;
  padding: 0.2rem 0.2rem;
  text-align: center;
  text-decoration: none #0d172a solid;
  text-decoration-thickness: auto;
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0px 1px 2px rgba(166, 175, 195, 0.25);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1vw;
  padding-right: 1vw;
  padding-top: 1vh;
  padding-bottom: 1vh;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 150px;
  height: 8px;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #70739c;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #70739c;
  border-radius: 50%;
  cursor: pointer;
}

input[type="color"] {
  width: 4vw;
  height: 4vh;
  border: 0 solid #6d6b7460;
  cursor: pointer;
  padding: 0;
  background: none;
}

button:hover {
  background-color: #313343;
  transform: scale(1.05);
}

.icon-button img {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}

@media (min-width: 768px) {
  button {
    font-size: 1.125rem;
    padding: 0.4rem 0.4rem;
  }
}
</style>
