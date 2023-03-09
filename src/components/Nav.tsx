import { Accessor, createSignal, Index } from "solid-js";

import Tag from "./Tag";

function Nav({ list, remove }) {
  console.log("remove", remove);

  return (
    <div class="m-1">
      <Index each={list()}>
        {(prompt) => <Tag value={prompt()} list={list} remove={remove} />}
      </Index>
    </div>
  );
}

export default Nav;
