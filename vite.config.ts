import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "patch-csrf-middleware",
        transform(code, id) {
          // 只替换 server-core 里的 defaultCsrfMiddleware 创建
          if (id.includes("@tanstack/start-server-core") && id.includes("createStartHandler")) {
            return code.replace(
              /var defaultCsrfMiddleware = createCsrfMiddleware\([^)]+\);/g,
              "var defaultCsrfMiddleware = null; // 已禁用 CSRF",
            );
          }
          return code;
        },
      },
    ],
  },
});
