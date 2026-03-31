// components/syntax-controls.tsx

import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import {
  Accessor,
  Component,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";

import { ControlsInfo } from "~/components/controls-info";
import { Button } from "~/components/ui/button";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { BufferType, ParseTreeNode, StackType, Token } from "~/lib/types";
import { cn } from "~/lib/ui-utils";
import { Motion } from "solid-motionone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface SyntaxControlsProps {
  tokens: Accessor<Array<Token>>;
  buffer: Accessor<BufferType>;
  setBuffer: Setter<BufferType>;
  setTree: Setter<ParseTreeNode>;
  setStack: Setter<StackType>;
  withNavigation: boolean;
  onBack: () => void;
  onContinue: () => void;
  onFlyToken: (fromRect: DOMRect, label: string) => void;
  class?: string;
}

export const SyntaxControls: Component<SyntaxControlsProps> = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isJumping, setIsJumping] = createSignal(false);

  // Refs for each tape cell so we can measure their positions
  const cellRefs: Array<HTMLDivElement | undefined> = [];

  const performStep = (direction: "next" | "previous") => {
    if (direction === "next") {
      const idx = currentIndex();
      const cellEl = cellRefs[idx];
      if (cellEl) {
        const fromRect = cellEl.getBoundingClientRect();
        const token = props.tokens()[idx];
        if (token) {
          props.onFlyToken(fromRect, token.type);
        }
      }

      setCurrentIndex((i) => Math.min(i + 1, props.tokens().length - 1));
      setTimeout(() => props.setStack((prev) => [...prev, props.tokens()[idx]]), 350);
    } else {
      setCurrentIndex((i) => Math.max(i - 1, 0));
      props.setStack((prev) => prev.length === 1 ? prev : prev.slice(0, -1));
    }
  };

  const nextStep = () => {
    blink("next");
    performStep("next");
  };

  const previousStep = () => {
    if (currentIndex() === 0) return;
    blink("previous");
    performStep("previous");
  };

  const jumpToIndex = async (targetIndex: number) => {
    if (targetIndex === currentIndex() || isJumping()) return;

    setIsJumping(true);
    const direction: "next" | "previous" =
      targetIndex > currentIndex() ? "next" : "previous";

    const steps = Math.abs(targetIndex - currentIndex());
    for (let i = 0; i < steps; i++) {
      performStep(direction);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsJumping(false);
  };

  const {
    autoModeDirection,
    setAutoModeDirection,
    lastPressedButton,
    blink,
  } = useAutoStep(nextStep, previousStep);

  const cellWidth = 72;
  const cellGap = 8;

  const translateX = (): number =>
    -(currentIndex() * (cellWidth + cellGap));

  return (
    <div
      class={cn(
        "flex w-full flex-col items-center justify-center gap-6 px-6",
        props.class,
      )}
    >
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
                  <TooltipTrigger
                    as="div"
                    ref={(el: HTMLDivElement) => (cellRefs[index()] = el)}
                    class="select-none text-xs flex h-9 w-18 items-center justify-center rounded-md shadow-2xl transition-all duration-300 cursor-pointer"
                    classList={{
                      "bg-primary-400": index() === currentIndex(),
                      "bg-primary-700": index() !== currentIndex(),
                      "opacity-50": isJumping(),
                    }}
                    onClick={() => jumpToIndex(index())}
                  >
                    {token.type ?? ""}
                  </TooltipTrigger>

                  <TooltipContent class="flex flex-row gap-2 items-center justify-start -translate-y-2">
                    <span class="text-xs">{token.type}</span>
                    <span class="font-medium text-xs text-muted-foreground">
                      {token.line}:{token.colStart}-{token.colEnd}
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}
            </For>
          </Motion.div>
        </div>

        <div class="absolute h-10 w-19 rounded-lg ring-2 ring-white pointer-events-none" />
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
              Lexical analysis
            </Button>
          </Show>
        </div>

        <div class="relative flex flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            size="icon"
            class="cursor-pointer transition-all"
            classList={{
              "opacity-50 scale-95": lastPressedButton() === "previous",
            }}
            onClick={previousStep}
            disabled={isJumping() || currentIndex() === 0}
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
              setAutoModeDirection(
                autoModeDirection() === "none" ? "forward" : "none",
              )
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

          <div class="relative">
            <Button
              variant="default"
              size="icon"
              class="cursor-pointer transition-all"
              classList={{
                "opacity-50 scale-95": lastPressedButton() === "next",
              }}
              onClick={nextStep}
              disabled={isJumping()}
            >
              <ChevronRightIcon class="text-primary-900" />
            </Button>

            <ControlsInfo />
          </div>
        </div>

        <div class="flex w-full items-center justify-end">
          <Show when={props.withNavigation}>
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
        </div>
      </div>
    </div>
  );
};