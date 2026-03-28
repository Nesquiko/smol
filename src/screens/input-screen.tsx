import { Component } from "solid-js";

import { InputCommand } from "~/components/input-command";

interface InputScreenProps {
  onInput: (text: string) => void;
}

export const InputScreen: Component<InputScreenProps> = (props: InputScreenProps) => {
  return (
    <div class="flex w-full max-w-md items-center justify-center">
      <InputCommand onInput={props.onInput} />
    </div>
  );
};
