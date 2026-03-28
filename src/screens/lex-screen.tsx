import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import PauseIcon from "lucide-solid/icons/pause";
import PlayIcon from "lucide-solid/icons/play";
import { Accessor, Component, createSignal, For, Show } from "solid-js";

import { CodeLine } from "~/components/code-line";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useAutoStep } from "~/lib/hooks/use-auto-step";
import { Caret, Token } from "~/lib/types";

interface LexScreenProps {
  fileContent: Accessor<string | undefined>;
  tokens: Accessor<Array<Token>>;
  onContinue: () => void;
  onBack: () => void;
}

export const LexScreen: Component<LexScreenProps> = (props: LexScreenProps) => {
  const [hoveredToken, setHoveredToken] = createSignal<Token | undefined>(undefined);
  const [buffer, setBuffer] = createSignal<Array<string>>([]);
  const [pointer, setPointer] = createSignal<number>(0);

  const normalizedContent = (): string => props.fileContent()?.replace(/\r\n/g, "\n") ?? "";

  let codeContainer: HTMLDivElement | undefined;
  let tokensContainer: HTMLDivElement | undefined;

  const handleScroll = (e: Event) => {
    const target: HTMLDivElement = e.target as HTMLDivElement;
    const newScrollTop: number = target.scrollTop;

    if (codeContainer && target === codeContainer) {
      if (tokensContainer) tokensContainer.scrollTop = newScrollTop;
    } else if (tokensContainer && target === tokensContainer) {
      if (codeContainer) codeContainer.scrollTop = newScrollTop;
    }
  };

  const nextStep = () => {
    blink("next");

    const currentIndex: number = pointer();
    const text: string = normalizedContent();

    if (!text) return;

    if (currentIndex >= text.length) return;

    const nextChar: string = text[currentIndex];
    console.log(JSON.stringify(nextChar));

    setBuffer((prev: Array<string>): Array<string> => [...prev, nextChar]);
    setPointer(currentIndex + 1);
  };

  const previousStep = () => {
    blink("previous");

    setBuffer((prev) => prev.slice(0, -1));
    setPointer((p) => Math.max(0, p - 1));
  };

  const WINDOW_SIZE = 11;

  const visibleBuffer = (): Array<string> => {
    const buf: Array<string> = buffer();

    if (buf.length <= WINDOW_SIZE) {
      return [...buf, ...Array(WINDOW_SIZE - buf.length).fill("")];
    }

    return buf.slice(-WINDOW_SIZE);
  };

  const { autoModeDirection, setAutoModeDirection, lastPressedButton, blink } = useAutoStep(
    nextStep,
    previousStep,
  );

  const isOverflowing = (): boolean => buffer().length > WINDOW_SIZE;

  const caretPosition = (): Caret => {
    const text: string = normalizedContent();
    const index: number = pointer();

    let line: number = 1;
    let col: number = 0;

    for (let i: number = 0; i < index; i++) {
      if (text[i] === "\n") {
        line++;
        col = 0;
      } else {
        col++;
      }
    }

    return {
      line,
      col,
    };
  };

  return (
    <Show when={props.fileContent()}>
      {(content: Accessor<string>) => {
        const lines = (): Array<string> => content().split("\n");
        const totalLines = (): number => lines().length;
        const tokensByLine = (): Map<number, Array<Token>> => {
          const map = new Map<number, Token[]>();
          props.tokens().forEach((token: Token) => {
            if (!map.has(token.line)) {
              map.set(token.line, []);
            }
            map.get(token.line)!.push(token);
          });
          return map;
        };

        return (
          <div class="flex h-screen w-full flex-col items-center justify-center gap-6 p-6">
            <Card class="min-h-0 w-5xl max-w-full flex-1 overflow-hidden">
              <CardContent class="flex h-full flex-row p-0">
                <div
                  ref={codeContainer}
                  onScroll={handleScroll}
                  class="w-3/5 overflow-x-auto overflow-y-auto border-r border-border font-mono text-sm"
                  style={{ "white-space": "pre" }}
                >
                  <div class="flex flex-col gap-0 py-3">
                    <For each={lines()}>
                      {(line: string, idx: Accessor<number>) => {
                        const lineNum = (): number => idx() + 1;
                        return (
                          <div class="h-6 flex-shrink-0 px-6 py-0">
                            <CodeLine
                              line={line}
                              lineNum={lineNum}
                              totalLines={totalLines}
                              tokens={(): Array<Token> => (hoveredToken() ? [hoveredToken()!] : [])}
                              caret={caretPosition}
                            />
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>

                <div
                  ref={tokensContainer}
                  onScroll={handleScroll}
                  class="w-2/5 overflow-x-auto overflow-y-auto border-l border-border bg-muted/30"
                >
                  <div class="flex flex-col gap-0 py-3">
                    <For each={lines()}>
                      {(_: string, idx: Accessor<number>) => {
                        const lineNum = (): number => idx() + 1;
                        const tokensForLine = (): Array<Token> =>
                          tokensByLine().get(lineNum()) ?? [];
                        return (
                          <div class="flex h-6 flex-shrink-0 items-start gap-1 px-4 py-0">
                            <For each={tokensForLine()}>
                              {(token: Token) => (
                                <Badge
                                  variant="default"
                                  onMouseEnter={() => setHoveredToken(token)}
                                  onMouseLeave={() => setHoveredToken(undefined)}
                                  class="w-fit cursor-pointer bg-primary-700 px-1.5 py-0 text-xs font-normal whitespace-nowrap hover:bg-primary-500"
                                >
                                  {token.type}
                                </Badge>
                              )}
                            </For>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div class="flex w-full flex-col items-center justify-center gap-6 px-6">
              <div class="relative flex w-full justify-center">
                <div class="relative flex h-10 flex-row gap-2">
                  <Show when={isOverflowing()}>
                    <div class="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
                  </Show>

                  <For each={visibleBuffer()}>
                    {(char: string, i: Accessor<number>) => {
                      const isCurrent = (): boolean =>
                        buffer().length > 0 &&
                        i() === Math.min(buffer().length - 1, WINDOW_SIZE - 1);

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
                  <Button
                    variant="ghost"
                    size="default"
                    class="w-fit cursor-pointer"
                    onClick={props.onBack}
                  >
                    <ChevronLeftIcon />
                    File input
                  </Button>
                </div>

                <div class="flex flex-row items-center justify-center gap-3">
                  <Button
                    variant="default"
                    size="icon"
                    class="cursor-pointer transition-all"
                    classList={{
                      "opacity-50 scale-95": lastPressedButton() === "previous",
                    }}
                    onClick={previousStep}
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
                  >
                    <ChevronRightIcon class="text-primary-900" />
                  </Button>
                </div>

                <div class="flex w-full items-center justify-end">
                  <Button
                    variant="ghost"
                    size="default"
                    class="w-fit cursor-pointer"
                    onClick={props.onContinue}
                  >
                    Syntax analysis
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
};
