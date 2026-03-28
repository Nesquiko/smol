import {Accessor, Component, Match, Show, Switch} from "solid-js";
import {ChevronLeftIcon} from "lucide-solid";
import {Button} from "~/components/ui/button";
import {Result} from "~/lib/types";

interface ResultsScreenProps {
  result: Accessor<Result>;
  onBack: () => void;
}

export const ResultsScreen: Component<ResultsScreenProps> = (props: ResultsScreenProps) => {
  return (
    <div class="flex flex-1 min-h-screen w-full items-center justify-center relative">
      <Switch>
        <Match when={props.result() === "could-not-determine"}>
          <span class="text-primary-300">Could not determine the correctness of the input.</span>
        </Match>
      </Switch>

      <Match when={props.result() === "correct"}>
        <div class="flex flex-col items-center justify-center gap-2">
          <span class="text-9xl font-bold text-primary-700 select-none">CORRECT</span>
          <span class="text-primary-300">
          The input file that you chose has been marked as correct.
        </span>
        </div>
      </Match>

      <Match when={props.result() === "incorrect"}>
        <div class="flex flex-col items-center justify-center gap-2">
          <span class="text-9xl font-bold text-primary-700 select-none">INCORRECT</span>
          <span class="text-primary-300">
          The input file that you chose has been marked as incorrect.
        </span>
        </div>
      </Match>

      <Button
        variant="ghost"
        size="default"
        class="cursor-pointer w-fit absolute left-6 bottom-6"
        onClick={props.onBack}
      >
        <ChevronLeftIcon/>
        Syntax analysis
      </Button>
    </div>
  );
};