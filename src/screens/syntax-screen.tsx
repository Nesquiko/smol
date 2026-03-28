import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import { Accessor, Component, createEffect, createSignal, For, onCleanup, Show } from "solid-js";

import { ParseTree } from "~/components/parse-tree";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  BLINK_DURATION,
  KEYS_BACKWARD,
  KEYS_FORWARD,
  KEYS_NEXT,
  KEYS_PREVIOUS,
} from "~/lib/data/constants";
import { TREE_TEST_SMALL } from "~/lib/data/test-data";
import { ControlButton, Direction, ParseTreeNode } from "~/lib/types";
import { insertNodeAtRandom, removeNodeById } from "~/lib/ui-utils";

interface SyntaxScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const SyntaxScreen: Component<SyntaxScreenProps> = (props: SyntaxScreenProps) => {
  const [buffer, setBuffer] = createSignal<Array<string>>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(TREE_TEST_SMALL);
  const [addedNodeIds, setAddedNodeIds] = createSignal<Array<string>>([]);
  const [autoModeDirection, setAutoModeDirection] = createSignal<Direction>("none");
  const [lastPressedButton, setLastPressedButton] = createSignal<ControlButton | undefined>(
    undefined,
  );

  createEffect(() => {
    const direction = autoModeDirection();
    if (direction === "none") return;

    const interval = setInterval(() => {
      if (direction === "forward") nextStep();
      else previousStep();
    }, 500);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  const blink = (button: ControlButton) => {
    setLastPressedButton(button);
    setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
  };

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_PREVIOUS.includes(e.key)) {
        blink("previous");
        previousStep();
      } else if (KEYS_NEXT.includes(e.key)) {
        blink("next");
        nextStep();
      } else if (KEYS_FORWARD.includes(e.key)) {
        blink("play");
        setAutoModeDirection(autoModeDirection() === "none" ? "forward" : "none");
      } else if (KEYS_BACKWARD.includes(e.key)) {
        blink("play");
        setAutoModeDirection(autoModeDirection() === "none" ? "backward" : "none");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const nextStep = () => {
    blink("next");

    setBuffer((prev: Array<string>): Array<string> => {
      setTree((currentTree: ParseTreeNode): ParseTreeNode => {
        const result = insertNodeAtRandom(currentTree);
        setAddedNodeIds((ids) => [...ids, result.nodeId]);
        return result.tree;
      });
      return [...prev, "a"];
    });
  };

  const previousStep = () => {
    blink("previous");

    setBuffer((prev) => {
      const ids = addedNodeIds();
      if (ids.length > 0) {
        const lastId = ids[ids.length - 1];
        setTree((currentTree) => removeNodeById(currentTree, lastId));
        setAddedNodeIds((prevIds) => prevIds.slice(0, -1));
      }
      return prev.slice(0, -1);
    });
  };

  return (
    <div class="relative flex h-screen w-full flex-col items-center justify-center gap-6">
      <div class="flex min-h-0 w-full max-w-4xl flex-1 flex-row items-center justify-center gap-6 p-6 pb-0">
        <Card class="flex h-full w-full flex-1 items-center justify-center p-0">
          <CardContent class="flex h-full w-full items-center justify-center overflow-hidden p-0">
            <ParseTree tree={tree} />
          </CardContent>
        </Card>

        <Card class="flex h-full w-16 items-start justify-start">stack</Card>
      </div>

      <div class="flex w-full flex-col items-center justify-center gap-6 px-6">
        <div class="flex h-10 w-full flex-row items-center justify-center gap-2">
          <For each={Array(9)}>
            {(_, index: Accessor<number>) => (
              <div class="flex h-9 w-7 items-center justify-center rounded-md bg-primary-700 text-xl shadow-2xl">
                {buffer().at(index()) ?? ""}
              </div>
            )}
          </For>
        </div>

        <div class="grid w-full grid-cols-3 gap-3 pb-6">
          <div class="flex w-full items-center justify-start">
            <Button
              variant="ghost"
              size="default"
              class="w-fit cursor-pointer"
              onClick={props.onBack}
            >
              <ChevronLeftIcon />
              Lexical analysis
            </Button>
          </div>

          <div class="flex flex-row items-center justify-center gap-3">
            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "opacity-50 scale-95": lastPressedButton() === "previous",
              }}
              onClick={previousStep}
            >
              <ChevronLeftIcon class="text-primary-900" />
            </Button>

            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "bg-primary-300": autoModeDirection() !== "none",
                "opacity-50 scale-95": lastPressedButton() === "play",
              }}
              onClick={() =>
                setAutoModeDirection(autoModeDirection() === "none" ? "forward" : "none")
              }
            >
              <Show
                when={autoModeDirection() !== "none"}
                fallback={<PlayIcon class="text-primary-900" />}
              >
                <PauseIcon class="text-primary-900" />
              </Show>
            </Button>

            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "opacity-50 scale-95": lastPressedButton() === "next",
              }}
              onClick={nextStep}
            >
              <ChevronRightIcon class="text-primary-900" />
            </Button>
          </div>

          <div class="flex w-full items-center justify-end">
            <Button
              variant="ghost"
              size="default"
              class="w-fit cursor-pointer"
              onClick={props.onContinue}
            >
              Results
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
