import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const trimmedText = text.trim();
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(trimmedText);
      return true;
    } else {
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
      return success;
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}
