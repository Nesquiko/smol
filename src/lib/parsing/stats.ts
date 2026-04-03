import { ParserStep, Token } from "~/lib/types";

export type LexStats = {
  totalTokens: number;
  lines: number;
  uniqueTokenTypes: number;
  mostFrequentType: string;
  tokenTypeFrequency: Array<{ name: string; value: number }>;
};

export type SyntaxStats = {
  totalSteps: number;
  expansions: number;
  matches: number;
  errors: number;
  uniqueRulesApplied: number;
  maxStackDepth: number;
  accepted: boolean;
  stepBreakdown: Array<{ name: string; value: number; fill: string }>;
};

export const computeLexStats = (tokens: Array<Token>): LexStats => {
  const freq: Record<string, number> = {};
  let maxLine = 0;

  for (const token of tokens) {
    freq[token.type] = (freq[token.type] ?? 0) + 1;
    if (token.line > maxLine) maxLine = token.line;
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const mostFrequentType = sorted[0]?.[0] ?? "—";
  const tokenTypeFrequency = sorted.slice(0, 5).map(([name, value]) => ({ name, value }));

  return {
    totalTokens: tokens.length,
    lines: maxLine,
    uniqueTokenTypes: Object.keys(freq).length,
    mostFrequentType,
    tokenTypeFrequency,
  };
};

export const computeSyntaxStats = (steps: Array<ParserStep>): SyntaxStats => {
  const rulesApplied = new Set<number>();
  let expansions = 0;
  let matches = 0;
  let errors = 0;
  let maxStackDepth = 0;
  let accepted = false;

  for (const step of steps) {
    if (step.stack.length > maxStackDepth) maxStackDepth = step.stack.length;
    switch (step.action.kind) {
      case "expand":
        expansions++;
        if (step.action.ruleNumber !== undefined) rulesApplied.add(step.action.ruleNumber);
        break;
      case "match":
        matches++;
        break;
      case "error":
        errors++;
        break;
      case "accept":
        accepted = true;
        break;
    }
  }

  return {
    totalSteps: steps.length,
    expansions,
    matches,
    errors,
    uniqueRulesApplied: rulesApplied.size,
    maxStackDepth,
    accepted,
    stepBreakdown: [
      {
        name: "Expansions",
        value: expansions,
        fill: "#737373",
      },
      {
        name: "Matches",
        value: matches,
        fill: "#d4d4d4",
      },
      ...(errors > 0
        ? [
            {
              name: "Errors",
              value: errors,
              fill: "#fca5a5",
            },
          ]
        : []),
    ],
  };
};
