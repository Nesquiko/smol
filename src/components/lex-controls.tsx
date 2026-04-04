import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import ChevronsLeftIcon from "lucide-solid/icons/chevrons-left";
import ChevronsRightIcon from "lucide-solid/icons/chevrons-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import { Accessor, Component, For, Setter, Show } from "solid-js";

import { ControlsInfo } from "~/components/controls-info";
import { Button } from "~/components/ui/button";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { Caret } from "~/lib/types";
import { cn } from "~/lib/ui-utils";

const WINDOW_SIZE: number = 11;

interface LexControlsProps {
  fileContent: Accessor<string>;
  pointer: Accessor<number>;
  setPointer: Setter<number>;
  buffer: Accessor<Array<string>>;
  setBuffer: Setter<Array<string>>;
  setLogs: Setter<Array<string>>;
  caretPosition: Accessor<Caret>;
  withNavigation: boolean;
  onBack: () => void;
  onContinue: () => void;
  class?: string;
}

export const LexControls: Component<LexControlsProps> = (props) => {
  const nextStep = () => {
    const currentIndex: number = props.pointer();
    const text: string = props.fileContent();
    if (!text || currentIndex >= text.length) return;

    blink("next");

    const nextChar: string = text[currentIndex];
    const caret: Caret = props.caretPosition();
    const display: string = nextChar === "\n" ? "\\n" : nextChar === "\t" ? "\\t" : nextChar;

    props.setBuffer((prev: Array<string>): Array<string> => [...prev, nextChar]);
    props.setPointer(currentIndex + 1);
    props.setLogs(
      (prev: Array<string>): Array<string> => [
        ...prev,
        `Read: '${display}' at line ${caret.line}, col ${caret.col + 1}`,
      ],
    );
  };

  const previousStep = () => {
    if (props.pointer() === 0) return;

    blink("previous");

    props.setBuffer((prev: Array<string>): Array<string> => prev.slice(0, -1));
    props.setPointer((p: number): number => Math.max(0, p - 1));
    props.setLogs((prev: Array<string>): Array<string> => prev.slice(0, -1));
  };

  const jumpToFirst = () => {
    if (props.pointer() === 0) return;
    props.setBuffer([]);
    props.setPointer(0);
    props.setLogs([]);
  };

  const jumpToLast = () => {
    const text: string = props.fileContent();
    if (!text || props.pointer() >= text.length) return;

    const chars: Array<string> = text.split("");
    props.setBuffer(chars);
    props.setPointer(text.length);
    props.setLogs(
      chars.map((ch: string, i: number): string => {
        let line: number = 1;
        let col: number = 0;
        for (let j: number = 0; j < i; j++) {
          if (chars[j] === "\n") {
            line++;
            col = 0;
          } else {
            col++;
          }
        }
        const display: string = ch === "\n" ? "\\n" : ch === "\t" ? "\\t" : ch;
        return `Read: '${display}' at line ${line}, col ${col + 1}`;
      }),
    );
  };

  const { autoModeDirection, setAutoModeDirection, lastPressedButton, blink } = useAutoStep(
    nextStep,
    previousStep,
    jumpToFirst,
    jumpToLast,
    () => true,
  );

  const isOverflowing = (): boolean => props.buffer().length > WINDOW_SIZE;

  const visibleBuffer = (): Array<string> => {
    const buf: Array<string> = props.buffer();
    if (buf.length <= WINDOW_SIZE) {
      return [...buf, ...Array(WINDOW_SIZE - buf.length).fill("")];
    }
    return buf.slice(-WINDOW_SIZE);
  };

  const atStart = (): boolean => props.pointer() === 0;
  const atEnd = (): boolean => props.pointer() >= props.fileContent().length;

  return (
    <div class={cn("flex w-full flex-col items-center justify-center gap-6 px-6", props.class)}>
      <div class="relative flex w-full justify-center">
        <div class="relative flex h-10 flex-row gap-2">
          <Show when={isOverflowing()}>
            <div class="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
          </Show>

          <For each={visibleBuffer()}>
            {(char: string, i: Accessor<number>) => {
              const isCurrent = (): boolean =>
                props.buffer().length > 0 &&
                i() === Math.min(props.buffer().length - 1, WINDOW_SIZE - 1);

              return (
                <div
                  class="flex h-9 w-7 items-center justify-center rounded-md text-xl shadow-2xl transition-all duration-300"
                  classList={{
                    "bg-primary-700": !isCurrent(),
                    "bg-primary-300 text-primary-800 scale-110": isCurrent(),
                  }}
                >
                  {char}
                </div>
              );
            }}
          </For>
        </div>
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
              Lexical configuration
            </Button>
          </Show>
        </div>

        <div class="flex flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            size="icon"
            class="cursor-pointer transition-all"
            classList={{ "opacity-50 scale-95": lastPressedButton() === "first" }}
            onClick={jumpToFirst}
            disabled={atStart()}
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
            disabled={atStart()}
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
            disabled={atEnd()}
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
              disabled={atEnd()}
            >
              <ChevronsRightIcon class="text-primary-900" />
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
              Syntax configuration
              <ChevronRightIcon />
            </Button>
          </Show>
        </div>
      </div>
    </div>
  );
};
