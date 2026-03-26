import {InputCommand} from "~/components/input-command";
import {Accessor, createEffect, createSignal, For, Match, onCleanup, Show, Switch} from "solid-js";
import {Card, CardContent} from "~/components/ui/card";
import {CodeLine} from "~/components/code-line";
import {Button} from "~/components/ui/button";
import {ParseTree} from "~/components/parse-tree";
import {ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon} from "lucide-solid";
import {insertNodeAtRandom, removeNodeById} from "~/lib/ui-utils";

const BLINK_DURATION: number = 100;

export type Token = {
  type: string;
  line: number;
  colStart: number;
  colEnd: number;
};

const TOKENS_TEST: Array<Token> = [
  {
    type: "ident",
    line: 6,
    colStart: 2,
    colEnd: 12,
  } satisfies Token,
  {
    type: "ident",
    line: 10,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
  {
    type: "ident",
    line: 13,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
  {
    type: "ident",
    line: 16,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
] satisfies Array<Token>;

const TREE_TEST: ParseTreeNode = {
  id: 'root',
  label: 'S',
  children: [
    {
      id: 'n1',
      label: 'NP',
      children: [
        { id: 'n1a', label: 'd', children: [{ id: 'n1a1', label: 't' }] },
        {
          id: 'n1b',
          label: 'N',
          children: [
            { id: 'n1b1', label: 'c' },
            { id: 'n1b2', label: 's' },
          ],
        },
        {
          id: 'n1c',
          label: 'AP',
          children: [
            { id: 'n1c1', label: 'A', children: [{ id: 'n1c1a', label: 'l' }] },
            {
              id: 'n1c2',
              label: 'a',
              children: [
                { id: 'n1c2a', label: 'v' },
                { id: 'n1c2b', label: 'q' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'n2',
      label: 'VP',
      children: [
        {
          id: 'n2a',
          label: 'V',
          children: [
            { id: 'n2a1', label: 'j' },
            { id: 'n2a2', label: 'r' },
          ],
        },
        {
          id: 'n2b',
          label: 'PP',
          children: [
            { id: 'n2b1', label: 'P', children: [{ id: 'n2b1a', label: 'o' }] },
            {
              id: 'n2b2',
              label: 'NP',
              children: [
                {
                  id: 'n2b2a',
                  label: 'N',
                  children: [
                    { id: 'n2b2a1', label: 'm' },
                    { id: 'n2b2a2', label: 'f' },
                    { id: 'n2b2a3', label: 'h' },
                  ],
                },
                {
                  id: 'n2b2b',
                  label: 'AP',
                  children: [
                    { id: 'n2b2b1', label: 'A', children: [{ id: 'n2b2b1a', label: 'h' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'n3',
      label: 'A',
      children: [
        { id: 'n3a', label: 'y' },
        { id: 'n3b', label: 't' },
      ],
    },
  ],
} satisfies ParseTreeNode;

type Page =
  | "input"
  | "lex"
  | "syntax";

export type ParseTreeNode = {
  id: string;
  label: string;
  children?: Array<ParseTreeNode>;
};

type Direction =
  | "none"
  | "backward"
  | "forward";

export const Home = () => {
  const [currentPage, setCurrentPage] = createSignal<Page>("input");

  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  const [tokens, setTokens] = createSignal<Array<Token>>(TOKENS_TEST);
  const [hoveredToken, setHoveredToken] = createSignal<Token | undefined>(undefined);

  const [buffer, setBuffer] = createSignal<Array<string>>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(/*TREE_TEST*/ {id: "a", label: "A", children: []});
  const [addedNodeIds, setAddedNodeIds] = createSignal<Array<string>>([]);
  const [autoModeDirection, setAutoModeDirection] = createSignal<Direction>("none");
  const [lastPressedButton, setLastPressedButton] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const direction = autoModeDirection();
    if (direction === "none") return;

    const interval = setInterval(() => {
      if (direction === "forward") nextStep();
      else previousStep();
    }, 500);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setLastPressedButton("prev");
        setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
        previousStep();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setLastPressedButton("next");
        setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
        nextStep();
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        setLastPressedButton("play");
        setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
        setAutoModeDirection(autoModeDirection() === "none" ? "forward" : "none");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        setLastPressedButton("play");
        setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
        setAutoModeDirection(autoModeDirection() === "none" ? "backward" : "none");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const nextStep = () => {
    setLastPressedButton("next");
    setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
    setBuffer((prev) => {
      setTree((currentTree) => {
        const result = insertNodeAtRandom(currentTree);
        setAddedNodeIds((ids) => [...ids, result.nodeId]);
        return result.tree;
      });
      return [...prev, "a"];
    });
  };

  const previousStep = () => {
    setLastPressedButton("prev");
    setTimeout(() => setLastPressedButton(undefined), BLINK_DURATION);
    setBuffer((prev) => {
      const ids = addedNodeIds();
      if (ids.length > 0) {
        const lastId = ids[ids.length - 1];
        setTree((currentTree) => removeNodeById(currentTree, lastId));
        setAddedNodeIds((prevIds) => prevIds.slice(0, -1));
      }
      return prev.slice(0, -1);
    });
  };

  return (
    <div class="flex flex-1 min-h-screen w-full items-center justify-center">
      <main class="flex flex-col w-full items-center justify-center">
        <Switch>
          <Match when={currentPage() === "input"}>
            <div class="flex items-center justify-center max-w-md w-full">
              <InputCommand
                onInput={(text: string) => {
                  setFileContent(text);
                  setCurrentPage("lex");
                }}
              />
            </div>
          </Match>

          <Match when={currentPage() === "lex"}>
            <Show when={fileContent()}>
              {(content: Accessor<string>) => {
                const lines = (): Array<string> => content().split('\n');
                const totalLines = (): number => lines().length;

                return (
                  <div class="flex flex-row items-center justify-center gap-6 w-full h-screen p-6 relative">
                    <Card class="flex flex-1 items-start justify-start w-full max-w-2xl h-full">
                      <CardContent
                        class="pt-6 h-full overflow-y-auto font-mono text-sm"
                        style={{"white-space": "pre"}}
                      >
                        <For each={lines()}>
                          {(line: string, idx: Accessor<number>) => (
                            <CodeLine
                              line={line}
                              lineNum={idx() + 1}
                              totalLines={totalLines()}
                              tokens={(): Array<Token> => hoveredToken() ? [hoveredToken()!] : []}
                            />
                          )}
                        </For>
                      </CardContent>
                    </Card>

                    <Card class="flex flex-1 items-start justify-start w-full max-w-xs h-full">
                      <CardContent class="pt-6 flex flex-col flex-1 h-full overflow-y-auto">
                        <For each={tokens()}>
                          {(token: Token) => (
                            <span
                              class="font-medium hover:bg-primary-700"
                              onMouseEnter={() => setHoveredToken(token)}
                              onMouseLeave={() => setHoveredToken(undefined)}
                            >
                          {token.type}
                        </span>
                          )}
                        </For>
                      </CardContent>
                    </Card>

                    <Button
                      variant="default"
                      size="default"
                      class="absolute bottom-7 right-7"
                      onClick={() => setCurrentPage("syntax")}
                    >
                      Continue
                    </Button>
                  </div>
                );
              }}
            </Show>
          </Match>

          <Match when={currentPage() === "syntax"}>
            <div class="flex flex-col items-center justify-center gap-6 w-full h-screen relative">
              <div class="flex flex-row items-center justify-center gap-6 w-full h-full max-w-4xl p-6 pb-0">
                <Card class="flex flex-1 items-center justify-center w-full h-full p-0">
                  <CardContent class="h-full w-full p-0 flex items-center justify-center overflow-hidden">
                    <ParseTree tree={tree}/>
                  </CardContent>
                </Card>

                <Card class="flex flex-1 items-start justify-start w-full max-w-3xs h-full">
                  <CardContent class="pt-6 flex flex-col flex-1 h-full overflow-y-auto">
                    right
                  </CardContent>
                </Card>
              </div>

              <div class="flex flex-col items-center justify-center w-full max-w-4xl gap-6">
                <div class="flex flex-row items-center justify-center w-full gap-2 h-10">
                  <For each={Array(9)}>
                    {(_, index: Accessor<number>) => (
                      <div class="flex items-center justify-center text-xl shadow-2xl rounded-md bg-primary-700 h-9 w-7">
                        {buffer().at(index()) ?? ""}
                      </div>
                    )}
                  </For>
                </div>

                <div class="flex flex-row items-center justify-center w-full gap-3 pb-6">
                  <Button
                    variant="default"
                    size="icon"
                    class="cursor-pointer transition-all"
                    classList={{
                      "opacity-50 scale-95": lastPressedButton() === "prev",
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
                    onClick={() => setAutoModeDirection(
                      autoModeDirection() === "none" ? "forward" : "none"
                    )}
                  >
                    <Show when={autoModeDirection() !== "none"} fallback={
                      <PlayIcon class="text-primary-900" />
                    }>
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
              </div>
            </div>
          </Match>
        </Switch>
      </main>
    </div>
  );
};