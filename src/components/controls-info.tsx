import type { LucideIcon } from "lucide-solid";

import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import ChevronsLeftIcon from "lucide-solid/icons/chevrons-left";
import ChevronsRightIcon from "lucide-solid/icons/chevrons-right";
import InfoIcon from "lucide-solid/icons/info";
import PlayIcon from "lucide-solid/icons/play";
import { For } from "solid-js";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type InfoItem = {
  icon: LucideIcon;
  text: string;
  keys: Array<string>;
  reverse?: boolean;
};

const INFO: Array<InfoItem> = [
  {
    icon: PlayIcon,
    text: "Auto Forward/Stop",
    keys: ["Space", "Arrow Up"],
  },
  {
    icon: PlayIcon,
    text: "Auto Backward/Stop",
    keys: ["Arrow Down"],
    reverse: true,
  },
  {
    icon: ChevronRightIcon,
    text: "Step Forward",
    keys: ["Arrow Right"],
  },
  {
    icon: ChevronLeftIcon,
    text: "Step Backward",
    keys: ["Arrow Left"],
  },
  {
    icon: ChevronsRightIcon,
    text: "First Step",
    keys: ["F"],
  },
  {
    icon: ChevronsLeftIcon,
    text: "Last Step",
    keys: ["L"],
  },
] as const satisfies Array<InfoItem>;

export const ControlsInfo = () => {
  return (
    <Tooltip placement="top" openDelay={0} closeDelay={0}>
      <TooltipTrigger as="div" class="absolute top-1/2 right-0 translate-x-9 -translate-y-1/2">
        <InfoIcon class="size-5 cursor-help text-primary-500 transition-colors duration-300 hover:text-primary-400" />
      </TooltipTrigger>
      <TooltipContent class="grid grid-cols-2 items-start justify-center gap-0.5 p-2">
        <For each={INFO}>
          {(infoItem) => (
            <>
              <span class="px-1.5 py-0.5">
                <infoItem.icon
                  class="mr-1 mb-[1px] inline-block size-4"
                  classList={{
                    "rotate-180": infoItem.reverse,
                  }}
                />
                {infoItem.text}
              </span>
              <div class="flex w-full items-center justify-end gap-1">
                <For each={infoItem.keys}>
                  {(key: string) => (
                    <span class="w-fit rounded-md bg-primary-700 px-2 py-0.5 text-xs text-primary-300">
                      {key}
                    </span>
                  )}
                </For>
              </div>
            </>
          )}
        </For>
      </TooltipContent>
    </Tooltip>
  );
};
