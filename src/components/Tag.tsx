import { createSignal, createEffect, createMemo } from "solid-js";
import _ from "lodash";
import Close from "../components/icons/Close";
import {
  getPromptInfo,
  getPromptInfoByKey,
  getCurrentLocalId,
  updatePromptInfo,
  setCurrentLocalId,
} from "@/utils/localStorage";

export default (props) => {
  let spanRef: HTMLSpanElement;
  const handleClose = () => {
    props.remove(props.value());
  };

  const handleChangeTagName = (e) => {
    spanRef.contentEditable = "false";
    updatePromptInfo(props.value(), "name", spanRef.textContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      spanRef.contentEditable = "false";
    }
  };

  const handleClick = () => {
    const id = props.value();
    props.clear();
    props.setCurrentId(id);
    props.setCurrentSystemRoleSettings(getPromptInfoByKey(id).content);
    setCurrentLocalId(id);
  };

  const isActivated = () => {
    return props.currentId() === props.value();
  };

  return (
    <div
      class={`inline-block mr-2 b-rd cursor-pointer px-2 py-1 text-sm text-light b-1 ${
        isActivated() ? "b-cyan" : "b-coolGray"
      }`}
    >
      <div class="flex items-center">
        <span
          textContent={props.name()}
          ref={spanRef}
          onClick={handleClick}
          onDblClick={(e) => {
            spanRef.contentEditable = "true";
          }}
          onBlur={handleChangeTagName}
          onKeyDown={handleKeyDown}
        />
        <span
          class="inline-block text-xl cursor-pointer md:hover:bg-slate border-rounded "
          onClick={handleClose}
        >
          <Close />
        </span>
      </div>
    </div>
  );
};
