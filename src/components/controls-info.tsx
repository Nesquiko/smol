import ArrowDownIcon from "lucide-solid/icons/arrow-down";
import ArrowLeftIcon from "lucide-solid/icons/arrow-left";
import ArrowRightIcon from "lucide-solid/icons/arrow-right";
import ArrowUpIcon from "lucide-solid/icons/arrow-up";
import InfoIcon from "lucide-solid/icons/info";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import ChevronFirstIcon from "lucide-solid/icons/chevron-first";
import ChevronLastIcon from "lucide-solid/icons/chevron-last";
import {For} from "solid-js";

const INFO = [
  {
    icon: ArrowUpIcon,
    text: "Auto Forward/Stop",
    key: "Arrow Up",
  },
  {
    icon: ArrowDownIcon,
    text: "Auto Backward/Stop",
    key: "Arrow Down",
  },
  {
    icon: ArrowRightIcon,
    text: "Step Forward",
    key: "Arrow Right",
  },
  {
    icon: ArrowLeftIcon,
    text: "Step Backward",
    key: "Arrow Left",
  },
  {
    icon: ChevronFirstIcon,
    text: "First Step",
    key: "F",
  },
  {
    icon: ChevronLastIcon,
    text: "Last Step",
    key: "L",
  },
];

export const ControlsInfo = () => {
  return (
    <Tooltip placement="top" openDelay={0} closeDelay={0}>
      <TooltipTrigger as="div" class="absolute top-1/2 right-0 translate-x-9 -translate-y-1/2">
        <InfoIcon class="size-5 cursor-help text-primary-500 transition-colors duration-300 hover:text-primary-400"/>
      </TooltipTrigger>
      <TooltipContent class="grid grid-cols-2 items-start justify-center gap-0.5 p-2">
        <For each={INFO}>
          {(infoItem) => (
            <>
              <span class="px-1.5 py-0.5">
                <infoItem.icon class="mr-1 mb-[1px] inline-block size-4"/>
                  {infoItem.text}
                </span>
                <div class="flex items-center justify-end w-full">
                  <span class="w-fit rounded-md bg-primary-700 px-2 py-0.5 text-primary-300 text-xs">
                    {infoItem.key}
                  </span>
                </div>
            </>
          )}
        </For>
      </TooltipContent>
    </Tooltip>
  );
};
