import { useEffect } from "react";

export function useIframeHeight(deps: any[] = []) {
  useEffect(() => {
    // 设置 overflow 为 visible
    document.documentElement.style.overflowY = "visible";
    document.body.style.overflowY = "visible";

    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        {
          type: "setIframeHeight",
          height: height,
        },
        "*",
      );
      window.parent.postMessage(
        {
          type: "iframe-height",
          height: height,
        },
        "*",
      );
    }

    // 页面加载、窗口 resize、dom 变化都上报高度
    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    // 额外的 MutationObserver 确保所有 DOM 变化都触发
    const mutationObserver = new MutationObserver(sendHeight);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // 初始发送一次
    sendHeight();

    return () => {
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, deps);
}
