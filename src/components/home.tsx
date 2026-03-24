import {InputCommand} from "~/components/input-command";
import {Accessor, createSignal, For, Show} from "solid-js";
import {Card, CardContent} from "~/components/ui/card";
import {formatLineNumber} from "~/lib/ui-utils";
import {CodeLine} from "~/components/code-line";

export type Token = {
  type: string;
  line: number;
  colStart: number;
  colEnd: number;
};

export const Home = () => {
  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  const [tokens, setTokens] = createSignal<Array<Token>>([
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
  ] satisfies Array<Token>);
  const [hoveredToken, setHoveredToken] = createSignal<Token | undefined>(undefined);

  return (
    <div class="flex flex-1 min-h-screen w-full items-center justify-center">
      <main class="flex flex-col w-full items-center justify-center">
        <Show when={fileContent()} fallback={(
          <div class="flex items-center justify-center max-w-md w-full">
            <InputCommand setFileContent={setFileContent} />
          </div>
        )}>
          {(content: Accessor<string>) => {
            const lines = () => content().split('\n');
            const totalLines = () => lines().length;

            return (
              <div class="flex flex-row items-center justify-center gap-6 w-full h-screen p-6">
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
                          class="font-medium hover:bg-red-100"
                          onMouseEnter={() => setHoveredToken(token)}
                          onMouseLeave={() => setHoveredToken(undefined)}
                        >
                          {token.type}
                        </span>
                      )}
                    </For>
                    <div>{hoveredToken()?.type}</div>
                  </CardContent>
                </Card>
              </div>
            );
          }}
        </Show>
      </main>
    </div>
  );
};