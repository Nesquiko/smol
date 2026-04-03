import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import ChevronsLeftIcon from "lucide-solid/icons/chevrons-left";
import ChevronsRightIcon from "lucide-solid/icons/chevrons-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import {
  Accessor,
  Component,
  createMemo,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";
import { Motion } from "solid-motionone";

import { ControlsInfo } from "~/components/controls-info";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { BufferType, SyntaxParserStep, ParseTreeNode, StackType, Token } from "~/lib/types";
import { cn } from "~/lib/ui-utils";

interface SyntaxControlsProps {
  tokens: Accessor<Array<Token>>;
  steps: Accessor<Array<SyntaxParserStep>>;
  stepIndex: Accessor<number>;
  setStepIndex: Setter<number>;
  buffer: Accessor<BufferType>;
  setBuffer: Setter<BufferType>;
  setTree: Setter<ParseTreeNode>;
  setStack: Setter<StackType>;
  setLogs: Setter<string[]>;
  withNavigation: boolean;
  onBack: () => void;
  onContinue: () => void;
  onFlyToken: (fromRect: DOMRect, label: string) => void;
  class?: string;
}

export const SyntaxControls: Component<SyntaxControlsProps> = (props) => {
  const [isJumping, setIsJumping] = createSignal(false);
  const [hasSeenLastStep, setHasSeenLastStep] = createSignal<boolean>(false);

  const cellRefs: Array<HTMLDivElement | undefined> = [];

  createEffect(() => {
    const step = props.steps()[props.stepIndex()];
    if (!step) return;

    props.setStack(step.stack as StackType);
    props.setBuffer(
      step.bufferIndex !== undefined ? (props.tokens().slice(step.bufferIndex) as BufferType) : [],
    );
    props.setTree(step.tree);
    props.setLogs(
      props
        .steps()
        .slice(0, props.stepIndex() + 1)
        .map((s) => s.log),
    );
  });

  const goTo = (index: number) => {
    props.setStepIndex(Math.max(0, Math.min(index, props.steps().length - 1)));
  };

  const performStep = (dir: "next" | "previous") => {
    const nextIndex = dir === "next" ? props.stepIndex() + 1 : props.stepIndex() - 1;
    const clamped = Math.max(0, Math.min(nextIndex, props.steps().length - 1));

    if (dir === "next") {
      const nextStep = props.steps()[clamped];
      if (nextStep?.action.type === "match") {
        const tokenIdx = nextStep.currentTokenIndex;
        const cellEl = cellRefs[tokenIdx];
        if (cellEl) {
          props.onFlyToken(cellEl.getBoundingClientRect(), nextStep.action.symbol!);
        }
      }
    }

    goTo(clamped);
  };

  const nextStep = () => {
    if (props.stepIndex() >= props.steps().length - 1) return;
    blink("next");
    performStep("next");
  };

  const previousStep = () => {
    if (props.stepIndex() === 0) return;
    blink("previous");
    performStep("previous");
  };

  const jumpToStepForToken = async (tokenIndex: number) => {
    if (isJumping()) return;

    const targetStepIndex = props.steps().reduce((best, step, i) => {
      if (step.currentTokenIndex <= tokenIndex) return i;
      return best;
    }, 0);

    if (targetStepIndex === props.stepIndex()) return;

    setIsJumping(true);
    const direction = targetStepIndex > props.stepIndex() ? "next" : "previous";
    const count = Math.abs(targetStepIndex - props.stepIndex());

    for (let i = 0; i < count; i++) {
      performStep(direction);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    setIsJumping(false);
  };

  const jumpToFirst = () => {
    if (props.stepIndex() === 0) return;
    goTo(0);
  };

  const jumpToLast = () => {
    if (props.stepIndex() >= props.steps().length - 1) return;
    goTo(props.steps().length - 1);
  };

  const { autoModeDirection, setAutoModeDirection, lastPressedButton, blink } = useAutoStep(
    nextStep,
    previousStep,
    jumpToFirst,
    jumpToLast,
  );

  const cellWidth = 72;
  const cellGap = 8;

  const currentTokenIndex = createMemo(
    () => props.steps()[props.stepIndex()]?.currentTokenIndex ?? 0,
  );

  const translateX = (): number => -(currentTokenIndex() * (cellWidth + cellGap));

  createEffect(() => {
    if (props.stepIndex() >= props.steps().length - 1) {
      setHasSeenLastStep(true);
    }
  });

  return (
    <div class={cn("flex w-full flex-col items-center justify-center gap-6 px-6", props.class)}>
      <div class="relative flex h-12 w-full max-w-xl items-center justify-center overflow-hidden">
        <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

        <div
          class="absolute flex flex-row items-center gap-2"
          style={{ left: `calc(50% - ${cellWidth / 2}px)` }}
        >
          <Motion.div
            class="flex flex-row items-center gap-2"
            animate={{ x: translateX() }}
            transition={{ easing: "ease-in-out", duration: 0.3 }}
          >
            <For each={props.tokens()}>
              {(token: Token, index: Accessor<number>) => (
                <Tooltip placement="top" openDelay={0} closeDelay={0}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-expect-error */}
                  <TooltipTrigger
                    ref={(el: HTMLDivElement) => (cellRefs[index()] = el)}
                    class="flex h-9 w-18 cursor-pointer items-center justify-center rounded-md text-xs shadow-2xl transition-all duration-300 select-none"
                    classList={{
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-expect-error
                      "bg-primary-400 text-primary-900": index() === currentTokenIndex(),
                      "bg-primary-700": index() !== currentTokenIndex(),
                      "opacity-50": isJumping(),
                    }}
                    onClick={() => jumpToStepForToken(index())}
                  >
                    {token.type ?? ""}
                  </TooltipTrigger>

                  <TooltipContent class="flex -translate-y-2 flex-row items-center justify-start gap-2">
                    <span class="text-xs">{token.type}</span>
                    <span class="text-xs font-medium text-muted-foreground">
                      {token.line}:{token.colStart}-{token.colEnd}
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}
            </For>
          </Motion.div>
        </div>

        <div class="pointer-events-none absolute h-10 w-19 rounded-lg ring-2 ring-white" />
      </div>

      <div class="-mt-4 flex flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
        <span class="rounded-sm bg-primary-700 px-1 py-[1px] select-none">
          {props.stepIndex() + 1}
        </span>
        <span class="select-none">/</span>
        <span class="rounded-sm bg-primary-700 px-1 py-[1px] select-none">
          {props.steps().length}
        </span>
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
              Syntax configuration
            </Button>
          </Show>
        </div>

        <div class="relative flex flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            size="icon"
            class="cursor-pointer transition-all"
            classList={{
              "opacity-50 scale-95": lastPressedButton() === "first",
            }}
            onClick={jumpToFirst}
            disabled={isJumping() || props.stepIndex() === 0}
          >
            <ChevronsLeftIcon class="text-primary-900" />
          </Button>

          <Button
            variant="default"
            size="icon"
            class="cursor-pointer transition-all"
            classList={{
              "opacity-50 scale-95": lastPressedButton() === "previous",
            }}
            onClick={previousStep}
            disabled={isJumping() || props.stepIndex() === 0}
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
            disabled={isJumping()}
          >
            <Show
              when={autoModeDirection() !== "none"}
              fallback={<PlayIcon class="text-primary-900" />}
            >
              <PauseIcon class="text-primary-900" />
            </Show>
          </Button>

          <Button
            variant="default"
            size="icon"
            class="cursor-pointer transition-all"
            classList={{
              "opacity-50 scale-95": lastPressedButton() === "next",
            }}
            onClick={nextStep}
            disabled={isJumping() || props.stepIndex() >= props.steps().length - 1}
          >
            <ChevronRightIcon class="text-primary-900" />
          </Button>

          <div class="relative">
            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "opacity-50 scale-95": lastPressedButton() === "last",
              }}
              onClick={jumpToLast}
              disabled={isJumping() || props.stepIndex() >= props.steps().length - 1}
            >
              <ChevronsRightIcon class="text-primary-900" />
            </Button>

            <ControlsInfo />
          </div>
        </div>

        <div class="flex w-full items-center justify-end">
          <Show when={props.withNavigation}>
            <Show
              when={hasSeenLastStep()}
              fallback={
                <Tooltip placement="top" openDelay={0} closeDelay={0}>
                  <TooltipTrigger
                    as={Button}
                    variant="ghost"
                    size="default"
                    class="w-fit text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
                    classList={{
                      "cursor-pointer": hasSeenLastStep(),
                      "cursor-not-allowed": !hasSeenLastStep(),
                    }}
                  >
                    Results
                    <ChevronRightIcon />
                  </TooltipTrigger>

                  <TooltipContent>
                    Check out the last step before seeing the results!
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
                Results
                <ChevronRightIcon />
              </Button>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};
