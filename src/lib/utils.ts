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

    // Method 2: Fallback using execCommand("copy") + focus()/select()。
    //
    // 复制失效的真正原因：不能只靠 readOnly + setSelectionRange（尤其不 focus）。
    // 只读控件在部分引擎（尤其 WebKit/Safari）上无法建立程序化选区，
    // 于是 execCommand("copy") 拷贝不到内容 → 复制为空。必须 focus() + select()。
    //
    // 不跳顶的关键（布局）：position: fixed 相对「视口」定位，top: 0 让元素纵向一直处在
    // 视口顶部可见范围内、仅用 left: -999999px 横向移出屏幕。
    // 这样 focus()/select() 只发生横向滚动、不改变 iframe 纵向 scrollY，从根本上避免"跳回顶部"；
    // 另外再用 focus({ preventScroll: true }) + 复制后恢复滚动作双重保险。
    const savedScrollX = window.scrollX;
    const savedScrollY = window.scrollY;

    const textArea = document.createElement("textarea");
    textArea.value = trimmedText;
    // 注意：不要设 readOnly。保持可编辑 + focus/select 才是跨引擎复制成功的正解。
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-999999px";
    textArea.style.opacity = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";

    document.body.appendChild(textArea);

    let success = false;
    try {
      textArea.focus({ preventScroll: true } as FocusOptions);
      textArea.select();
      success = document.execCommand("copy");
    } catch {
      success = false;
    }

    document.body.removeChild(textArea);

    // 保险：若有任何横向/纵向偏移都恢复到点击前的位置
    if (window.scrollX !== savedScrollX || window.scrollY !== savedScrollY) {
      window.scrollTo(savedScrollX, savedScrollY);
    }
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
