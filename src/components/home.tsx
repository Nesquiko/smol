import { Accessor, createMemo, createSignal, Match, Switch } from "solid-js";

import { SyntaxParser } from "~/lib/parsing/syntax-parser";
import {
  Screen,
  SyntaxParserStep,
  Result,
  Token,
  SyntaxErrorMode,
  LexErrorMode,
} from "~/lib/types";
import { InputScreen } from "~/screens/input-screen";
import { LexConfigScreen } from "~/screens/lex-config-screen";
import { LexScreen } from "~/screens/lex-screen";
import { ResultsScreen } from "~/screens/results-screen";
import { SyntaxConfigScreen } from "~/screens/syntax-config-screen";
import { SyntaxScreen } from "~/screens/syntax-screen";

export const Home = () => {
  const [currentPage, setCurrentPage] = createSignal<Screen>("input");
  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  const [lexErrorMode, setLexErrorMode] = createSignal<LexErrorMode | undefined>(undefined);
  const [syntaxErrorMode, setSyntaxErrorMode] = createSignal<SyntaxErrorMode | undefined>(
    undefined,
  );
  const [tokens, setTokens] = createSignal<Array<Token>>([]);
  const [result, setResult] = createSignal<Result>("unknown");

  const onResult = (res: Result) => {
    setResult(res);
  };

  const syntaxParserSteps: Accessor<Array<SyntaxParserStep>> = createMemo(
    (): Array<SyntaxParserStep> => new SyntaxParser(tokens(), onResult, syntaxErrorMode).parse(),
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
              setTokens={setTokens}
              lexErrorMode={lexErrorMode}
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
              lexErrorMode={lexErrorMode}
              syntaxErrorMode={syntaxErrorMode}
              onBack={() => setCurrentPage("syntax")}
            />
          </Match>
        </Switch>
      </main>
    </div>
  );
};
