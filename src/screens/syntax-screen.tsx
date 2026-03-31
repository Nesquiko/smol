import TreePineIcon from "lucide-solid/icons/tree-pine";
import {Accessor, Component, createEffect, createSignal, For} from "solid-js";
import { ParseTree } from "~/components/parse-tree";
import { Stack } from "~/components/stack";
import { SyntaxControls } from "~/components/syntax-controls";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { LOGS_EXAMPLE } from "~/lib/data/examples";
import { TREE_TEST_SMALL } from "~/lib/data/test-data";
import {BufferType, ParseTreeNode, StackType, Token} from "~/lib/types";

interface SyntaxScreenProps {
  tokens: Accessor<Array<Token>>;
  onContinue: () => void;
  onBack: () => void;
}

export const SyntaxScreen: Component<SyntaxScreenProps> = (props: SyntaxScreenProps) => {
  const [buffer, setBuffer] = createSignal<BufferType>([]);
  const [tree, setTree] = createSignal<ParseTreeNode>(TREE_TEST_SMALL);
  const [stack, setStack] = createSignal<StackType>(["$"]);

  let logsContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    //LOGS_EXAMPLE;
    if (logsContainerRef) {
      logsContainerRef.scrollTop = logsContainerRef.scrollHeight;
    }
  });

  return (
    <div class="relative flex h-screen w-full flex-col items-center justify-center gap-6">
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

            <TabsContent value="tree" class="mt-0 flex-1 rounded-b-lg bg-primary-900">
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
                    <p class="w-full text-left text-xs leading-tight break-words whitespace-pre-wrap">
                      {log}
                    </p>
                  )}
                </For>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <Stack stack={stack} />
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
      />
    </div>
  );
};
