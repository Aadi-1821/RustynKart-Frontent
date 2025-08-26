import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    cors: true,
    proxy: {
      "/api": {
        target: "https://rustynkart-backend.onrender.com",
        changeOrigin: true,
        secure: false,
        xfwd: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        headers: {
          Origin: "https://rustynkart-backend.onrender.com",
        },
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            // Copy Authorization header if it exists
            if (req.headers.authorization) {
              proxyReq.setHeader("Authorization", req.headers.authorization);
            }
            console.log("Sending Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
