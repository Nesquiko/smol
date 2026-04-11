import type { LucideIcon } from "lucide-solid";

import ArrowDownIcon from "lucide-solid/icons/arrow-down";
import ArrowRightIcon from "lucide-solid/icons/arrow-right";
import BracesIcon from "lucide-solid/icons/braces";
import CaseLowerIcon from "lucide-solid/icons/case-lower";
import ChartLineIcon from "lucide-solid/icons/chart-line";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import FileInputIcon from "lucide-solid/icons/file-input";
import SettingsIcon from "lucide-solid/icons/settings";
import Settings2Icon from "lucide-solid/icons/settings-2";
import ShrinkIcon from "lucide-solid/icons/shrink";
import { Accessor, Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import { Motion } from "solid-motionone";

import { InputCommand } from "~/components/input-command";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type ProcessItem = {
  icon: LucideIcon;
  label: string;
};

const PROCESS: Array<ProcessItem> = [
  {
    icon: FileInputIcon,
    label: "File Input",
  } satisfies ProcessItem,
  {
    icon: SettingsIcon,
    label: "Lexical Config",
  } satisfies ProcessItem,
  {
    icon: CaseLowerIcon,
    label: "Lexical Analysis",
  } satisfies ProcessItem,
  {
    icon: Settings2Icon,
    label: "Syntax Config",
  } satisfies ProcessItem,
  {
    icon: BracesIcon,
    label: "Syntax Analysis",
  } satisfies ProcessItem,
  {
    icon: ChartLineIcon,
    label: "Results",
  } satisfies ProcessItem,
] satisfies Array<ProcessItem>;

interface InputScreenProps {
  fileContent: Accessor<string | undefined>;
  setFileContent: Setter<string | undefined>;
  onContinue: () => void;
}

export const InputScreen: Component<InputScreenProps> = (props: InputScreenProps) => {
  const [activeStep, setActiveStep] = createSignal<number>(0);

  onMount(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setActiveStep((prev: number): number => (prev + 1) % PROCESS.length);
    }, 1500);

    return () => clearInterval(interval);
  });

  return (
    <div class="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center">
      <div class="flex w-full flex-col items-center justify-center gap-32">
        <div class="flex w-full flex-col items-center justify-center gap-10 pt-24 opacity-50 lg:flex-row lg:gap-5 lg:pt-0">
          <For each={PROCESS}>
            {(item: ProcessItem, index: Accessor<number>) => (
              <>
                <Motion.div
                  class="relative flex size-20 items-center justify-center rounded-full transition-all duration-700"
                  classList={{
                    "scale-110 bg-primary-600": activeStep() === index(),
                    "scale-100 bg-primary-700": activeStep() !== index(),
                  }}
                >
                  <item.icon
                    class="size-10 transition-colors duration-700"
                    classList={{
                      "text-primary-300": activeStep() === index(),
                      "text-primary-500": activeStep() !== index(),
                    }}
                  />
                  <span
                    class="absolute bottom-0 left-1/2 w-26 -translate-x-1/2 translate-y-8 text-center text-sm font-medium text-primary-400 transition-colors duration-700"
                    classList={{
                      "text-primary-200": activeStep() === index(),
                      "text-primary-400": activeStep() !== index(),
                    }}
                  >
                    {item.label}
                  </span>
                </Motion.div>
                <Show when={index() !== PROCESS.length - 1}>
                  <ArrowRightIcon class="hidden text-primary-700 lg:block" />
                  <ArrowDownIcon class="block text-primary-700 lg:hidden" />
                </Show>
              </>
            )}
          </For>
        </div>

        <div class="w-full max-w-md pb-24 lg:pb-0">
          <InputCommand
            fileContent={props.fileContent}
            setFileContent={props.setFileContent}
            onContinue={props.onContinue}
          />
        </div>
      </div>

      <div class="absolute top-6 left-6 flex flex-row items-center justify-center gap-2">
        <ShrinkIcon class="size-5" />
        <span class="font-bold tracking-widest text-primary-300">smol</span>
      </div>

      <div class="absolute right-0 bottom-0 p-6">
        <Show
          when={props.fileContent() !== undefined}
          fallback={
            <Tooltip placement="top" openDelay={0} closeDelay={0}>
              <TooltipTrigger
                as={Button}
                variant="ghost"
                size="default"
                class="w-fit cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
              >
                Lexical configuration
                <ChevronRightIcon />
              </TooltipTrigger>

              <TooltipContent>Choose an input file before continuing</TooltipContent>
            </Tooltip>
          }
        >
          <Button
            variant="ghost"
            size="default"
            class="w-fit cursor-pointer"
            onClick={props.onContinue}
          >
            Lexical configuration
            <ChevronRightIcon />
          </Button>
        </Show>
      </div>
    </div>
  );
};
