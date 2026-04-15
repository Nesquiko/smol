import GalleryVerticalIcon from "lucide-solid/icons/gallery-vertical";
import { Accessor, Component, For, Setter } from "solid-js";
import { Motion } from "solid-motionone";

import { TransitionTable } from "~/components/transition-table";
import { Card } from "~/components/ui/card";
import { DOLLAR } from "~/lib/data/constants";
import { Dollar, NonTerminal, ParseTable, StackItem, StackType, TokenType } from "~/lib/types";

interface StackProps {
  stack: Accessor<StackType>;
  parseTable: Accessor<ParseTable>;
  setParseTable: Setter<ParseTable>;
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
        <div class="z-20 mt-auto flex flex-col-reverse items-center gap-0">
          <For each={props.stack()}>
            {(item) => {
              const isDollar = (): boolean => label(item) === DOLLAR;

              return (
                <Motion.div
                  class="w-full p-[2px]"
                  initial={{ opacity: 0, y: -500 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, easing: [0.33, 1, 0.68, 1] }}
                >
                  <div
                    class="overflow-hidden rounded-md text-center text-xs text-ellipsis whitespace-nowrap"
                    classList={{
                      "bg-primary-400 text-primary-900": isDollar(),
                      "bg-primary-600": !isDollar(),
                    }}
                  >
                    {label(item)}
                  </div>
                </Motion.div>
              );
            }}
          </For>
        </div>

        <GalleryVerticalIcon class="absolute top-1/2 left-1/2 z-10 size-14 -translate-x-1/2 -translate-y-1/2 text-primary-500/15" />
      </Card>

      <TransitionTable parseTable={props.parseTable} setParseTable={props.setParseTable} />
    </div>
  );
};
