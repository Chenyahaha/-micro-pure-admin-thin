import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 7201,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
});
