import {Accessor, createMemo, createSignal, Match, Switch} from "solid-js";

import { TOKENS_TEST } from "~/lib/data/test-data";
import {Page, ParserStep, Result, Token} from "~/lib/types";
import { InputScreen } from "~/screens/input-screen";
import { LexScreen } from "~/screens/lex-screen";
import { ResultsScreen } from "~/screens/results-screen";
import { SyntaxScreen } from "~/screens/syntax-screen";
import {buildParserSteps} from "~/lib/parsing/ll1-engine";

export const Home = () => {
  const [currentPage, setCurrentPage] = createSignal<Page>("input");
  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [tokens, setTokens] = createSignal<Array<Token>>(TOKENS_TEST);
  const [result, setResult] = createSignal<Result>("unknown");

  const onInput = (text: string) => {
    setFileContent(text);
    setCurrentPage("lex");
  };

  const onResult = (res: Result) => {
    setResult(res);
  };

  const syntaxParserSteps: Accessor<Array<ParserStep>> = createMemo(
    (): Array<ParserStep> => buildParserSteps(
      tokens(),
      onResult,
    ),
  );

  return (
    <div class="flex min-h-screen w-full flex-1 items-center justify-center">
      <main class="flex w-full flex-col items-center justify-center">
        <Switch>
          <Match when={currentPage() === "input"}>
            <InputScreen onInput={onInput} />
          </Match>

          <Match when={currentPage() === "lex"}>
            <LexScreen
              fileContent={fileContent}
              tokens={tokens}
              onContinue={() => setCurrentPage("syntax")}
              onBack={() => setCurrentPage("input")}
            />
          </Match>

          <Match when={currentPage() === "syntax"}>
            <SyntaxScreen
              tokens={tokens}
              steps={syntaxParserSteps}
              onContinue={() => setCurrentPage("results")}
              onBack={() => setCurrentPage("lex")}
            />
          </Match>

          <Match when={currentPage() === "results"}>
            <ResultsScreen
              result={result}
              tokens={tokens}
              steps={syntaxParserSteps}
              onBack={() => setCurrentPage("syntax")}
            />
          </Match>
        </Switch>
      </main>
    </div>
  );
};
