import GalleryVerticalIcon from "lucide-solid/icons/gallery-vertical";
import { Accessor, Component, For } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { TransitionTable } from "~/components/transition-table";
import { Card } from "~/components/ui/card";
import { Dollar, NonTerminal, StackItem, StackType, TokenType } from "~/lib/types";

interface StackProps {
  stack: Accessor<StackType>;
  cardRef?: (el: HTMLDivElement) => void;
}

export const Stack: Component<StackProps> = (props) => {
  const label = (item: StackItem): TokenType | NonTerminal | Dollar => {
    if (typeof item === "object") return item.type;
    return item;
  };

  return (
    <div class="relative h-full">
      <Card
        ref={props.cardRef}
        class="no-scrollbar flex h-full min-h-0 w-24 flex-col overflow-y-auto bg-primary-700"
      >
        <div class="z-20 mt-auto flex flex-col items-center gap-0">
          <For each={props.stack().toReversed()}>
            {(item, index) => (
              <Presence exitBeforeEnter={false}>
                <Motion.div
                  class="w-full p-[2px]"
                  initial={{
                    opacity: 0,
                    y: index() === 0 ? -500 : 0,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -60,
                    transition: { duration: 0.2, easing: [0.32, 0, 0.67, 0] },
                  }}
                  transition={{
                    duration: 0.6,
                    easing: [0.33, 1, 0.68, 1], // cubic-bezier ease-out-cubic
                  }}
                >
                  <div
                    class="overflow-hidden bg-primary-600 text-center text-xs text-ellipsis whitespace-nowrap"
                    classList={{
                      "rounded-b-md": index() === props.stack().length - 1,
                      "rounded-t-md": index() === 0,
                    }}
                  >
                    {label(item)}
                  </div>
                </Motion.div>
              </Presence>
            )}
          </For>
        </div>

        <GalleryVerticalIcon class="absolute top-1/2 left-1/2 z-10 size-14 -translate-x-1/2 -translate-y-1/2 text-primary-500/15" />
      </Card>

      <TransitionTable />
    </div>
  );
};