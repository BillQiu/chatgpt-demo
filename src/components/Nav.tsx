import { Index } from "solid-js";

import Tag from "./Tag";

function Nav(props) {
  const {
    list,
    remove,
    info,
    currentId,
    setCurrentId,
    setCurrentSystemRoleSettings,
    clear,
  } = props;

  return (
    <div class="m-1">
      <Index each={list()}>
        {(prompt) => {
          const name = () => info()[prompt()]?.name || "New Chat";
          return (
            <Tag
              clear={clear}
              currentId={currentId}
              setCurrentId={setCurrentId}
              setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
              name={name}
              info={info}
              value={prompt}
              list={list}
              remove={remove}
            />
          );
        }}
      </Index>
    </div>
  );
}

export default Nav;
