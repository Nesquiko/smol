import {Accessor, Component, createEffect, createSignal, For, onCleanup, Show} from "solid-js";
import {Card, CardContent} from "~/components/ui/card";
import {ParseTree} from "~/components/parse-tree";
import {Button} from "~/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon} from "lucide-solid";
import {ControlButton, Direction, ParseTreeNode} from "~/lib/types";
import {TREE_TEST_SMALL} from "~/lib/data/test-data";
import {insertNodeAtRandom, removeNodeById} from "~/lib/ui-utils";

const BLINK_DURATION: number = 100;
const KEYS_PREVIOUS: Array<string> = ["ArrowLeft", "a", "A"];
const KEYS_NEXT: Array<string> = ["ArrowRight", "d", "D"];
const KEYS_FORWARD: Array<string> = ["ArrowUp", "w", "W"];
const KEYS_BACKWARD: Array<string> = ["ArrowDown", "s", "s"];

interface SyntaxScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const SyntaxScreen: Component<SyntaxScreenProps> = (props: SyntaxScreenProps) => {
  const [buffer, setBuffer] = createSignal<Array<string>>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(TREE_TEST_SMALL);
  const [addedNodeIds, setAddedNodeIds] = createSignal<Array<string>>([]);
  const [autoModeDirection, setAutoModeDirection] = createSignal<Direction>("none");
  const [lastPressedButton, setLastPressedButton] = createSignal<ControlButton | undefined>(undefined);

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
    <div class="flex flex-col items-center justify-center gap-6 w-full h-screen relative">
      <div class="flex flex-row items-center justify-center gap-6 w-full max-w-4xl p-6 pb-0 flex-1 min-h-0">
        <Card class="flex flex-1 items-center justify-center w-full h-full p-0">
          <CardContent class="h-full w-full p-0 flex items-center justify-center overflow-hidden">
            <ParseTree tree={tree}/>
          </CardContent>
        </Card>

        <Card class="flex items-start justify-start w-16 h-full">
        </Card>
      </div>

      <div class="flex flex-col items-center justify-center w-full gap-6 px-6">
        <div class="flex flex-row items-center justify-center w-full gap-2 h-10">
          <For each={Array(9)}>
            {(_, index: Accessor<number>) => (
              <div class="flex items-center justify-center text-xl shadow-2xl rounded-md bg-primary-700 h-9 w-7">
                {buffer().at(index()) ?? ""}
              </div>
            )}
          </For>
        </div>

        <div class="grid grid-cols-3 w-full gap-3 pb-6">
          <div class="flex items-center justify-start w-full">
            <Button
              variant="ghost"
              size="default"
              class="cursor-pointer w-fit"
              onClick={props.onBack}
            >
              <ChevronLeftIcon/>
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
              <ChevronLeftIcon class="text-primary-900"/>
            </Button>

            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "bg-primary-300": autoModeDirection() !== "none",
                "opacity-50 scale-95": lastPressedButton() === "play",
              }}
              onClick={() => setAutoModeDirection(
                autoModeDirection() === "none" ? "forward" : "none"
              )}
            >
              <Show when={autoModeDirection() !== "none"} fallback={
                <PlayIcon class="text-primary-900"/>
              }>
                <PauseIcon class="text-primary-900"/>
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
              <ChevronRightIcon class="text-primary-900"/>
            </Button>
          </div>

          <div class="flex items-center justify-end w-full">
            <Button
              variant="ghost"
              size="default"
              class="cursor-pointer w-fit"
              onClick={props.onContinue}
            >
              Results
              <ChevronRightIcon/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};