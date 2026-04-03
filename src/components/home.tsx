import { Accessor, createMemo, createSignal, Match, Switch } from "solid-js";

import { TOKENS_TEST } from "~/lib/data/test-data";
import { buildParserSteps } from "~/lib/parsing/ll1-engine";
import {Screen, ParserStep, Result, Token, SyntaxErrorMode, LexErrorMode} from "~/lib/types";
import { InputScreen } from "~/screens/input-screen";
import { LexScreen } from "~/screens/lex-screen";
import { ResultsScreen } from "~/screens/results-screen";
import { SyntaxScreen } from "~/screens/syntax-screen";
import {LexConfigScreen} from "~/screens/lex-config-screen";
import {SyntaxConfigScreen} from "~/screens/syntax-config-screen";

export const Home = () => {
  const [currentPage, setCurrentPage] = createSignal<Screen>("input");
  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  const [lexErrorMode, setLexErrorMode] = createSignal<LexErrorMode | undefined>(undefined);
  const [syntaxErrorMode, setSyntaxErrorMode] = createSignal<SyntaxErrorMode | undefined>(undefined);
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [tokens, setTokens] = createSignal<Array<Token>>(TOKENS_TEST);
  const [result, setResult] = createSignal<Result>("unknown");

  const onResult = (res: Result) => {
    setResult(res);
  };

  const syntaxParserSteps: Accessor<Array<ParserStep>> = createMemo(
    (): Array<ParserStep> => buildParserSteps(tokens(), onResult),
  );

  return (
    <div class="flex min-h-screen w-full flex-1 items-center justify-center">
      <main class="flex w-full flex-col items-center justify-center">
        <Switch>
          <Match when={currentPage() === "input"}>
            <InputScreen
              fileContent={fileContent}
              setFileContent={setFileContent}
              onContinue={() => setCurrentPage("lex-config")}
            />
          </Match>

          <Match when={currentPage() === "lex-config"}>
            <LexConfigScreen
              lexErrorMode={lexErrorMode}
              setLexErrorMode={setLexErrorMode}
              onContinue={() => setCurrentPage("lex")}
              onBack={() => setCurrentPage("input")}
            />
          </Match>

          <Match when={currentPage() === "lex"}>
            <LexScreen
              fileContent={fileContent}
              tokens={tokens}
              onContinue={() => setCurrentPage("syntax-config")}
              onBack={() => setCurrentPage("lex-config")}
            />
          </Match>

          <Match when={currentPage() === "syntax-config"}>
            <SyntaxConfigScreen
              syntaxErrorMode={syntaxErrorMode}
              setSyntaxErrorMode={setSyntaxErrorMode}
              onContinue={() => setCurrentPage("syntax")}
              onBack={() => setCurrentPage("lex")}
            />
          </Match>

          <Match when={currentPage() === "syntax"}>
            <SyntaxScreen
              tokens={tokens}
              steps={syntaxParserSteps}
              onContinue={() => setCurrentPage("results")}
              onBack={() => setCurrentPage("syntax-config")}
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
