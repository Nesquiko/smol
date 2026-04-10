// code-line.tsx
import { Accessor, Component, JSXElement, Show } from "solid-js";

import { LexError } from "~/lib/lexer";
import { Caret, Token } from "~/lib/types";
import { formatLineNumber } from "~/lib/ui-utils";

interface CodeLineProps {
  line: string;
  lineNum: Accessor<number>;
  totalLines: Accessor<number>;
  tokens: Accessor<Array<Token>>;
  caret: Accessor<Caret>;
  lexError: Accessor<LexError | undefined>;
}

export const CodeLine: Component<CodeLineProps> = (props: CodeLineProps) => {
  const lineTokens = (): Array<Token> =>
    props.tokens().filter((t: Token): boolean => t.line === props.lineNum());

  const isSomethingHovered = (): boolean => props.tokens().length > 0;
  const isHighlighted = (): boolean => lineTokens().length > 0;

  const isErrorOnThisLine = (): boolean =>
    !!props.lexError() && props.lexError()!.tokenPos?.line === props.lineNum();

  const renderLine = (): Array<JSXElement> => {
    const chars = props.line.split("");
    const tokens = lineTokens();
    const error = props.lexError();

    return chars.map((char, i) => {
      const isCaret = props.caret().line === props.lineNum() && props.caret().col === i;

      const token = tokens.find((t) => i >= t.colStart && i <= t.colEnd);
      const isInToken = !!token;
      const isStart = token && i === token.colStart;
      const isEnd = token && i === token.colEnd;

      const isErrorChar =
        !!error && error.tokenPos?.line === props.lineNum() && error.tokenPos?.tokenStart === i;

      return (
        <span
          class="relative transition-colors duration-100"
          classList={{
            "rounded-l-xs": isStart,
            "rounded-r-xs": isEnd,
            "bg-primary-200 text-primary-900 animate-[blink_1s_step-end_infinite]":
              isCaret && !isInToken && !isErrorChar,
            "bg-yellow-200 text-black": isInToken && !isErrorChar,
            "bg-red-400 text-white rounded-xs": isErrorChar,
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div
      class="flex h-6 w-full items-center rounded-md transition-all duration-300"
      classList={{
        "bg-red-300/10": isErrorOnThisLine(),
        "bg-transparent": !isErrorOnThisLine(),
      }}
    >
      <span class="user-select-none mr-6 text-primary-600">
        {formatLineNumber(props.lineNum(), props.totalLines())}
      </span>
      <span
        class="flex-1"
        classList={{
          "opacity-30": isSomethingHovered() && !isHighlighted(),
        }}
      >
        {renderLine()}
      </span>
      <Show when={isErrorOnThisLine()}>
        <span class="ml-4 flex-shrink-0 text-xs text-red-400">
          Error: Illegal character '{props.lexError()!.error.char}' in state '
          {props.lexError()!.error.stateLabel}'{" "}
        </span>
      </Show>
    </div>
  );
};
