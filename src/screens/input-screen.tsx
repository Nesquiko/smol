import {Component} from "solid-js";
import {InputCommand} from "~/components/input-command";

interface InputScreenProps {
  onInput: (text: string) => void;
}

export const InputScreen: Component<InputScreenProps> = (props: InputScreenProps) => {
  return (
    <div class="flex items-center justify-center max-w-md w-full">
      <InputCommand
        onInput={props.onInput}
      />
    </div>
  );
};