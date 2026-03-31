import ArrowDownIcon from "lucide-solid/icons/arrow-down";
import ArrowLeftIcon from "lucide-solid/icons/arrow-left";
import ArrowRightIcon from "lucide-solid/icons/arrow-right";
import ArrowUpIcon from "lucide-solid/icons/arrow-up";
import InfoIcon from "lucide-solid/icons/info";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export const ControlsInfo = () => {
  return (
    <Tooltip placement="top" openDelay={0} closeDelay={0}>
      <TooltipTrigger as="div" class="absolute top-1/2 right-0 translate-x-9 -translate-y-1/2">
        <InfoIcon class="size-5 cursor-help text-primary-500 transition-colors duration-300 hover:text-primary-400" />
      </TooltipTrigger>
      <TooltipContent class="grid grid-cols-2 items-start justify-center gap-0.5 p-2">
        <span class="w-fit rounded-md bg-primary-700 pr-2 pl-1 text-primary-300">
          <ArrowUpIcon class="mr-1 mb-[1px] inline-block size-4" />
          <span class="text-xs">Arrow Up</span>
        </span>
        <span class="px-1.5 py-0.5 text-right">Auto Forward/Stop</span>

        <span class="w-fit rounded-md bg-primary-700 pr-2 pl-1 text-primary-300">
          <ArrowDownIcon class="mr-1 mb-[1px] inline-block size-4" />
          <span class="text-xs">Arrow Down</span>
        </span>
        <span class="px-1.5 py-0.5 text-right">Auto Backward/Stop</span>

        <span class="w-fit rounded-md bg-primary-700 pr-2 pl-1 text-primary-300">
          <ArrowRightIcon class="mr-1 mb-[1px] inline-block size-4" />
          <span class="text-xs">Arrow Right</span>
        </span>
        <span class="px-1.5 py-0.5 text-right">Step Forward</span>

        <span class="w-fit rounded-md bg-primary-700 pr-2 pl-1 text-primary-300">
          <ArrowLeftIcon class="mr-1 mb-[1px] inline-block size-4" />
          <span class="text-xs">Arrow Left</span>
        </span>
        <span class="px-1.5 py-0.5 text-right">Step Backward</span>
      </TooltipContent>
    </Tooltip>
  );
};
