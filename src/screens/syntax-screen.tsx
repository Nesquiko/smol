import MouseIcon from "lucide-solid/icons/mouse";
import MoveIcon from "lucide-solid/icons/move";
import { Accessor, Component, createEffect, createSignal, For } from "solid-js";

import { ParseTree } from "~/components/parse-tree";
import { Stack } from "~/components/stack";
import { SyntaxControls } from "~/components/syntax-controls";
import { FlyingToken, TokenFlyAnimation } from "~/components/token-fly-animation";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TREE_TEST_SMALL } from "~/lib/data/test-data";
import { BufferType, ParserStep, ParseTreeNode, StackType, Token } from "~/lib/types";

type SyntaxTab =
  | "tree"
  | "logs";

interface SyntaxScreenProps {
  tokens: Accessor<Array<Token>>;
  steps: Accessor<Array<ParserStep>>;
  onContinue: () => void;
  onBack: () => void;
}

let flyId: number = 0;

export const SyntaxScreen: Component<SyntaxScreenProps> = (props) => {
  const [buffer, setBuffer] = createSignal<BufferType>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(TREE_TEST_SMALL);
  const [stack, setStack] = createSignal<StackType>(["$"]);
  const [flyingTokens, setFlyingTokens] = createSignal<Array<FlyingToken>>([]);
  const [logs, setLogs] = createSignal<string[]>([]);
  const [stepIndex, setStepIndex] = createSignal(0);

  const [activeTab, setActiveTab] = createSignal<SyntaxTab>("tree");

  let stackCardRef: HTMLDivElement | undefined;
  let logsContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (logsContainerRef) {
      logsContainerRef.scrollTop = logsContainerRef.scrollHeight;
    }
  });

  const handleFlyToken = (fromRect: DOMRect, label: string) => {
    if (!stackCardRef) return;

    const stackRect: DOMRect = stackCardRef.getBoundingClientRect();

    const itemHeight: number = 20;
    const toRect: DOMRect = new DOMRect(
      stackRect.left + 2,
      stackRect.top,
      stackRect.width - 4,
      itemHeight,
    );

    const id: number = flyId++;
    setFlyingTokens(
      (prev: Array<FlyingToken>): Array<FlyingToken> => [...prev, { id, label, fromRect, toRect }],
    );
  };

  const handleFlyComplete = (id: number) => {
    setFlyingTokens(
      (prev: Array<FlyingToken>): Array<FlyingToken> =>
        prev.filter((ft: FlyingToken): boolean => ft.id !== id),
    );
  };

  const padWidth = (): number => String(logs().length).length;

  return (
    <div class="relative flex h-screen w-full flex-col items-center justify-center gap-6">
      <TokenFlyAnimation flyingTokens={flyingTokens} onComplete={handleFlyComplete} />

      <div class="flex min-h-0 w-full max-w-5xl flex-1 flex-row items-stretch justify-center gap-6 p-6 pb-0">
        <Card class="relative flex h-full w-full flex-1 items-center justify-center p-0">
          <Tabs value={activeTab()} onChange={setActiveTab} class="flex h-full w-full flex-col">
            <TabsList class="w-full rounded-t-lg rounded-b-none border-b bg-primary-900">
              <TabsTrigger
                value="tree"
                class="w-1/2 cursor-pointer data-[selected]:bg-primary-700 data-[selected]:shadow-none"
              >
                Parse tree
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                class="w-1/2 cursor-pointer data-[selected]:bg-primary-700 data-[selected]:shadow-none"
              >
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tree" class="mt-0 flex-1 rounded-b-lg bg-primary-900">
              <CardContent class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-b-lg p-0">
                <ParseTree
                  tree={tree}
                  active={() => activeTab() === "tree"}
                  currentNodeId={() => props.steps()[stepIndex()]?.currentNodeId}
                  class="z-20"
                />

                <div class="absolute bottom-3 left-3 z-30 flex flex-row items-center justify-center gap-2 text-muted">
                  <div class="flex flex-row items-center justify-center gap-1">
                    <MouseIcon class="size-4 select-none" />
                    <span class="text-xs select-none">Zoom</span>
                  </div>
                  <div class="flex flex-row items-center justify-center gap-1">
                    <MoveIcon class="size-4 select-none" />
                    <span class="text-xs select-none">Move</span>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent
              value="logs"
              class="mt-0 flex-1 overflow-hidden rounded-b-lg bg-primary-900"
            >
              <CardContent
                ref={logsContainerRef}
                class="flex h-full w-full flex-col items-start justify-start gap-0 overflow-y-auto rounded-b-lg p-4"
              >
                <For each={logs()}>
                  {(log: string, index) => (
                    <p
                      class="w-full text-left text-xs leading-tight break-words whitespace-pre-wrap"
                      classList={{
                        "text-white font-bold": log.startsWith("Accept"),
                        "text-red-400": log.startsWith("Error"),
                        "text-primary-300": log.startsWith("Match"),
                        "text-primary-400": log.startsWith("Expand"),
                      }}
                    >
                      <span class="mr-4 ml-2 font-mono text-sm text-primary-500 select-none">
                        {String(index() + 1).padStart(padWidth(), " ")}
                      </span>
                      {log}
                    </p>
                  )}
                </For>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <Stack stack={stack} cardRef={(el) => (stackCardRef = el)} />
      </div>

      <SyntaxControls
        tokens={props.tokens}
        steps={props.steps}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        buffer={buffer}
        setBuffer={setBuffer}
        setTree={setTree}
        setStack={setStack}
        setLogs={setLogs}
        withNavigation={true}
        onBack={props.onBack}
        onContinue={props.onContinue}
        onFlyToken={handleFlyToken}
      />
    </div>
  );
};
