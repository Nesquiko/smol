import { NON_TERMINALS, PARSE_TABLE, RULES } from "~/lib/parsing/transition-table";
import {
  Dollar,
  NonTerminal,
  ParserAction,
  ParserStep,
  ParseTreeNode,
  Result,
  Token,
  TokenType,
} from "~/lib/types";

let _nodeId: number = 0;

const mkNode = (
  data: Token | NonTerminal | TokenType | Dollar,
  visited: boolean = false,
  children: Array<ParseTreeNode> = [],
): ParseTreeNode => ({
  id: String(_nodeId++),
  data,
  visited,
  children,
});

const cloneTree = (node: ParseTreeNode): ParseTreeNode => {
  return {
    id: node.id,
    data: typeof node.data === "object" ? { ...node.data } : node.data,
    visited: node.visited,
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

  const nodeStack: ParseTreeNode[] = [mkNode("$"), root];

  const snap = (log: string, action: ParserAction, currentNode?: ParseTreeNode): ParserStep => ({
    stack: [...symStack],
    bufferIndex,
    tree: cloneTree(root),
    log,
    action,
    currentTokenIndex: Math.min(bufferIndex, tokens.length - 1),
    currentNodeId: currentNode?.id,
  });

  steps.push(snap("Parser initialized. Starting symbol: program", { kind: "init" }));

  let safetyLimit = 5000;

  while (symStack.length > 0 && safetyLimit-- > 0) {
    const top = symStack[symStack.length - 1];
    const lookahead = input[bufferIndex];

    if (top === "$") {
      if (lookahead.type === "$") {
        steps.push(snap("Accept - input fully consumed.", { kind: "accept" }));

        onResult("correct");
      } else {
        steps.push(
          snap(
            `Error - expected end of input, got '${lookahead.type}'.`,
            { kind: "error", errorMessage: "Unexpected token at end" },
            nodeStack[nodeStack.length - 1],
          ),
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
        matchedNode.visited = true;
        bufferIndex++;
        steps.push(
          snap(
            `Match  ${top} = "${lookahead.value}"  (line ${lookahead.line}, col ${lookahead.colStart})`,
            { kind: "match", symbol: top, tokenValue: lookahead.value },
            matchedNode,
          ),
        );
      } else {
        steps.push(
          snap(
            `Error - expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${lookahead.line}:${lookahead.colStart}.`,
            { kind: "error", errorMessage: `Expected ${top}` },
            nodeStack[nodeStack.length - 1],
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
            `Error - no rule for (${top}, ${lookahead.type}) at line ${lookahead.line}:${lookahead.colStart}.`,
            { kind: "error", errorMessage: `No rule for (${top}, ${lookahead.type})` },
            nodeStack[nodeStack.length - 1],
          ),
        );

        onResult("incorrect");
        break;
      }

      const rule = RULES[ruleNum];
      symStack.pop();
      const parentNode = nodeStack.pop()!;

      if (rule.rhs.length === 0) {
        const epsNode: ParseTreeNode = mkNode("ε", true);
        parentNode.children = [epsNode];
        parentNode.visited = true;

        steps.push(
          snap(
            `Expand  ${top} → ε  (rule ${ruleNum}, lookahead: ${lookahead.type})`,
            { kind: "expand", ruleNumber: ruleNum, symbol: top },
            parentNode,
          ),
        );
      } else {
        const childNodes = rule.rhs.map((sym) => mkNode(sym));
        parentNode.children = childNodes;
        parentNode.visited = true;

        for (let i: number = rule.rhs.length - 1; i >= 0; i--) {
          symStack.push(rule.rhs[i]);
          nodeStack.push(childNodes[i]);
        }

        steps.push(
          snap(
            `Expand  ${top} → ${rule.rhs.join(" ")}  (rule ${ruleNum}, lookahead: ${lookahead.type})`,
            { kind: "expand", ruleNumber: ruleNum, symbol: top },
            parentNode,
          ),
        );
      }
    }
  }

  if (safetyLimit <= 0) {
    steps.push(
      snap(
        "Error - exceeded step limit. Possible infinite loop in grammar.",
        { kind: "error", errorMessage: "Step limit exceeded" },
        nodeStack[nodeStack.length - 1],
      ),
    );

    onResult("incorrect");
  }

  return steps;
}
