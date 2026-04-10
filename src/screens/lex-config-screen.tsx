import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import CircleXIcon from "lucide-solid/icons/circle-x";
import ShieldIcon from "lucide-solid/icons/shield";
import ShieldOffIcon from "lucide-solid/icons/shield-off";
import { Accessor, Component, For, Setter, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { LexErrorMode, ErrorModeData } from "~/lib/types";

const LEX_ERROR_MODES: Array<ErrorModeData> = [
  {
    mode: "no-errors",
    title: "No auto-fix",
    description: "This mode will not fix any errors for you automatically.",
    icon: ShieldOffIcon,
  } satisfies ErrorModeData,
  {
    mode: "ignore-until-found",
    title: "Auto-fix error 1",
    description: "This mode will fix error no. 1 for you automatically.",
    icon: ShieldIcon,
  } satisfies ErrorModeData,
  {
    mode: "add-missing",
    title: "Auto-fix error 2",
    description: "This mode will fix error no. 2 for you automatically.",
    icon: ShieldIcon,
  } satisfies ErrorModeData,
] satisfies Array<ErrorModeData>;

interface LexConfigScreenProps {
  lexErrorMode: Accessor<LexErrorMode | undefined>;
  setLexErrorMode: Setter<LexErrorMode | undefined>;
  onBack: () => void;
  onContinue: () => void;
}

export const LexConfigScreen: Component<LexConfigScreenProps> = (props: LexConfigScreenProps) => {
  return (
    <div class="relative flex min-h-screen w-full flex-1 items-center justify-center">
      <div class="flex w-full max-w-2xl flex-col items-center justify-center gap-12">
        <div class="flex w-full flex-col items-center justify-center gap-3">
          <h1 class="text-4xl font-bold">Lexical configuration</h1>
          <p class="text-sm text-muted-foreground/60">
            Before continuing, choose how should the lexical analyser treat different types of
            errors.
          </p>
        </div>

        <div class="grid h-full w-full grid-cols-1 items-center justify-center gap-6 md:grid-cols-3">
          <For each={LEX_ERROR_MODES}>
            {(modeData: ErrorModeData) => (
              <Card
                class="group relative mx-auto h-full w-full max-w-64 cursor-pointer overflow-hidden border-0 bg-primary-900 shadow-md ring-2 transition-all duration-300 hover:-translate-y-1"
                classList={{
                  "ring-primary-300 -translate-y-1": props.lexErrorMode() === modeData.mode,
                  "ring-transparent hover:ring-primary-300/30":
                    props.lexErrorMode() !== modeData.mode,
                }}
                onClick={() =>
                  props.setLexErrorMode(
                    props.lexErrorMode() === modeData.mode
                      ? undefined
                      : (modeData.mode as LexErrorMode),
                  )
                }
              >
                <CardHeader>
                  <CardTitle class="flex flex-row items-center justify-start gap-2 tracking-normal select-none">
                    <modeData.icon class="mb-0.5 inline-block size-5" />
                    {modeData.title}
                  </CardTitle>
                  <CardDescription class="mt-4 select-none">{modeData.description}</CardDescription>
                </CardHeader>

                <Dynamic
                  component={props.lexErrorMode() === modeData.mode ? CircleCheckIcon : CircleXIcon}
                  class="absolute right-4 bottom-4 size-6"
                  classList={{
                    "text-primary-300": props.lexErrorMode() === modeData.mode,
                    "text-primary-700": props.lexErrorMode() !== modeData.mode,
                  }}
                />

                <div class="absolute top-0 bottom-0 left-0 w-2 rounded-l-2xl bg-primary-300 bg-primary-700" />
              </Card>
            )}
          </For>
        </div>
      </div>

      <div class="absolute right-0 bottom-0 left-0 flex flex-row items-center justify-between gap-3 p-6">
        <Button variant="ghost" size="default" class="w-fit cursor-pointer" onClick={props.onBack}>
          <ChevronLeftIcon />
          File input
        </Button>

        <Show
          when={props.lexErrorMode() !== undefined}
          fallback={
            <Tooltip placement="top" openDelay={0} closeDelay={0}>
              <TooltipTrigger
                as={Button}
                variant="ghost"
                size="default"
                class="w-fit cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
              >
                Lexical analysis
                <ChevronRightIcon />
              </TooltipTrigger>

              <TooltipContent>Select a mode before continuing</TooltipContent>
            </Tooltip>
          }
        >
          <Button
            variant="ghost"
            size="default"
            class="w-fit cursor-pointer"
            onClick={props.onContinue}
          >
            Lexical analysis
            <ChevronRightIcon />
          </Button>
        </Show>
      </div>
    </div>
  );
};
