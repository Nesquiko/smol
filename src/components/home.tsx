import {createSignal, Match, Switch} from "solid-js";
import {InputScreen} from "~/screens/input-screen";
import {LexScreen} from "~/screens/lex-screen";
import {TOKENS_TEST} from "~/lib/data/test-data";
import {Page, Result, Token} from "~/lib/types";
import {SyntaxScreen} from "~/screens/syntax-screen";
import {ResultsScreen} from "~/screens/results-screen";

export const Home = () => {
  const [currentPage, setCurrentPage] = createSignal<Page>("input");
  const [fileContent, setFileContent] = createSignal<string | undefined>(undefined);
  const [tokens, setTokens] = createSignal<Array<Token>>(TOKENS_TEST);
  const [result, setResult] = createSignal<Result>("could-not-determine");

  const onInput = (text: string) => {
    setFileContent(text);
    setCurrentPage("lex");
  };

  return (
    <div class="flex flex-1 min-h-screen w-full items-center justify-center">
      <main class="flex flex-col w-full items-center justify-center">
        <Switch>
          <Match when={currentPage() === "input"}>
            <InputScreen onInput={onInput}/>
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
              onContinue={() => setCurrentPage("results")}
              onBack={() => setCurrentPage("lex")}
            />
          </Match>

          <Match when={currentPage() === "results"}>
            <ResultsScreen
              result={result}
              onBack={() => setCurrentPage("syntax")}
            />
          </Match>
        </Switch>
      </main>
    </div>
  );
};