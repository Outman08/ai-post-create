import { Redis } from "@upstash/redis";
import { getRequest } from "@tanstack/react-start/server";

// ── 限流参数 ────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 10; // 单 IP 最多 10 次
const RATE_LIMIT_WINDOW_S = 60 * 60; // 1 小时窗口（秒）

/**
 * 从当前请求中获取客户端 IP。
 *
 * Vercel / Cloudflare 等托管平台会自动注入 `x-forwarded-for` 头，
 * 第一个值即为客户端真实公网 IP（按"客户端→代理1→代理2→后端"顺序）。
 *
 * 注意：x-forwarded-for 可被客户端伪造，但 Vercel 会覆写为可信值，
 * 我们只读取它，不再信任客户端自带的其它头，避免被绕过。
 */
function getClientIp(): string {
  const request = getRequest();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  // 本地开发 fallback
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

// 懒加载 Redis 客户端，未配置环境变量时为 null
let _redis: Redis | null = null;
let _redisChecked = false;
function getRedis(): Redis | null {
  if (_redisChecked) return _redis;
  _redisChecked = true;
  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];
  if (!url || !token) {
    console.warn("[rate-limit] Upstash 未配置，跳过限流。");
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// lua 脚本：原子完成 INCR + 条件 EXPIRE + 取 TTL
//   count = INCR key           -- 自增并返回当前计数
//   if count == 1 then EXPIRE  -- 仅在首次创建 key 时设置过期，保证窗口稳定
//   return {count, TTL}       -- TTL 用于告知客户端还需等待多久
const RATE_LIMIT_LUA = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return {count, redis.call('TTL', KEYS[1])}
`;

/**
 * 基于 Upstash Redis 的 IP 维度限流。
 *
 * 实现要点：
 * 1. 用 lua 脚本在 Redis 服务端原子完成 INCR + 条件 EXPIRE + 取 TTL，
 *    避免"先 INCR 后 EXPIRE"的并发竞态，也避免每次 INCR 都重置过期时间。
 * 2. 未配置 Upstash 环境变量时回退为"放行"并打印警告，避免阻断主流程；
 *    生产部署务必配置 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN。
 * 3. Upstash 调用失败时同样放行，避免 Redis 抖动导致用户完全无法使用；
 *    可在监控告警里观察 [rate-limit] 日志。
 *
 * @param scope 限流命名空间，例如 "post-creator"。不同 AI 页面应使用
 *              不同 scope，避免互相挤占额度（用户在 A 页用满 10 次
 *              不应影响 B 页）。
 * @param options 可选的自定义限流参数，未传则使用默认值（10 次/小时）。
 */
export async function checkRateLimit(
  scope: string,
  options?: { max?: number; windowSeconds?: number },
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const redis = getRedis();
  if (!redis) return { ok: true };

  const ip = getClientIp();
  const key = `rl:${scope}:${ip}`;

  const max = options?.max ?? RATE_LIMIT_MAX;
  const windowSeconds = options?.windowSeconds ?? RATE_LIMIT_WINDOW_S;

  let result: [number, number];
  try {
    // SDK 的 eval: (script, keys, args) => Promise<TData>
    // 这里 lua 返回 {count, ttl}，SDK 会解析为 [number, number]
    const raw = await redis.eval<[string], [number, number]>(
      RATE_LIMIT_LUA,
      [key],
      [String(windowSeconds)],
    );
    result = raw;
  } catch (err) {
    console.error("[rate-limit] Upstash 调用异常，放行：", err);
    return { ok: true };
  }

  const [count, ttl] = result;
  if (count > max) {
    // ttl 为 -1 表示 key 无过期（理论上不会发生），回退到窗口时长
    const retryAfterMs = ttl > 0 ? ttl * 1000 : windowSeconds * 1000;
    return { ok: false, retryAfterMs };
  }

  return { ok: true };
}

export const RATE_LIMIT_INFO = {
  max: RATE_LIMIT_MAX,
  windowMinutes: RATE_LIMIT_WINDOW_S / 60,
} as const;

export const RATE_LIMIT_MESSAGE =
  "[RATE_LIMIT] You've reached the usage limit for this tool. Please try again later";
