import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import { Accessor, Component, createSignal, For, Setter, Show } from "solid-js";

import { ControlsInfo } from "~/components/controls-info";
import { Button } from "~/components/ui/button";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { BufferType, ParseTreeNode, StackType, Token } from "~/lib/types";
import { cn, insertNodeAtRandom, randomStackItem, removeNodeById } from "~/lib/ui-utils";

interface SyntaxControlsProps {
  buffer: Accessor<BufferType>;
  setBuffer: Setter<BufferType>;
  setTree: Setter<ParseTreeNode>;
  setStack: Setter<StackType>;
  withNavigation: boolean;
  onBack: () => void;
  onContinue: () => void;
  class?: string;
}

export const SyntaxControls: Component<SyntaxControlsProps> = (props: SyntaxControlsProps) => {
  const [addedNodeIds, setAddedNodeIds] = createSignal<Array<string>>([]);

  const nextStep = () => {
    blink("next");

    // eslint-disable-next-line solid/reactivity
    props.setBuffer((prev: BufferType): BufferType => {
      props.setTree((currentTree: ParseTreeNode): ParseTreeNode => {
        const result = insertNodeAtRandom(currentTree);
        setAddedNodeIds((ids) => [...ids, result.nodeId]);
        return result.tree;
      });
      props.setStack((currentStack) => [...currentStack, randomStackItem()]);
      return [
        ...prev,
        {
          type: "IDENT",
          line: 0,
          colStart: 0,
          colEnd: 0,
        } satisfies Token,
      ];
    });
  };

  const previousStep = () => {
    blink("previous");

    // eslint-disable-next-line solid/reactivity
    props.setBuffer((prev) => {
      const ids: Array<string> = addedNodeIds();
      if (ids.length > 0) {
        const lastId: string = ids[ids.length - 1];
        props.setTree((currentTree) => removeNodeById(currentTree, lastId));
        props.setStack((previousStack) => previousStack.slice(0, -1));
        setAddedNodeIds((prevIds) => prevIds.slice(0, -1));
      }
      return prev.slice(0, -1);
    });
  };

  const { autoModeDirection, setAutoModeDirection, lastPressedButton, blink } = useAutoStep(
    nextStep,
    previousStep,
  );

  return (
    <div class={cn("flex w-full flex-col items-center justify-center gap-6 px-6", props.class)}>
      <div class="flex h-10 w-full flex-row items-center justify-center gap-2">
        <For each={Array(9)}>
          {(_, index: Accessor<number>) => (
            <div class="flex h-9 w-7 items-center justify-center rounded-md bg-primary-700 text-xl shadow-2xl">
              {props.buffer().at(index())?.type.at(0) ?? ""}
            </div>
          )}
        </For>
      </div>

      <div class="grid w-full grid-cols-3 gap-3 pb-6">
        <div class="flex w-full items-center justify-start">
          <Show when={props.withNavigation}>
            <Button
              variant="ghost"
              size="default"
              class="w-fit cursor-pointer"
              onClick={props.onBack}
            >
              <ChevronLeftIcon />
              Lexical analysis
            </Button>
          </Show>
        </div>

        <div class="relative flex flex-row items-center justify-center gap-3">
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

          <div class="relative">
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

            <ControlsInfo />
          </div>
        </div>

        <div class="flex w-full items-center justify-end">
          <Show when={props.withNavigation}>
            <Button
              variant="ghost"
              size="default"
              class="w-fit cursor-pointer"
              onClick={props.onContinue}
            >
              Results
              <ChevronRightIcon />
            </Button>
          </Show>
        </div>
      </div>
    </div>
  );
};
