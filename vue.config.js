const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all",
    client: {
      webSocketURL: "wss://localhost:8080/ws", // Change this to your ngrok URL, if necessary
    },
  },
});
