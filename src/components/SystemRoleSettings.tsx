import { createSignal, Show, onMount, createEffect } from "solid-js";
import type { Accessor, Setter } from "solid-js";
import {
  addPromptKey,
  getCurrentLocalId,
  getPromptInfo,
  getPromptKeys,
  setPromptInfo,
  updatePromptInfo,
} from "@/utils/localStorage";

import Edit from "./icons/Edit";

interface Props {
  canEdit: Accessor<boolean>;
  currentId: Accessor<string>;
  systemRoleEditing: Accessor<boolean>;
  setPromptListKeys: Accessor<string[]>;
  setPromptInfo: Accessor<any>;
  setSystemRoleEditing: Setter<boolean>;
  currentSystemRoleSettings: Accessor<string>;
  setCurrentSystemRoleSettings: Setter<string>;
}

export default (props: Props) => {
  let systemInputRef: HTMLTextAreaElement;
  const [editValue, setEditValue] = createSignal("");

  const handleSetClick = () => {
    props.setCurrentSystemRoleSettings(systemInputRef.value);
    props.setSystemRoleEditing(false);
    updatePromptInfo(getCurrentLocalId(), "content", systemInputRef.value);
  };

  const handleCancelClick = () => {
    props.setSystemRoleEditing(false);
  };

  const handleSetKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSetClick();
    }
  };

  const handleEditButtonClick = () => {
    props.setSystemRoleEditing(true);
    setEditValue(props.currentSystemRoleSettings());
  };

  const handleChange = (event) => {
    setEditValue(event.target.value);
  };

  const handleCreatePrompt = () => {
    const allPromptKeys = getPromptKeys();
    const allPromptInfo = getPromptInfo();

    const uuid = new Date().getTime().toString();
    const info = {
      name: "New Chat",
      content: editValue(),
    };

    addPromptKey(uuid);
    setPromptInfo(uuid, info);

    // @ts-ignore
    props.setPromptListKeys([...allPromptKeys, uuid]);
    // @ts-ignore
    props.setPromptInfo({ ...allPromptInfo, [uuid]: info });
  };

  return (
    <div class="my-4">
      <Show when={!props.systemRoleEditing()}>
        <Show when={props.currentSystemRoleSettings()}>
          <div>
            <div class="flex items-center gap-1 op-50 dark:op-60">
              <span>System Role:</span>
            </div>
            <div class="mt-1 flex items-center ">
              <span class="mr-1">{props.currentSystemRoleSettings()}</span>
              <Show when={props.canEdit()}>
                <span onclick={handleEditButtonClick} class="cursor-pointer">
                  <Edit />
                </span>
              </Show>
            </div>
          </div>
        </Show>
        <Show when={!props.currentSystemRoleSettings() && props.canEdit()}>
          <span
            onClick={() =>
              props.setSystemRoleEditing(!props.systemRoleEditing())
            }
            class="inline-flex items-center justify-center gap-1 text-sm bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50"
          >
            <span>Add System Role</span>
          </span>
        </Show>
      </Show>
      <Show when={props.systemRoleEditing() && props.canEdit()}>
        <div>
          <div class="flex items-center gap-1 op-50 dark:op-60">
            <span>System Role:</span>
          </div>
          <p class="my-2 leading-normal text-sm op-50 dark:op-60">
            Gently instruct the assistant and set the behavior of the assistant.
          </p>
          <div>
            <textarea
              value={editValue()}
              ref={systemInputRef!}
              onChange={handleChange}
              onkeydown={handleSetKeydown}
              placeholder="You are a helpful assistant, answer as concisely as possible...."
              autocomplete="off"
              autofocus
              rows="3"
              w-full
              px-3
              py-3
              my-1
              min-h-12
              max-h-36
              rounded-sm
              bg-slate
              bg-op-15
              focus:bg-op-20
              focus:ring-0
              focus:outline-none
              placeholder:op-50
              overflow-hidden
              resize-none
              scroll-pa-8px
            />
          </div>
          <button
            onClick={handleSetClick}
            h-12
            px-4
            py-2
            mr-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            Set
          </button>
          <button
            onClick={handleCancelClick}
            h-12
            px-4
            py-2
            mr-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePrompt}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            Create
          </button>
        </div>
      </Show>
    </div>
  );
};
