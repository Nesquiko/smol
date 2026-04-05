import { DOLLAR, EOF_TOKEN, EPSILON, PROGRAM, STEP_SAFETY_LIMIT } from "~/lib/data/constants";
import { NON_TERMINALS, PARSE_TABLE, RULES } from "~/lib/parsing/transition-table";
import {
  SyntaxParserStep,
  ParseTreeNode,
  Token,
  Result,
  NonTerminal,
  TokenType,
  Dollar,
  SyntaxParserAction,
  Rule,
  RuleNumber,
} from "~/lib/types";

export class SyntaxParser {
  private nodeId: number = 0;
  private bufferIndex: number = 0;
  private resultReported: boolean = false;

  private symbolStack: Array<string> = [];
  private nodeStack: Array<ParseTreeNode> = [];
  private root!: ParseTreeNode;

  private steps: Array<SyntaxParserStep> = [];
  private input: Array<Token> = [];

  constructor(
    private readonly tokens: Array<Token>,
    private readonly onResult: (result: Result) => void,
  ) {}

  private formatLineWithCol(token: Token): string {
    return `${token.line}:${token.colStart}:${token.colEnd}`;
  }

  private createNode(
    data: Token | NonTerminal | TokenType | Dollar,
    processed = false,
    children: Array<ParseTreeNode> = [],
  ): ParseTreeNode {
    return {
      id: String(this.nodeId++),
      data,
      processed: processed,
      children,
    };
  }

  private cloneTree(node: ParseTreeNode): ParseTreeNode {
    return {
      id: node.id,
      data: typeof node.data === "object" ? { ...node.data } : node.data,
      processed: node.processed,
      children: node.children?.map((child: ParseTreeNode): ParseTreeNode => this.cloneTree(child)),
    };
  }

  private snapshot(
    log: string,
    action: SyntaxParserAction,
    currentNode?: ParseTreeNode,
  ): SyntaxParserStep {
    return {
      stack: [...this.symbolStack],
      bufferIndex: this.bufferIndex,
      tree: this.cloneTree(this.root),
      log,
      action,
      currentTokenIndex: Math.min(this.bufferIndex, this.tokens.length - 1),
      currentNodeId: currentNode?.id,
    };
  }

  private reportResult(result: Result): void {
    if (this.resultReported) return;
    this.resultReported = true;
    this.onResult(result);
  }

  private pushError(message: string, errorMessage: string): void {
    this.steps.push(this.snapshot(message, { type: "error", errorMessage }, this.nodeStack.at(-1)));
    this.reportResult("incorrect");
  }

  private handleStackSentinel(lookahead: Token): boolean {
    if (lookahead.type === DOLLAR) {
      this.steps.push(this.snapshot("[Accept] Input fully consumed", { type: "accept" }));
      this.reportResult("correct");
    } else {
      this.pushError(
        `[Error] Expected end of input, got '${lookahead.type}'.`,
        "Unexpected token at the end",
      );
    }
    return false;
  }

  private handleTerminal(top: string, lookahead: Token): boolean {
    if (top !== lookahead.type) {
      this.pushError(
        `[Error] - expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${this.formatLineWithCol(lookahead)}.`,
        `Expected ${top}`,
      );
      return false;
    }

    this.symbolStack.pop();
    const matchedNode: ParseTreeNode = this.nodeStack.pop()!;
    matchedNode.data = lookahead;
    matchedNode.processed = true;
    this.bufferIndex++;

    this.steps.push(
      this.snapshot(
        `[Match] ${top} = "${lookahead.value}" at line ${this.formatLineWithCol(lookahead)}.`,
        { type: "match", symbol: top, tokenValue: lookahead.value },
        matchedNode,
      ),
    );

    return true;
  }

  private handleNonTerminal(top: string, lookahead: Token): boolean {
    const ruleNumber: RuleNumber = PARSE_TABLE[top]?.[lookahead.type];

    if (ruleNumber === undefined) {
      this.pushError(
        `[Error] No rule for (${top}, ${lookahead.type}) at line ${this.formatLineWithCol(lookahead)}.`,
        `No rule for (${top}, ${lookahead.type})`,
      );
      return false;
    }

    const rule: Rule = RULES[ruleNumber];
    this.symbolStack.pop();
    const parentNode: ParseTreeNode = this.nodeStack.pop()!;
    parentNode.processed = true;

    if (rule.right.length === 0) {
      parentNode.children = [this.createNode(EPSILON, true)];
      this.steps.push(
        this.snapshot(
          `[EXPAND] ${top} -> ${EPSILON} (rule ${ruleNumber}, lookahead: ${lookahead.type})`,
          { type: "expand", ruleNumber: ruleNumber, symbol: top },
          parentNode,
        ),
      );
      return true;
    }

    const childNodes: Array<ParseTreeNode> = rule.right.map(
      (symbol: NonTerminal | TokenType): ParseTreeNode => this.createNode(symbol),
    );
    parentNode.children = childNodes;

    for (let i: number = rule.right.length - 1; i >= 0; i--) {
      this.symbolStack.push(rule.right[i]);
      this.nodeStack.push(childNodes[i]);
    }

    this.steps.push(
      this.snapshot(
        `[Expand] ${top} -> ${rule.right.join(" ")} (rule ${ruleNumber}, lookahead: ${lookahead.type})`,
        { type: "expand", ruleNumber, symbol: top },
        parentNode,
      ),
    );

    return true;
  }

  public parse(): Array<SyntaxParserStep> {
    this.nodeId = 0;
    this.bufferIndex = 0;
    this.resultReported = false;
    this.steps = [];
    this.input = [...this.tokens, EOF_TOKEN];

    this.root = this.createNode(PROGRAM);
    this.symbolStack = [DOLLAR, PROGRAM];
    this.nodeStack = [this.createNode(DOLLAR), this.root];

    this.steps.push(
      this.snapshot(`[INIT] Parser initialized. Starting symbol: ${PROGRAM}`, {
        type: "init",
        symbol: PROGRAM,
      }),
    );

    let safety: number = STEP_SAFETY_LIMIT;

    while (this.symbolStack.length > 0 && safety-- > 0) {
      const top: string = this.symbolStack.at(-1)!;
      const lookahead: Token = this.input[this.bufferIndex];

      let shouldContinue: boolean;
      if (top === DOLLAR) {
        shouldContinue = this.handleStackSentinel(lookahead);
      } else if (!NON_TERMINALS.has(top)) {
        shouldContinue = this.handleTerminal(top, lookahead);
      } else {
        shouldContinue = this.handleNonTerminal(top, lookahead);
      }

      if (!shouldContinue) break;
    }

    if (safety <= 0) {
      this.pushError(
        "[Error] Exceeded safety step limit. Possible infinite loop in grammar.",
        "Step limit exceeded",
      );
    }

    return this.steps;
  }
}
