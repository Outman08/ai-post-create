import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => ({
  requestMiddleware: [],
  csrf: false, // 彻底禁用默认 CSRF 中间件，避免 isomorphic 替换错误
}));
