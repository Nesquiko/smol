import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import { Accessor, Component, Match, Switch } from "solid-js";

import { Button } from "~/components/ui/button";
import { Result } from "~/lib/types";

interface ResultsScreenProps {
  result: Accessor<Result>;
  onBack: () => void;
}

export const ResultsScreen: Component<ResultsScreenProps> = (props: ResultsScreenProps) => {
  return (
    <div class="relative flex min-h-screen w-full flex-1 items-center justify-center">
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
        class="absolute bottom-6 left-6 w-fit cursor-pointer"
        onClick={props.onBack}
      >
        <ChevronLeftIcon />
        Syntax analysis
      </Button>
    </div>
  );
};
