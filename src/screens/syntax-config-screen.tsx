import {Card, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {Accessor, Component, For, Setter, Show} from "solid-js";
import {ErrorModeData, SyntaxErrorMode} from "~/lib/types";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import CircleXIcon from "lucide-solid/icons/circle-x";
import ShieldOffIcon from "lucide-solid/icons/shield-off";
import ShieldIcon from "lucide-solid/icons/shield";
import {Dynamic} from "solid-js/web";
import {Button} from "~/components/ui/button";
import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";

const SYNTAX_ERROR_MODES: Array<ErrorModeData> = [
  {
    mode: "syntax-no-errors",
    title: "No auto-fix",
    description: "This mode will not fix any errors for you automatically.",
    icon: ShieldOffIcon,
  } satisfies ErrorModeData,
  {
    mode: "syntax-error-1",
    title: "Auto-fix error 1",
    description: "This mode will fix error no. 1 for you automatically.",
    icon: ShieldIcon,
  } satisfies ErrorModeData,
  {
    mode: "syntax-error-2",
    title: "Auto-fix error 2",
    description: "This mode will fix error no. 2 for you automatically.",
    icon: ShieldIcon,
  } satisfies ErrorModeData,
] satisfies Array<ErrorModeData>;

interface SyntaxConfigScreenProps {
  syntaxErrorMode: Accessor<SyntaxErrorMode | undefined>;
  setSyntaxErrorMode: Setter<SyntaxErrorMode | undefined>;
  onBack: () => void;
  onContinue: () => void;
}

export const SyntaxConfigScreen: Component<SyntaxConfigScreenProps> = (props: SyntaxConfigScreenProps) => {
  return (
    <div class="flex flex-1 w-full items-center justify-center min-h-screen relative">
      <div class="flex flex-col w-full max-w-2xl items-center justify-center gap-12">
        <div class="w-full flex flex-col items-center justify-center gap-3">
          <h1 class="text-4xl font-bold">
            Syntax configuration
          </h1>
          <p class="text-sm text-muted-foreground/60">
            Before continuing, choose how should the syntax analyser treat different types of errors.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-6 w-full h-full">
          <For each={SYNTAX_ERROR_MODES}>
            {(modeData: ErrorModeData) => (
              <Card
                class="relative overflow-hidden w-full h-full border-0 max-w-64 mx-auto cursor-pointer ring-2 transition-all duration-300 bg-primary-900 group hover:-translate-y-1 shadow-md"
                classList={{
                  "ring-primary-300 -translate-y-1": props.syntaxErrorMode() === modeData.mode,
                  "ring-transparent hover:ring-primary-300/30": props.syntaxErrorMode() !== modeData.mode,
                }}
                onClick={() => props.setSyntaxErrorMode(props.syntaxErrorMode() === modeData.mode ? undefined : modeData.mode as SyntaxErrorMode)}
              >
                <CardHeader>
                  <CardTitle class="tracking-normal select-none flex flex-row items-center justify-start gap-2">
                    <modeData.icon class="size-5 inline-block mb-0.5"/>
                    {modeData.title}
                  </CardTitle>
                  <CardDescription class="mt-4 select-none">
                    {modeData.description}
                  </CardDescription>
                </CardHeader>

                <Dynamic
                  component={props.syntaxErrorMode() === modeData.mode ? CircleCheckIcon : CircleXIcon}
                  class="absolute bottom-4 right-4 size-6"
                  classList={{
                    "text-primary-300": props.syntaxErrorMode() === modeData.mode,
                    "text-primary-700": props.syntaxErrorMode() !== modeData.mode,
                  }}
                />

                <div
                  class="absolute left-0 bottom-0 top-0 w-2 bg-primary-300 rounded-l-2xl bg-primary-700"
                />
              </Card>
            )}
          </For>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 flex flex-row items-center justify-between gap-3 p-6">
        <Button
          variant="ghost"
          size="default"
          class="w-fit cursor-pointer"
          onClick={props.onBack}
        >
          <ChevronLeftIcon/>
          Lexical analysis
        </Button>

        <Show
          when={props.syntaxErrorMode() !== undefined}
          fallback={
            <Tooltip placement="top" openDelay={0} closeDelay={0}>
              <TooltipTrigger
                as={Button}
                variant="ghost"
                size="default"
                class="w-fit text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60 cursor-not-allowed"
              >
                Syntax analysis
                <ChevronRightIcon />
              </TooltipTrigger>

              <TooltipContent>
                Select a mode before continuing
              </TooltipContent>
            </Tooltip>
          }
        >
          <Button
            variant="ghost"
            size="default"
            class="w-fit cursor-pointer"
            onClick={props.onContinue}
          >
            Syntax analysis
            <ChevronRightIcon />
          </Button>
        </Show>
      </div>
    </div>
  );
};