import GitBranchIcon from "lucide-solid/icons/git-branch";
import MouseIcon from "lucide-solid/icons/mouse";
import MoveIcon from "lucide-solid/icons/move";
import TerminalIcon from "lucide-solid/icons/terminal";
import { Accessor, Component, createEffect, createSignal, For, Show } from "solid-js";

import { ParseTree } from "~/components/parse-tree";
import { Stack } from "~/components/stack";
import { SyntaxControls } from "~/components/syntax-controls";
import { FlyingToken, TokenFlyAnimation } from "~/components/token-fly-animation";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BufferType, SyntaxParserStep, ParseTreeNode, StackType, Token } from "~/lib/types";

const INITIAL_TREE: ParseTreeNode = {
  id: "-1",
  data: "program",
  processed: false,
} satisfies ParseTreeNode;

type SyntaxTab = "tree" | "logs";

interface SyntaxScreenProps {
  tokens: Accessor<Array<Token>>;
  steps: Accessor<Array<SyntaxParserStep>>;
  onContinue: () => void;
  onBack: () => void;
}

let flyId: number = 0;

export const SyntaxScreen: Component<SyntaxScreenProps> = (props) => {
  const [buffer, setBuffer] = createSignal<BufferType>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(INITIAL_TREE);
  const [stack, setStack] = createSignal<StackType>([]);
  const [flyingTokens, setFlyingTokens] = createSignal<Array<FlyingToken>>([]);
  const [logs, setLogs] = createSignal<string[]>([]);
  const [stepIndex, setStepIndex] = createSignal(0);

  const [treeFullscreen, setTreeFullscreen] = createSignal<boolean>(false);
  const [activeTab, setActiveTab] = createSignal<SyntaxTab>("tree");

  let stackCardRef: HTMLDivElement | undefined;
  let logsContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    logs();
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
          <Tabs
            value={activeTab()}
            onChange={setActiveTab}
            orientation="vertical"
            class="flex h-full w-full flex-row"
          >
            <TabsList class="flex h-full w-10 flex-col rounded-lg rounded-r-none border-r bg-primary-900">
              <TabsTrigger
                value="tree"
                class="w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg data-[selected]:bg-primary-700 data-[selected]:shadow-none"
                style={{ "writing-mode": "vertical-rl", rotate: "180deg" }}
              >
                <GitBranchIcon class="inline-block size-4 rotate-90" />
                Parse tree
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                class="w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg data-[selected]:bg-primary-700 data-[selected]:shadow-none"
                style={{ "writing-mode": "vertical-rl", rotate: "180deg" }}
              >
                <TerminalIcon class="inline-block size-4 rotate-90" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="tree"
              class="mt-0 flex-1 overflow-hidden rounded-r-lg bg-primary-900"
            >
              <CardContent class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-r-lg p-0">
                <ParseTree
                  tree={tree}
                  active={() => activeTab() === "tree"}
                  currentNodeId={() => props.steps()[stepIndex()]?.currentNodeId}
                  fullscreen={treeFullscreen}
                  setFullscreen={setTreeFullscreen}
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
              class="mt-0 flex-1 overflow-hidden rounded-r-lg bg-primary-900"
            >
              <CardContent
                ref={logsContainerRef}
                class="flex h-full w-full flex-col items-start justify-start gap-0 overflow-y-auto rounded-r-lg p-4"
              >
                <Show
                  when={logs().length !== 0}
                  fallback={
                    <div class="flex h-full w-full flex-1 flex-col items-center justify-center">
                      <TerminalIcon class="size-24 text-primary-700" />
                      <span class="text-sm font-medium text-primary-600">No logs yet</span>
                    </div>
                  }
                >
                  <For each={logs()}>
                    {(log: string, index: Accessor<number>) => (
                      <p
                        class="w-full text-left text-xs leading-tight break-words whitespace-pre-wrap"
                        classList={{
                          "text-green-300 font-bold": log.startsWith("[Accept]"),
                          "text-red-300": log.startsWith("[Error]"),
                          "text-primary-300": log.startsWith("[Match]"),
                          "text-primary-400": log.startsWith("[Expand]"),
                        }}
                      >
                        <span class="mr-4 ml-2 font-mono text-sm text-primary-500 select-none">
                          {String(index() + 1).padStart(padWidth(), " ")}
                        </span>
                        {log}
                      </p>
                    )}
                  </For>
                </Show>
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
        treeFullscreen={treeFullscreen}
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
