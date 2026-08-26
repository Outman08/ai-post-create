import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const trimmedText = text.trim();

    // Method 1: Modern Clipboard API
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(trimmedText);
        return true;
      } catch {
        // clipboard API 不可用，继续尝试其他方法
      }
    }

    // Method 2: Fallback using execCommand
    // 避免 focus()/select() 把 iframe 页面滚动到顶部：用只读选区 + 复制后恢复滚动位置
    const savedScrollY = window.scrollY;
    const textArea = document.createElement("textarea");
    textArea.readOnly = true;
    textArea.value = trimmedText;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.setSelectionRange(0, textArea.value.length);
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);
    if (success) return true;

    // Method 3: If in iframe, ask parent window to copy
    if (window.parent !== window) {
      window.parent.postMessage({ type: "copy-to-clipboard", text: trimmedText }, "*");
    }

    return false;
  } catch (err) {
    console.error("Failed to copy text:", err);
    // Last resort: try parent window
    if (window.parent !== window) {
      window.parent.postMessage({ type: "copy-to-clipboard", text: text.trim() }, "*");
    }
    return false;
  }
}
