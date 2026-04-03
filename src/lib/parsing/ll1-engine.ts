/*import { NON_TERMINALS, PARSE_TABLE, RULES } from "~/lib/parsing/transition-table";
import {
  Dollar,
  NonTerminal,
  SyntaxParserAction,
  SyntaxParserStep,
  ParseTreeNode,
  Result,
  Token,
  TokenType,
} from "~/lib/types";

let _nodeId: number = 0;

const mkNode = (
  data: Token | NonTerminal | TokenType | Dollar,
  processed: boolean = false,
  children: Array<ParseTreeNode> = [],
): ParseTreeNode => ({
  id: String(_nodeId++),
  data,
  processed: processed,
  children,
});

const cloneTree = (node: ParseTreeNode): ParseTreeNode => {
  return {
    id: node.id,
    data: typeof node.data === "object" ? { ...node.data } : node.data,
    processed: node.processed,
    children: node.children?.map(cloneTree),
  };
};

export function buildParserSteps(
  tokens: Array<Token>,
  onResult: (result: Result) => void,
): Array<SyntaxParserStep> {
  _nodeId = 0;
  const steps: SyntaxParserStep[] = [];

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

  const snap = (log: string, action: SyntaxParserAction, currentNode?: ParseTreeNode): SyntaxParserStep => ({
    stack: [...symStack],
    bufferIndex,
    tree: cloneTree(root),
    log,
    action,
    currentTokenIndex: Math.min(bufferIndex, tokens.length - 1),
    currentNodeId: currentNode?.id,
  });

  steps.push(snap("Parser initialized. Starting symbol: program", { type: "init" }));

  let safetyLimit = 5000;

  while (symStack.length > 0 && safetyLimit-- > 0) {
    const top = symStack[symStack.length - 1];
    const lookahead = input[bufferIndex];

    if (top === "$") {
      if (lookahead.type === "$") {
        steps.push(snap("Accept - input fully consumed.", { type: "accept" }));

        onResult("correct");
      } else {
        steps.push(
          snap(
            `Error - expected end of input, got '${lookahead.type}'.`,
            { type: "error", errorMessage: "Unexpected token at end" },
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
        matchedNode.processed = true;
        bufferIndex++;
        steps.push(
          snap(
            `Match  ${top} = "${lookahead.value}"  (line ${lookahead.line}, col ${lookahead.colStart})`,
            { type: "match", symbol: top, tokenValue: lookahead.value },
            matchedNode,
          ),
        );
      } else {
        steps.push(
          snap(
            `Error - expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${lookahead.line}:${lookahead.colStart}.`,
            { type: "error", errorMessage: `Expected ${top}` },
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
            { type: "error", errorMessage: `No rule for (${top}, ${lookahead.type})` },
            nodeStack[nodeStack.length - 1],
          ),
        );

        onResult("incorrect");
        break;
      }

      const rule = RULES[ruleNum];
      symStack.pop();
      const parentNode = nodeStack.pop()!;

      if (rule.right.length === 0) {
        const epsNode: ParseTreeNode = mkNode("ε", true);
        parentNode.children = [epsNode];
        parentNode.processed = true;

        steps.push(
          snap(
            `Expand  ${top} → ε  (rule ${ruleNum}, lookahead: ${lookahead.type})`,
            { type: "expand", ruleNumber: ruleNum, symbol: top },
            parentNode,
          ),
        );
      } else {
        const childNodes = rule.right.map((sym) => mkNode(sym));
        parentNode.children = childNodes;
        parentNode.processed = true;

        for (let i: number = rule.right.length - 1; i >= 0; i--) {
          symStack.push(rule.right[i]);
          nodeStack.push(childNodes[i]);
        }

        steps.push(
          snap(
            `Expand  ${top} → ${rule.right.join(" ")}  (rule ${ruleNum}, lookahead: ${lookahead.type})`,
            { type: "expand", ruleNumber: ruleNum, symbol: top },
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
        { type: "error", errorMessage: "Step limit exceeded" },
        nodeStack[nodeStack.length - 1],
      ),
    );

    onResult("incorrect");
  }

  return steps;
}
*/
