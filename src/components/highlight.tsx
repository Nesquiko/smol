import {Token} from "~/components/home";

export const highlightToken = (
  content: string,
  token: Token,
) => {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    if (idx === token.line - 1) {
      const before = line.slice(0, token.colStart);
      const highlighted = line.slice(token.colStart, token.colEnd);
      const after = line.slice(token.colEnd);
      return (
        <>
          {before}
          <span class="bg-yellow-300 text-black inline-block">
            {highlighted}
          </span>
          {after}
          {idx < lines.length - 1 && '\n'}
        </>
      );
    }
    return (
      <>
        {line}
        {idx < lines.length - 1 && '\n'}
      </>
    );
  });
};