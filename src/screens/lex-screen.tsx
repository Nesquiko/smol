import BracesIcon from "lucide-solid/icons/braces";
import CodeIcon from "lucide-solid/icons/code";
import TerminalIcon from "lucide-solid/icons/terminal";
import { Accessor, Component, createEffect, createSignal, For, on, Setter, Show } from "solid-js";

import { CodeLine } from "~/components/code-line";
import { LexControls } from "~/components/lex-controls";
import { NoData } from "~/components/no-data";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { LexError } from "~/lib/lexer";
import { Caret, LexLog, Token } from "~/lib/types";
import { formatLog } from "~/lib/ui-utils";

type LexTab = "code" | "logs";

interface LexScreenProps {
  fileContent: Accessor<string | undefined>;
  tokens: Accessor<Array<Token>>;
  setTokens: Setter<Array<Token>>;
  onContinue: () => void;
  onBack: () => void;
}

export const LexScreen: Component<LexScreenProps> = (props) => {
  const [hoveredToken, setHoveredToken] = createSignal<Token | undefined>(undefined);
  const [pointer, setPointer] = createSignal<number>(0);
  const [logs, setLogs] = createSignal<Array<LexLog>>([]);
  const [activeTab, setActiveTab] = createSignal<LexTab>("code");
  const [error, setError] = createSignal<LexError | undefined>(undefined);

  let codeContainer: HTMLDivElement | undefined;
  let tokensContainer: HTMLDivElement | undefined;
  let logsContainerRef: HTMLDivElement | undefined;

  createEffect(
    on(logs, () => {
      if (logsContainerRef) {
        logsContainerRef.scrollTop = logsContainerRef.scrollHeight;
      }
    }),
  );

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop: number = target.scrollTop;
    if (codeContainer && target === codeContainer) {
      if (tokensContainer) tokensContainer.scrollTop = newScrollTop;
    } else if (tokensContainer && target === tokensContainer) {
      if (codeContainer) codeContainer.scrollTop = newScrollTop;
    }
  };

  const normalizedContent = (): string => props.fileContent()?.replace(/\r\n/g, "\n") ?? "";

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
    return { line, col };
  };

  const padWidth = (): number => String(logs().length).length;

  return (
    <Show when={props.fileContent()}>
      {(content: Accessor<string>) => {
        const lines = (): Array<string> => content().split("\n");
        const totalLines = (): number => lines().length;

        const tokensByLine = (): Map<number, Array<Token>> => {
          const map = new Map<number, Token[]>();
          props.tokens().forEach((token: Token) => {
            if (!map.has(token.line)) map.set(token.line, []);
            map.get(token.line)!.push(token);
          });
          return map;
        };

        return (
          <div class="flex h-screen w-full flex-col items-center justify-center gap-6 pt-6">
            <Card class="min-h-0 w-11/12 max-w-full flex-1 overflow-hidden">
              <Tabs
                value={activeTab()}
                onChange={setActiveTab}
                orientation="vertical"
                class="flex h-full w-full flex-row"
              >
                <TabsList class="flex h-full w-10 flex-col rounded-lg rounded-r-none border-r bg-primary-900">
                  <TabsTrigger
                    value="code"
                    class="w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg data-selected:bg-primary-700 data-selected:shadow-none"
                    style={{ "writing-mode": "vertical-rl", rotate: "180deg" }}
                  >
                    <CodeIcon class="inline-block size-4 rotate-90" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger
                    value="logs"
                    class="w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg data-selected:bg-primary-700 data-selected:shadow-none"
                    style={{ "writing-mode": "vertical-rl", rotate: "180deg" }}
                  >
                    <TerminalIcon class="inline-block size-4 rotate-90" />
                    Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" class="mt-0 flex-1 overflow-hidden rounded-r-lg">
                  <CardContent class="flex h-full flex-row p-0">
                    <div
                      ref={codeContainer}
                      onScroll={handleScroll}
                      class="w-1/2 overflow-x-auto overflow-y-auto border-r border-border bg-primary-900 font-mono text-sm"
                      style={{ "white-space": "pre" }}
                    >
                      <div class="flex flex-col gap-0 py-3">
                        <For each={lines()}>
                          {(line: string, idx: Accessor<number>) => {
                            const lineNum = (): number => idx() + 1;
                            return (
                              <div class="h-6 shrink-0 px-6 py-0">
                                <CodeLine
                                  line={line}
                                  lineNum={lineNum}
                                  totalLines={totalLines}
                                  tokens={(): Array<Token> =>
                                    hoveredToken() ? [hoveredToken()!] : []
                                  }
                                  caret={caretPosition}
                                  lexError={error}
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
                      class="w-1/2 overflow-x-auto border-l border-border bg-muted/30"
                      classList={{
                        "overflow-y-auto": tokensByLine().size !== 0,
                      }}
                    >
                      <div class="relative flex flex-col gap-0 py-3">
                        <Show when={tokensByLine().size === 0}>
                          <NoData icon={BracesIcon} text="No tokens yet" class="mt-32" />
                        </Show>
                        <For each={lines()}>
                          {(_: string, idx: Accessor<number>) => {
                            const lineNum = (): number => idx() + 1;
                            const tokensForLine = (): Array<Token> =>
                              tokensByLine().get(lineNum()) ?? [];
                            return (
                              <div class="flex h-6 shrink-0 items-start gap-1 px-4 py-0">
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
                </TabsContent>

                <TabsContent
                  value="logs"
                  class="mt-0 flex-1 overflow-hidden rounded-r-lg bg-primary-900"
                >
                  <CardContent
                    ref={logsContainerRef}
                    class="flex h-full w-full flex-col items-start justify-start gap-0 overflow-y-auto rounded-b-lg p-4"
                  >
                    <Show
                      when={logs().length !== 0}
                      fallback={<NoData icon={TerminalIcon} text="No logs yet" />}
                    >
                      <For each={logs()}>
                        {(log: LexLog, index: Accessor<number>) => (
                          <p
                            class="w-full text-left text-xs leading-tight wrap-break-word whitespace-pre-wrap"
                            classList={{
                              "text-foreground": log.type === "init",
                              "text-primary-300": log.type === "emit",
                              "text-primary-500": log.type === "transition",
                              "text-green-300 font-bold": log.type === "eof",
                              "text-red-400": log.type === "error",
                            }}
                          >
                            <span class="mr-4 ml-2 font-mono text-sm text-primary-500 select-none">
                              {String(index() + 1).padStart(padWidth(), " ")}
                            </span>
                            {formatLog(log)}
                          </p>
                        )}
                      </For>
                    </Show>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>

            <LexControls
              fileContent={normalizedContent}
              pointer={pointer}
              setPointer={setPointer}
              setLogs={setLogs}
              setTokens={props.setTokens}
              caretPosition={caretPosition}
              error={error}
              setError={setError}
              withNavigation={true}
              onBack={props.onBack}
              onContinue={props.onContinue}
            />
          </div>
        );
      }}
    </Show>
  );
};
