import { createSignal, For, Show, onMount } from "solid-js";
import MessageItem from "./MessageItem";
import IconClear from "./icons/Clear";
import type { ChatMessage } from "@/types";
import hotkeys from "hotkeys-js";

export default () => {
  let inputRef: HTMLTextAreaElement;
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleButtonClick = async () => {
    const inputValue = inputRef.value;
    if (!inputValue) {
      return;
    }
    setLoading(true);
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate");
    inputRef.value = "";
    setMessageList([
      ...messageList(),
      {
        role: "user",
        content: inputValue,
      },
    ]);

    const response = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        messages: messageList(),
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data) {
      throw new Error("No data");
    }
    const reader = data.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        let char = decoder.decode(value);
        if (char === "\n" && currentAssistantMessage().endsWith("\n")) {
          continue;
        }
        if (char) {
          setCurrentAssistantMessage(currentAssistantMessage() + char);
        }
        // window.scrollTo({
        //   top: document.body.scrollHeight,
        //   behavior: "smooth",
        // });
      }
      done = readerDone;
    }
    setMessageList([
      ...messageList(),
      {
        role: "assistant",
        content: currentAssistantMessage(),
      },
    ]);
    setCurrentAssistantMessage("");
    setLoading(false);
    inputRef.focus();
  };

  const clear = () => {
    inputRef.value = "";
    setMessageList([]);
    setCurrentAssistantMessage("");
  };

  onMount(() => {
    console.log("onMount");
    hotkeys("command+k", (event, handler) => {
      // 处理键盘事件
      clear();
    });

    // 组件卸载时解除键盘监听
    return () => {
      hotkeys.unbind("command+k");
    };
  });

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "k") {
      clear();
    }
    if (e.isComposing || e.shiftKey) {
      return;
    }
    if (e.key === "Enter") {
      handleButtonClick();
    }
  };

  return (
    <div my-6>
      <For each={messageList()}>
        {(message) => (
          <MessageItem role={message.role} message={message.content} />
        )}
      </For>
      {currentAssistantMessage() && (
        <MessageItem role="assistant" message={currentAssistantMessage} />
      )}
      <Show
        when={!loading()}
        fallback={() => (
          <div class="h-12 my-4 flex items-center justify-center bg-slate bg-op-15 text-slate rounded-sm">
            AI is thinking...
          </div>
        )}
      >
        <div class="my-4 flex items-center gap-2">
          <textarea
            ref={inputRef!}
            disabled={loading()}
            onKeyDown={handleKeydown}
            placeholder="Enter something..."
            autocomplete="off"
            onInput={() => {
              inputRef.style.height = "auto";
              inputRef.style.height = inputRef.scrollHeight + "px";
            }}
            rows="1"
            autofocus
            w-full
            px-3
            py-3
            min-h-12
            max-h-36
            text-slate
            rounded-sm
            bg-slate
            bg-op-15
            focus:bg-op-20
            focus:ring-0
            focus:outline-none
            placeholder:text-slate-400
            placeholder:op-30
            overflow-hidden
          />
          <button
            onClick={handleButtonClick}
            disabled={loading()}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            text-slate
            rounded-sm
          >
            Send
          </button>
          <button
            title="Clear"
            onClick={clear}
            disabled={loading()}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            text-slate
            rounded-sm
          >
            <IconClear />
          </button>
        </div>
      </Show>
    </div>
  );
};
