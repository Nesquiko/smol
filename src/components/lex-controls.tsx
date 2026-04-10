import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import ChevronsLeftIcon from "lucide-solid/icons/chevrons-left";
import ChevronsRightIcon from "lucide-solid/icons/chevrons-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import {
  Accessor,
  batch,
  Component,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";

import { ControlsInfo } from "~/components/controls-info";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { Lexer, LexError, newLexer } from "~/lib/lexer";
import { Caret, LexLog, Token } from "~/lib/types";
import { cn } from "~/lib/ui-utils";

const WINDOW_SIZE: number = 11;

interface LexControlsProps {
  fileContent: Accessor<string>;
  pointer: Accessor<number>;
  setPointer: Setter<number>;
  setLogs: Setter<Array<LexLog>>;
  setTokens: Setter<Array<Token>>;
  caretPosition: Accessor<Caret>;
  error: Accessor<LexError | undefined>;
  setError: Setter<LexError | undefined>;
  withNavigation: boolean;
  onBack: () => void;
  onContinue: () => void;
  class?: string;
}

const STARTING_LINE = 1;

export const LexControls: Component<LexControlsProps> = (props) => {
  let lexer: Lexer | undefined = undefined;

  const initializeLexer = () => {
    const { lexer, log } = newLexer({ startingLine: STARTING_LINE });
    props.setLogs([log]);
    return lexer;
  };

  createEffect(() => {
    lexer = initializeLexer();
  });

  const [buffer, setBuffer] = createSignal<Array<string>>([]);

  const nextStep = () => {
    if (props.error()) return;

    blink("next");
    lexText({ moveDelta: 1 });
  };

  const jumpToLast = () => {
    if (props.error()) return;

    blink("last");
    lexText();
  };

  const previousStep = () =>
    batch(() => {
      blink("previous");
      const currentIndex: number = props.pointer();
      reset();

      // currentIndex was reset to 0, so adding it -1 as delta will go to
      // previous index
      lexText({ moveDelta: currentIndex - 1 });
    });

  const jumpToFirst = () =>
    batch(() => {
      blink("first");
      reset();
    });

  const reset = () => {
    setBuffer([]);
    props.setPointer(0);
    props.setLogs([]);
    props.setTokens([]);
    props.setError(undefined);
    lexer = initializeLexer();
  };

  const lexText = (args?: { startFrom?: number; moveDelta?: number }) => {
    args ??= {};

    const currentIndex: number = args.startFrom ?? props.pointer();
    const text: string = props.fileContent();
    const caret: Caret = props.caretPosition();

    if (!lexer) return;
    const lexArgs: LexArgs = {
      text,
      lexer,
      startingLine: caret.line,
      from: currentIndex,
      linePos: caret.col,
    };
    if (args.moveDelta !== undefined) {
      const moveDelta = Math.max(args.moveDelta, 0);
      lexArgs.to = Math.min(currentIndex + moveDelta, text.length);
    }

    const { tokens, logs, buffer, error } = lex(lexArgs);

    if (error) {
      props.setError(error);
    } else {
      props.setError(undefined);
    }

    props.setLogs((prev) => [...prev, ...logs]);
    if (buffer.length !== 0) {
      setBuffer((prev) => [...prev, ...buffer]);
    } else {
      setBuffer([]);
    }
    props.setTokens((prev) => [...prev, ...tokens]);
    props.setPointer(lexArgs.to ?? text.length);
  };

  const { autoModeDirection, setAutoModeDirection, lastPressedButton, blink } = useAutoStep(
    nextStep,
    previousStep,
    jumpToFirst,
    jumpToLast,
    () => true,
    () => !props.error(),
  );

  const isOverflowing = (): boolean => buffer().length > WINDOW_SIZE;

  const visibleBuffer = (): Array<string> => {
    const buf: Array<string> = buffer();
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
            <div class="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-linear-to-r from-background to-transparent" />
          </Show>

          <For each={visibleBuffer()}>
            {(char: string, i: Accessor<number>) => {
              const isCurrent = (): boolean =>
                buffer().length > 0 && i() === Math.min(buffer().length - 1, WINDOW_SIZE - 1);

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
            disabled={atEnd() || !!props.error()}
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
              disabled={atEnd() || !!props.error()}
            >
              <ChevronsRightIcon class="text-primary-900" />
            </Button>

            <ControlsInfo />
          </div>
        </div>

        <div class="flex w-full items-center justify-end">
          <Show
            when={atEnd() && props.error() === undefined}
            fallback={
              <Tooltip placement="top" openDelay={0} closeDelay={0}>
                <TooltipTrigger
                  as={Button}
                  variant="ghost"
                  size="default"
                  class="w-fit text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
                  classList={{
                    "cursor-pointer": atEnd() && props.error() === undefined,
                    "cursor-not-allowed": !atEnd() || !!props.error(),
                  }}
                >
                  Syntax configuration
                  <ChevronRightIcon />
                </TooltipTrigger>

                <TooltipContent>You have to process all of the tokens to continue!</TooltipContent>
              </Tooltip>
            }
          >
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

interface LexArgs {
  text: string;
  lexer: Lexer;
  from?: number;
  to?: number;
  startingLine?: number;
  linePos?: number;
}

function lex(args: LexArgs) {
  const from = Math.max(args.from ?? 0, 0);
  const to = Math.min(args.to ?? args.text.length, args.text.length);

  let line = args.startingLine ?? 0;
  let linePos = args.linePos ?? 0;
  let buffer = new Array<string>();
  const tokens = new Array<Token>();
  const logs = new Array<LexLog>();

  for (let i = from; i < to; i++) {
    const result = args.lexer.process({ char: args.text[i], line, linePos });

    logs.push(...result.logs);
    if (result.type === "ok") {
      tokens.push(...result.tokens);
      buffer = [];
    } else if (result.type === "error") {
      return { tokens, logs, buffer, error: result.error };
    } else {
      buffer.push(args.text[i]);
    }

    if (args.text[i] === "\n") {
      line++;
      linePos = 0;
    } else {
      linePos++;
    }
  }

  if (to >= args.text.length) {
    const result = args.lexer.eof({ line, linePos });

    logs.push(...result.logs);
    if (result.type === "ok") {
      tokens.push(...result.tokens);
    } else if (result.type === "error") {
      return { tokens, logs, buffer, error: result.error };
    }
  }

  return { tokens, logs, buffer };
}
