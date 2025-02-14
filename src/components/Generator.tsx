import { createSignal, Index, Show, onMount } from "solid-js";
import MessageItem from "./MessageItem";
import Nav from "./Nav";
import IconClear from "./icons/Clear";
import type { ChatMessage } from "@/types";
import hotkeys from "hotkeys-js";
import SystemRoleSettings from "./SystemRoleSettings";
import { generateSignature } from "../utils/auth";
import _ from "lodash";
import {
  getPromptInfoByKey,
  getCurrentLocalId,
  getPromptInfo,
  getPromptKeys,
  removeLocalStoragePrompt,
} from "@/utils/localStorage";

export default () => {
  let inputRef: HTMLTextAreaElement;
  const [currentId, setCurrentId] = createSignal(getCurrentLocalId());
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] =
    createSignal("");
  const [promptListKeys, setPromptListKeys] = createSignal(getPromptKeys());
  const [promptInfo, setPromptInfo] = createSignal(getPromptInfo());

  const [messageList, setMessageList] = createSignal<ChatMessage[]>([]);
  const [systemRoleEditing, setSystemRoleEditing] = createSignal(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [controller, setController] = createSignal<AbortController>(null);

  const handleButtonClick = async () => {
    const inputValue = inputRef.value;
    if (!inputValue) {
      return;
    }
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
    requestWithLatestMessage();
  };

  const clear = () => {
    inputRef.value = "";
    setMessageList([]);
    setCurrentAssistantMessage("");
  };

  onMount(() => {
    hotkeys("command+k", (event, handler) => {
      clear();
    });

    setCurrentSystemRoleSettings(
      getPromptInfoByKey(getCurrentLocalId()).content
    );
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

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1];
      console.log(lastMessage);
      if (lastMessage.role === "assistant") {
        setMessageList(messageList().slice(0, -1));
        requestWithLatestMessage();
      }
    }
  };

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort();
      archiveCurrentMessage();
    }
  };

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: "assistant",
          content: currentAssistantMessage(),
        },
      ]);
      setCurrentAssistantMessage("");
      setLoading(false);
      setController(null);
      inputRef.focus();
    }
  };

  const requestWithLatestMessage = async () => {
    setLoading(true);
    setCurrentAssistantMessage("");
    const storagePassword = localStorage.getItem("pass");
    try {
      const controller = new AbortController();
      setController(controller);
      const requestMessageList = [...messageList()];
      if (currentSystemRoleSettings()) {
        requestMessageList.unshift({
          role: "system",
          content: currentSystemRoleSettings(),
        });
      }
      const timestamp = Date.now();
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          messages: requestMessageList,
          time: timestamp,
          pass: storagePassword,
          sign: await generateSignature({
            t: timestamp,
            m:
              requestMessageList?.[requestMessageList.length - 1]?.content ||
              "",
          }),
        }),
        signal: controller.signal,
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
        }
        done = readerDone;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setController(null);
      return;
    }
    archiveCurrentMessage();
  };

  const removePrompt = (value) => {
    const [restKeys] = removeLocalStoragePrompt(value);
    setPromptListKeys(restKeys);
  };

  return (
    <div my-6>
      <Nav
        clear={clear}
        list={promptListKeys}
        info={promptInfo}
        remove={removePrompt}
        currentId={currentId}
        setCurrentId={setCurrentId}
        setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
      />
      <SystemRoleSettings
        currentId={currentId}
        setPromptInfo={setPromptInfo}
        setPromptListKeys={setPromptListKeys}
        canEdit={() => messageList().length === 0}
        systemRoleEditing={systemRoleEditing}
        setSystemRoleEditing={setSystemRoleEditing}
        currentSystemRoleSettings={currentSystemRoleSettings}
        setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
      />
      <Index each={messageList()}>
        {(message, index) => (
          <MessageItem
            role={message().role}
            message={message().content}
            showRetry={() =>
              message().role === "assistant" &&
              index === messageList().length - 1
            }
            onRetry={retryLastFetch}
          />
        )}
      </Index>
      {currentAssistantMessage() && (
        <MessageItem role="assistant" message={currentAssistantMessage} />
      )}
      <Show
        when={!loading()}
        fallback={() => (
          <div class="h-12 my-4 flex gap-4 items-center justify-center bg-slate bg-op-15 rounded-sm">
            <span>AI is thinking...</span>
            <div
              class="px-2 py-0.5 border border-slate rounded-md text-sm op-70 cursor-pointer hover:bg-slate/10"
              onClick={stopStreamFetch}
            >
              Stop
            </div>
          </div>
        )}
      >
        <div
          class="my-4 flex items-center gap-2 transition-opacity"
          class:op-50={systemRoleEditing()}
        >
          <textarea
            ref={inputRef!}
            disabled={systemRoleEditing()}
            onKeyDown={handleKeydown}
            placeholder="Enter something..."
            autocomplete="off"
            autofocus
            onInput={() => {
              inputRef.style.height = "auto";
              inputRef.style.height = inputRef.scrollHeight + "px";
            }}
            rows="1"
            w-full
            px-3
            py-3
            min-h-12
            max-h-36
            rounded-sm
            bg-slate
            bg-op-15
            resize-none
            focus:bg-op-20
            focus:ring-0
            focus:outline-none
            placeholder:op-50
            dark="placeholder:op-30"
            scroll-pa-8px
          />
          <button
            onClick={handleButtonClick}
            disabled={systemRoleEditing()}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            Send
          </button>
          <button
            title="Clear"
            onClick={clear}
            disabled={systemRoleEditing()}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            <IconClear />
          </button>
        </div>
      </Show>
    </div>
  );
};
