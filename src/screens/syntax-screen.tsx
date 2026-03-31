// screens/syntax-screen.tsx

import TreePineIcon from "lucide-solid/icons/tree-pine";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  For,
} from "solid-js";
import { ParseTree } from "~/components/parse-tree";
import { Stack } from "~/components/stack";
import { SyntaxControls } from "~/components/syntax-controls";
import {
  FlyingToken,
  TokenFlyAnimation,
} from "~/components/token-fly-animation";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { LOGS_EXAMPLE } from "~/lib/data/examples";
import { TREE_TEST_SMALL } from "~/lib/data/test-data";
import { BufferType, ParseTreeNode, StackType, Token } from "~/lib/types";

interface SyntaxScreenProps {
  tokens: Accessor<Array<Token>>;
  onContinue: () => void;
  onBack: () => void;
}

let flyId = 0;

export const SyntaxScreen: Component<SyntaxScreenProps> = (props) => {
  const [buffer, setBuffer] = createSignal<BufferType>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(TREE_TEST_SMALL);
  const [stack, setStack] = createSignal<StackType>(["$"]);
  const [flyingTokens, setFlyingTokens] = createSignal<Array<FlyingToken>>([]);

  let stackCardRef: HTMLDivElement | undefined;
  let logsContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (logsContainerRef) {
      logsContainerRef.scrollTop = logsContainerRef.scrollHeight;
    }
  });

  const handleFlyToken = (fromRect: DOMRect, label: string) => {
    if (!stackCardRef) return;

    const stackRect = stackCardRef.getBoundingClientRect();

    // Target: top of the stack card, same width as a stack item cell
    // Stack items have w-24 card with p-[2px] padding, inner div fills it
    const itemHeight = 20; // approximate px height of one stack row
    const toRect = new DOMRect(
      stackRect.left + 2,       // p-[2px] padding
      stackRect.top,            // fly to the top of the card
      stackRect.width - 4,      // account for padding on both sides
      itemHeight,
    );

    const id = flyId++;
    setFlyingTokens((prev) => [...prev, { id, label, fromRect, toRect }]);
  };

  const handleFlyComplete = (id: number) => {
    setFlyingTokens((prev) => prev.filter((ft) => ft.id !== id));
  };

  return (
    <div class="relative flex h-screen w-full flex-col items-center justify-center gap-6">
      <TokenFlyAnimation
        flyingTokens={flyingTokens}
        onComplete={handleFlyComplete}
      />

      <div class="flex min-h-0 w-full max-w-5xl flex-1 flex-row items-stretch justify-center gap-6 p-6 pb-0">
        <Card class="relative flex h-full w-full flex-1 items-center justify-center p-0">
          <Tabs defaultValue="tree" class="flex h-full w-full flex-col">
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

            <TabsContent
              value="tree"
              class="mt-0 flex-1 rounded-b-lg bg-primary-900"
            >
              <CardContent class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-b-lg p-0">
                <ParseTree tree={tree} class="z-20" />
                <TreePineIcon class="absolute top-1/2 left-1/2 z-10 size-24 -translate-x-1/2 -translate-y-1/2 text-primary-800/50" />
              </CardContent>
            </TabsContent>

            <TabsContent
              value="logs"
              class="mt-0 flex-1 overflow-hidden rounded-b-lg bg-primary-900"
            >
              <CardContent
                ref={logsContainerRef}
                class="flex h-full w-full flex-col items-start justify-start gap-0 overflow-y-auto rounded-b-lg p-2 px-4"
              >
                <For each={LOGS_EXAMPLE}>
                  {(log: string) => (
                    <p class="w-full break-words whitespace-pre-wrap text-left text-xs leading-tight">
                      {log}
                    </p>
                  )}
                </For>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <Stack
          stack={stack}
          cardRef={(el) => (stackCardRef = el)}
        />
      </div>

      <SyntaxControls
        tokens={props.tokens}
        buffer={buffer}
        setBuffer={setBuffer}
        setTree={setTree}
        setStack={setStack}
        withNavigation={true}
        onBack={props.onBack}
        onContinue={props.onContinue}
        onFlyToken={handleFlyToken}
      />
    </div>
  );
};