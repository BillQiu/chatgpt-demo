import { createSignal, Show } from "solid-js";
import type { Accessor, Setter } from "solid-js";
import Edit from "./icons/Edit";

interface Props {
  canEdit: Accessor<boolean>;
  systemRoleEditing: Accessor<boolean>;
  setSystemRoleEditing: Setter<boolean>;
  currentSystemRoleSettings: Accessor<string>;
  setCurrentSystemRoleSettings: Setter<string>;
}

export default (props: Props) => {
  let systemInputRef: HTMLTextAreaElement;
  const [editValue, setEditValue] = createSignal("");

  const handleButtonClick = () => {
    props.setCurrentSystemRoleSettings(systemInputRef.value);
    props.setSystemRoleEditing(false);
  };

  const handleSetKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleButtonClick();
    }
  };

  const handleEditButtonClick = () => {
    props.setSystemRoleEditing(true);
  };

  const handleChange = (event) => {
    setEditValue(event.target.value);
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
            onClick={handleButtonClick}
            h-12
            px-4
            py-2
            bg-slate
            bg-op-15
            hover:bg-op-20
            rounded-sm
          >
            Set
          </button>
        </div>
      </Show>
    </div>
  );
};
