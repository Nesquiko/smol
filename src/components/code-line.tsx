import {Token} from "~/components/home";
import {Accessor, Component} from "solid-js";
import {formatLineNumber} from "~/lib/ui-utils";

interface CodeLineProps {
  line: string;
  lineNum: number;
  totalLines: number;
  tokens: Accessor<Array<Token>>;
}

export const CodeLine: Component<CodeLineProps> = (props: CodeLineProps) => {
  const lineTokens = () => props.tokens().filter(
    (t: Token): boolean => t.line === props.lineNum,
  );

  const renderLine = () => {
    if (lineTokens().length === 0) return props.line;

    const sorted: Array<Token> = lineTokens().sort(
      (a: Token, b: Token): number => a.colStart - b.colStart
    );
    const parts = [];
    let lastEnd: number = 0;

    sorted.forEach((token: Token) => {
      if (token.colStart > lastEnd) {
        parts.push(
          props.line.slice(lastEnd, token.colStart)
        );
      }
      parts.push(
        <span class="bg-yellow-300 text-black inline">
          {props.line.slice(token.colStart, token.colEnd)}
        </span>
      );
      lastEnd = token.colEnd;
    });

    if (lastEnd < props.line.length) {
      parts.push(props.line.slice(lastEnd));
    }

    return parts;
  };

  return (
    <div>
      <span class="text-primary-600 mr-6 user-select-none">
        {formatLineNumber(props.lineNum, props.totalLines)}
      </span>
      {renderLine()}
      {lineTokens()?.[0]?.type ?? ""}
    </div>
  );
};