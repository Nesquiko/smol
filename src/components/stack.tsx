import GalleryVerticalIcon from "lucide-solid/icons/gallery-vertical";
import { Accessor, Component, For } from "solid-js";

import { TransitionTable } from "~/components/transition-table";
import { Card } from "~/components/ui/card";
import { Dollar, NonTerminal, StackItem, StackType, TokenType } from "~/lib/types";

interface StackProps {
  stack: Accessor<StackType>;
}

export const Stack: Component<StackProps> = (props: StackProps) => {
  const label = (item: StackItem): TokenType | NonTerminal | Dollar => {
    if (typeof item === "object") return item.type;
    return item;
  };

  return (
    <div class="relative h-full">
      {/* SCROLL CONTAINER */}
      <Card class="no-scrollbar flex h-full min-h-0 w-24 flex-col overflow-y-auto bg-primary-700">
        <div class="z-20 mt-auto flex flex-col items-center gap-0">
          <For each={props.stack().toReversed()}>
            {(item, index) => (
              <div class="w-full p-[2px]">
                <div
                  class="overflow-hidden bg-primary-600 text-center text-xs text-ellipsis whitespace-nowrap"
                  classList={{
                    "rounded-b-md": index() === props.stack().length - 1,
                    "rounded-t-md": index() === 0,
                  }}
                >
                  {label(item)}
                </div>
              </div>
            )}
          </For>
        </div>

        <GalleryVerticalIcon class="absolute top-1/2 left-1/2 z-10 size-14 -translate-x-1/2 -translate-y-1/2 text-primary-500/15" />
      </Card>

      <TransitionTable />
    </div>
  );
};
