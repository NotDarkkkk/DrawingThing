<template>
  <div id="custom-cursor" :style="cursorStyle"></div>
  <div class="canvas-container">
    <div class="control-item">
      <input
        type="color"
        id="colorPicker"
        v-model="currentColor"
        @input="updateColor"
      />
      <div class="slider-container">
        <label for="lineWidthSlider" class="slider-label"
          >Line Width - {{ lineWidth }}</label
        >
        <input
          type="range"
          id="lineWidthSlider"
          v-model="lineWidth"
          min="1"
          max="100"
          step="1"
          @input="updateLineWidth"
        />
      </div>

      <div class="slider-container">
        <label for="opacitySlider" class="slider-label"
          >Opacity - {{ Number(opacity * 100).toFixed(0) }}</label
        >
        <input
          type="range"
          id="opacitySlider"
          v-model="opacity"
          min="0.01"
          max="1"
          step="0.01"
          @input="updateOpacity"
        />
      </div>
      <div class="switch-container">
        <span>Erase</span>
        <label class="switch">
          <input
            type="checkbox"
            @change="switchDrawingMode"
            :checked="drawingMode"
          />
          <span class="slider"></span>
        </label>
        <span>Draw</span>
      </div>
      <button @click="clearCanvas">Clear</button>
    </div>
    <div class="canvas-wrapper">
      <canvas
        ref="canvas"
        @pointerdown="startDrawing"
        @pointermove="handlePointerMove"
        @pointerup="stopDrawing"
      ></canvas>
    </div>

    <div class="control-item">
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
      <button @click="downloadCanvas" class="icon-button">
        <img
          :src="require('@/assets/download-button.svg')"
          alt="Download Canvas"
        />
      </button>
      <!-- <button @click="downloadCanvasBackgroundless">
        Download Backgroundless
      </button> -->
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import type { CSSProperties } from "vue";

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
    const undoStack = ref<ImageData[]>([]);
    const redoStack = ref<ImageData[]>([]);
    const maxStackSize = 50;
    let savedState: ImageData | null = null;
    let isUndoRedoing = false;

    watch(isDrawing, (newValue) => {
      document.body.style.cursor = newValue ? "none" : "default";
    });

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

    const handleWindowPointerMove = (event: PointerEvent) => {
      updateCursorPosition(event);
      if (isDrawing.value) {
        draw(event);
      }
    };

    const updateCursorPosition = (event: PointerEvent) => {
      if (!canvas.value) return;
      const rect = canvas.value.getBoundingClientRect();

      cursorX.value = event.clientX;
      cursorY.value = event.clientY;

      cursorVisible.value =
        isDrawing.value ||
        (cursorX.value >= rect.left &&
          cursorX.value <= rect.right &&
          cursorY.value >= rect.top &&
          cursorY.value <= rect.bottom);
    };
    const cursorStyle = computed<CSSProperties>(() => {
      if (!canvas.value) return {};

      const scaleX = canvas.value.clientWidth / canvas.value.width;
      const scaleY = canvas.value.clientHeight / canvas.value.height;

      return {
        width: `${lineWidth.value * scaleX - 4}px`,
        height: `${lineWidth.value * scaleY - 4}px`,
        left: `${cursorX.value}px`,
        top: `${cursorY.value}px`,
        opacity: cursorVisible.value ? 1 : 0,
        transform: "translate(-50%, -50%)",
        backgroundColor: drawingMode
          ? "rgba(120, 120, 120, 0.0)"
          : "rgba(255, 255, 255, 0.2)",
        border: "4px solid rgb(150, 150, 150)",
        mixBlendMode: "exclusion",
      };
    });

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
        ctx.value.lineWidth = lineWidth.value;
      } else {
        ctx.value.globalCompositeOperation = "source-over";
        ctx.value.lineWidth = lineWidth.value;
      }

      ctx.value.beginPath();
      ctx.value.arc(pos.x, pos.y, lineWidth.value / 2, 0, Math.PI * 2);
      ctx.value.fillStyle = ctx.value.strokeStyle as string;
      ctx.value.fill();

      console.log("Started Drawing");
    };

    const draw = (event: PointerEvent) => {
      if (!isDrawing.value || !ctx.value || !currentPath || !canvas.value)
        return;
      const pos = getMousePos(event);

      const dx = pos.x - lastX;
      const dy = pos.y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const ctrl1x = lastX + dx / 3;
        const ctrl1y = lastY + dy / 3;
        const ctrl2x = pos.x - dx / 3;
        const ctrl2y = pos.y - dy / 3;
        currentPath.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, pos.x, pos.y);

        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

        if (savedState) {
          ctx.value.putImageData(savedState, 0, 0);
        }

        ctx.value.beginPath();
        ctx.value.stroke(currentPath);
      }

      lastX = pos.x;
      lastY = pos.y;

      console.log("Drawing");
    };

    const stopDrawing = () => {
      if (!ctx.value || !canvas.value) return;
      if (!currentPath) {
        console.log("Out of Path");
        return;
      }
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

      // ctx.value.globalCompositeOperation = "source-over";
      // ctx.value.lineWidth = lineWidth.value;

      console.log("Stopped Drawing");
    };

    const switchDrawingMode = (event: Event) => {
      const target = event.target as HTMLInputElement;
      drawingMode = target.checked;

      if (ctx.value) {
        ctx.value.globalCompositeOperation = drawingMode
          ? "source-over"
          : "destination-out";
      }
      console.log("Switched Drawing Mode", drawingMode);
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
        console.log("Initial Drawing Mode: ", drawingMode);
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
      cursorStyle,
      updateCursorPosition,
      undo,
      redo,
      drawingMode,
    };
  },
};
</script>

<style scoped>
.canvas-container {
  position: relative;
  padding-top: 2%;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-family: "Basier circle", -apple-system, system-ui, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* border: 3px solid rgb(91, 202, 60); */
  user-select: none;
}
canvas {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: none;
  touch-action: none;
  /* pointer-events: auto; */
  background-color: rgb(255, 255, 255);
  min-width: 100%;
  min-height: 100%;
  cursor: none;
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
  /* border: 3px solid rgb(255, 0, 0); */
}

.canvas-wrapper {
  position: relative;
  height: 80%;
  aspect-ratio: 4 / 3;
  border: 4px solid rgb(52, 52, 57);
}

#custom-cursor {
  position: absolute;
  display: "block";
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: width 0 01s, height 0.1s, transform 0.02s linear;
  z-index: 1000;
}
.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  /* border: 3px solid rgb(255, 0, 0); */
}

#custom-cursor {
  position: absolute;
  pointer-events: none;
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

.slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-label {
  font-weight: 600;
  line-height: 1;
  margin-bottom: 5px; /* Adds spacing between label and slider */
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
  font-weight: 600;
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
  width: 80%;
  height: 4vh;
  border: 0;
  cursor: pointer;
  padding: 0;
  background: none;
  min-height: 30px;
  min-width: 30px;
  appearance: none;
  border-radius: 10%;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  border-radius: 10%;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: 4px solid #313343;
  border-radius: 10%; /* Makes it circular */
}

button:hover {
  background-color: #313343;
  transform: scale(1.05);
}

.icon-button img {
  width: 20px;
  height: 20px;
}

@media (min-width: 768px) {
  button {
    font-size: 1.125rem;
    padding: 0.4rem 0.4rem;
  }
}

.switch-container {
  display: flex;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #808ab0;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

span {
  font-weight: 600;
}
</style>
