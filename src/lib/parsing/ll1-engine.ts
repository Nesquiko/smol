import { NON_TERMINALS, PARSE_TABLE, RULES } from "~/lib/parsing/transition-table";
import {
  Dollar,
  NonTerminal,
  ParserAction,
  ParserStep,
  ParseTreeNode, Result,
  Token,
  TokenType,
} from "~/lib/types";

let _nodeId = 0;

const mkNode = (
  data: Token | NonTerminal | TokenType | Dollar,
  children: Array<ParseTreeNode> = [],
): ParseTreeNode => ({
  id: String(_nodeId++),
  data,
  children,
});

const cloneTree = (node: ParseTreeNode): ParseTreeNode => {
  return {
    id: node.id,
    data: typeof node.data === "object" ? { ...node.data } : node.data,
    children: node.children?.map(cloneTree),
  };
};

export function buildParserSteps(
  tokens: Array<Token>,
  onResult: (result: Result) => void,
): Array<ParserStep> {
  _nodeId = 0;
  const steps: ParserStep[] = [];

  const EOF_TOKEN: Token = {
    type: "$",
    value: "$",
    line: 0,
    colStart: 0,
    colEnd: 0,
  };
  const input = [...tokens, EOF_TOKEN];

  let bufferIndex = 0;

  const symStack: string[] = ["$", "program"];

  const root = mkNode("program");

  const nodeStack: ParseTreeNode[] = [
    mkNode("$"),
    root,
  ];

  const snap = (log: string, action: ParserAction): ParserStep => ({
    stack: [...symStack],
    bufferIndex,
    tree: cloneTree(root),
    log,
    action,
    currentTokenIndex: Math.min(bufferIndex, tokens.length - 1),
  });

  steps.push(snap("Parser initialized. Starting symbol: program", { kind: "init" }));

  let safetyLimit = 5000;

  while (symStack.length > 0 && safetyLimit-- > 0) {
    const top = symStack[symStack.length - 1];
    const lookahead = input[bufferIndex];

    if (top === "$") {
      if (lookahead.type === "$") {
        steps.push(snap("Accept — input fully consumed.", { kind: "accept" }));

        onResult("correct");
      } else {
        steps.push(
          snap(`Error — expected end of input, got '${lookahead.type}'.`, {
            kind: "error",
            errorMessage: "Unexpected token at end",
          }),
        );

        onResult("incorrect");
      }
      break;
    }

    if (!NON_TERMINALS.has(top)) {
      if (top === lookahead.type) {
        symStack.pop();
        const matchedNode = nodeStack.pop()!;
        matchedNode.data = lookahead;
        bufferIndex++;
        steps.push(
          snap(
            `Match  ${top} = "${lookahead.value}"  (line ${lookahead.line}, col ${lookahead.colStart})`,
            { kind: "match", symbol: top, tokenValue: lookahead.value },
          ),
        );
      } else {
        steps.push(
          snap(
            `Error — expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${lookahead.line}:${lookahead.colStart}.`,
            { kind: "error", errorMessage: `Expected ${top}` },
          ),
        );

        onResult("incorrect");
        break;
      }
    } else {
      const ruleNum = PARSE_TABLE[top]?.[lookahead.type];

      if (ruleNum === undefined) {
        steps.push(
          snap(
            `Error — no rule for (${top}, ${lookahead.type}) at line ${lookahead.line}:${lookahead.colStart}.`,
            { kind: "error", errorMessage: `No rule for (${top}, ${lookahead.type})` },
          ),
        );

        onResult("incorrect");
        break;
      }

      const rule = RULES[ruleNum];
      symStack.pop();
      const parentNode = nodeStack.pop()!;

      if (rule.rhs.length === 0) {
        const epsNode = mkNode("ε");
        parentNode.children = [epsNode];
        steps.push(
          snap(`Expand  ${top} → ε  (rule ${ruleNum}, lookahead: ${lookahead.type})`, {
            kind: "expand",
            ruleNumber: ruleNum,
            symbol: top,
          }),
        );
      } else {
        const childNodes = rule.rhs.map((sym) => mkNode(sym));
        parentNode.children = childNodes;

        for (let i = rule.rhs.length - 1; i >= 0; i--) {
          symStack.push(rule.rhs[i]);
          nodeStack.push(childNodes[i]);
        }

        steps.push(
          snap(
            `Expand  ${top} → ${rule.rhs.join(" ")}  (rule ${ruleNum}, lookahead: ${lookahead.type})`,
            { kind: "expand", ruleNumber: ruleNum, symbol: top },
          ),
        );
      }
    }
  }

  if (safetyLimit <= 0) {
    steps.push(
      snap("Error — exceeded step limit. Possible infinite loop in grammar.", {
        kind: "error",
        errorMessage: "Step limit exceeded",
      }),
    );

    onResult("incorrect");
  }

  return steps;
}
