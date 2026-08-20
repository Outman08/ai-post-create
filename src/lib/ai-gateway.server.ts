import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// DeepSeek API 完全兼容 OpenAI 接口，沿用 @ai-sdk/openai-compatible 即可。
// 文档：https://api-docs.deepseek.com/
export function createDeepSeekProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "deepseek",
    baseURL: "https://api.deepseek.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
