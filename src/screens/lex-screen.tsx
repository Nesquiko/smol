import {Accessor, Component, createSignal, For, Show} from "solid-js";
import {Card, CardContent} from "~/components/ui/card";
import {CodeLine} from "~/components/code-line";
import {Button} from "~/components/ui/button";
import {Token} from "~/lib/types";
import {ChevronLeftIcon, ChevronRightIcon, IdCardIcon} from "lucide-solid";

interface LexScreenProps {
  fileContent: Accessor<string | undefined>;
  tokens: Accessor<Array<Token>>;
  onContinue: () => void;
  onBack: () => void;
}

export const LexScreen: Component<LexScreenProps> = (props: LexScreenProps) => {
  const [hoveredToken, setHoveredToken] = createSignal<Token | undefined>(undefined);

  return (
    <Show when={props.fileContent()}>
      {(content: Accessor<string>) => {
        const lines = (): Array<string> => content().split('\n');
        const totalLines = (): number => lines().length;

        return (
          <div class="flex flex-col items-center justify-center gap-6 w-full h-screen">
            <div class="flex flex-row items-center justify-center gap-6 w-full p-6 pb-0 flex-1 min-h-0">
              <Card class="flex flex-1 items-start justify-start w-full h-full">
                <CardContent
                  class="pt-6 h-full overflow-y-auto font-mono text-sm w-full"
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
                  <For each={props.tokens()}>
                    {(token: Token) => (
                      <div
                        class="text-sm flex flex-row items-center justify-start font-medium hover:bg-primary-700 rounded-md px-1"
                        onMouseEnter={() => setHoveredToken(token)}
                        onMouseLeave={() => setHoveredToken(undefined)}
                      >
                        <IdCardIcon class="size-4 text-primary-400 mr-1"/>
                        {token.type}
                      </div>
                    )}
                  </For>
                </CardContent>
              </Card>
            </div>

            <div class="flex flex-row items-center justify-between gap-6 w-full p-6 pt-0">
              <Button
                variant="ghost"
                size="default"
                class="cursor-pointer"
                onClick={props.onBack}
              >
                <ChevronLeftIcon/>
                File input
              </Button>

              <Button
                variant="ghost"
                size="default"
                class="cursor-pointer"
                onClick={props.onContinue}
              >
                Syntax analysis
                <ChevronRightIcon/>
              </Button>
            </div>
          </div>
        );
      }}
    </Show>
  );
};