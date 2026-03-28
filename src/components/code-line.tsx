import { Accessor, Component, JSXElement } from "solid-js";

import { Caret, Token } from "~/lib/types";
import { formatLineNumber } from "~/lib/ui-utils";

interface CodeLineProps {
  line: string;
  lineNum: Accessor<number>;
  totalLines: Accessor<number>;
  tokens: Accessor<Array<Token>>;
  caret: Accessor<Caret>;
}

export const CodeLine: Component<CodeLineProps> = (props: CodeLineProps) => {
  const lineTokens = (): Array<Token> =>
    props.tokens().filter((t: Token): boolean => t.line === props.lineNum());

  const isSomethingHovered = (): boolean => props.tokens().length > 0;
  const isHighlighted = (): boolean => lineTokens().length > 0;

  const renderLine = (): Array<JSXElement> => {
    const chars = props.line.split("");
    const tokens = lineTokens();

    const result = chars.map((char, i) => {
      const isCaret = props.caret().line === props.lineNum() && props.caret().col === i;

      const token = tokens.find((t) => i >= t.colStart && i < t.colEnd);

      const isInToken = !!token;
      const isStart = token && i === token.colStart;
      const isEnd = token && i === token.colEnd - 1;

      return (
        <span
          class="transition-colors duration-100"
          classList={{
            // rounded edges ONLY on boundaries
            "rounded-l-xs": isStart,
            "rounded-r-xs": isEnd,

            // caret overrides everything
            "bg-primary-200 text-primary-900 animate-[blink_1s_step-end_infinite]":
              isCaret && !isInToken,

            // token highlight
            "bg-yellow-200 text-black": isInToken,
          }}
        >
          {char}
        </span>
      );
    });

    // ✅ handle caret at END separately
    const caretAtEnd =
      props.caret().line === props.lineNum() && props.caret().col === props.line.length;

    if (caretAtEnd) {
      result.push(
        <span class="inline-block h-full w-[0.6ch] animate-[blink_1s_step-end_infinite] bg-primary-400" />,
      );
    }

    return result;
  };

  return (
    <div
      class="flex h-6 items-center transition-all duration-300"
      classList={{
        "opacity-30": isSomethingHovered() && !isHighlighted(),
      }}
    >
      <span class="user-select-none mr-6 text-primary-600">
        {formatLineNumber(props.lineNum(), props.totalLines())}
      </span>
      <span>{renderLine()}</span>
    </div>
  );
};
