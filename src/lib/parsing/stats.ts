import { LexErrorRecovery } from "~/lib/lexer";
import { SyntaxParserStep, Token } from "~/lib/types";

export type LexStats = {
  totalTokens: number;
  lines: number;
  uniqueTokenTypes: number;
  mostFrequentType: string;
  tokenTypeFrequency: Array<{ name: string; value: number }>;

  errors: LexErrorStats;
};

type LexErrorStats = { count: number; skipped: number; added: Array<string> };

export interface SyntaxStats {
  totalSteps: number;
  expansions: number;
  matches: number;
  uniqueRulesApplied: number;
  maxStackDepth: number;
  errors: number;
  stepBreakdown: Array<{ name: string; value: number; fill: string }>;
  recoveries: number;
  tokensSkipped: number;
  tokensInserted: number;
}

export const computeLexStats = (
  tokens: Array<Token>,
  lexErrorRecoveries: Array<LexErrorRecovery>,
): LexStats => {
  const freq: Record<string, number> = {};
  let maxLine: number = 0;
  const errors = { count: 0, skipped: 0, added: new Array<string>() };

  for (const token of tokens) {
    freq[token.type] = (freq[token.type] ?? 0) + 1;
    if (token.line > maxLine) maxLine = token.line;
  }

  const sorted: Array<[string, number]> = Object.entries(freq).sort(
    (a: [string, number], b: [string, number]): number => b[1] - a[1],
  );
  const mostFrequentType: string = sorted[0]?.[0] ?? "—";
  const tokenTypeFrequency: Array<{ name: string; value: number }> = sorted
    .slice(0, 5)
    .map(([name, value]: [string, number]): { name: string; value: number } => ({ name, value }));

  errors.count = lexErrorRecoveries.length;
  for (const lexErr of lexErrorRecoveries) {
    switch (lexErr.mode) {
      case "skip-until-found":
        errors.skipped += lexErr.skippedChars;
        break;
      case "add-missing":
        errors.added.push(lexErr.added);
        break;
    }
  }

  return {
    totalTokens: tokens.length,
    lines: maxLine,
    uniqueTokenTypes: Object.keys(freq).length,
    mostFrequentType,
    tokenTypeFrequency,
    errors,
  };
};

export const computeSyntaxStats = (steps: Array<SyntaxParserStep>): SyntaxStats => {
  const rulesApplied = new Set<number>();
  let expansions: number = 0;
  let matches: number = 0;
  let errors: number = 0;
  let maxStackDepth: number = 0;
  let recoveries: number = 0;
  let tokensSkipped: number = 0;
  let tokensInserted: number = 0;

  for (const step of steps) {
    if (step.stack.length > maxStackDepth) maxStackDepth = step.stack.length;
    switch (step.action.type) {
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
      case "skip":
        tokensSkipped++;
        break;
      case "recover":
        recoveries++;
        if (step.action.strategy === "add-missing") tokensInserted++;
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
    recoveries,
    tokensSkipped,
    tokensInserted,
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
      ...(errors > 0 ? [{ name: "Errors", value: errors, fill: "#fca5a5" }] : []),
      ...(tokensSkipped > 0 ? [{ name: "Skipped", value: tokensSkipped, fill: "#fdba74" }] : []),
      ...(tokensInserted > 0 ? [{ name: "Inserted", value: tokensInserted, fill: "#fef08a" }] : []),
      ...(recoveries > 0 ? [{ name: "Recoveries", value: recoveries, fill: "#86efac" }] : []),
    ],
  };
};
