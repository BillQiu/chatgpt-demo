import { Accessor, createSignal } from "solid-js";
import _ from "lodash";
import Close from "../components/icons/Close";

export default (props) => {
  const handleClose = () => {
    props.remove(props.value);
  };

  return (
    <div class="inline-block mr-2 b-rd cursor-pointer px-2 py-1 text-sm text-light b-1 b-coolGray">
      <div class="flex items-center">
        <span>{props.value}</span>
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
