import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const trimmedText = text.trim();

    // Method 1: Modern Clipboard API (requires secure context)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(trimmedText);
      return true;
    }

    // Method 2: Fallback using execCommand
    const textArea = document.createElement("textarea");
    textArea.value = trimmedText;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (success) return true;

    // Method 3: If in iframe, ask parent window to copy
    if (window.parent !== window) {
      window.parent.postMessage({ type: "copy-to-clipboard", text: trimmedText }, "*");
      return true;
    }

    return false;
  } catch (err) {
    console.error("Failed to copy text:", err);
    // Last resort: try parent window
    if (window.parent !== window) {
      window.parent.postMessage({ type: "copy-to-clipboard", text: text.trim() }, "*");
      return true;
    }
    return false;
  }
}
