import { Accessor } from "solid-js";

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
  SyntaxLog,
  SyntaxErrorOccurrence,
  SyntaxErrorMode,
} from "~/lib/types";

export class SyntaxParser {
  private nodeId: number = 0;
  private bufferIndex: number = 0;
  private resultReported: boolean = false;
  private hasErrors: boolean = false;

  private symbolStack: Array<string> = [];
  private nodeStack: Array<ParseTreeNode> = [];
  private root!: ParseTreeNode;

  private steps: Array<SyntaxParserStep> = [];
  private input: Array<Token> = [];

  constructor(
    private readonly tokens: Array<Token>,
    private readonly onResult: (result: Result) => void,
    private readonly errorMode: Accessor<SyntaxErrorMode | undefined> = () => "no-errors",
  ) {}

  private formatLineWithCol(token: Token): string {
    const cols: string =
      token.colStart === token.colEnd ? `${token.colStart}` : `${token.colStart}-${token.colEnd}`;
    return `${token.line}:${cols}`;
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
    log: SyntaxLog,
    action: SyntaxParserAction,
    currentNode?: ParseTreeNode,
    error?: SyntaxErrorOccurrence,
  ): SyntaxParserStep {
    return {
      stack: [...this.symbolStack],
      bufferIndex: this.bufferIndex,
      tree: this.cloneTree(this.root),
      log,
      action,
      currentTokenIndex: Math.min(this.bufferIndex, this.tokens.length - 1),
      currentNodeId: currentNode?.id,
      error: error,
    };
  }

  private reportResult(result: Result): void {
    if (this.resultReported) return;
    this.resultReported = true;
    this.onResult(result);
  }

  private pushError(message: string, errorMessage: string): void {
    this.steps.push(
      this.snapshot(
        { type: "error", message },
        { type: "error", errorMessage },
        this.nodeStack.at(-1),
        {
          nodeId: this.nodeStack.at(-1)?.id,
          message: message,
        },
      ),
    );
    this.reportResult("incorrect");
  }

  private handleStackSentinel(lookahead: Token): boolean {
    if (lookahead.type === DOLLAR) {
      const message: string = "Input fully consumed";
      this.steps.push(this.snapshot({ type: "accept", message: message }, { type: "accept" }));
      this.reportResult(this.hasErrors ? "correct-with-errors" : "correct");
    } else {
      this.pushError(
        `Expected end of input, got '${lookahead.type}'.`,
        "Unexpected token at the end",
      );
    }
    return false;
  }

  private findSyncToken(fromIndex: number, expectedType: string): number {
    for (let i: number = fromIndex; i < this.input.length; i++) {
      if (this.input[i].type === DOLLAR) return -1;
      if (this.input[i].type === expectedType) return i;
    }
    return -1;
  }

  private findSyncTokenForNonTerminal(fromIndex: number, top: string): number {
    for (let i: number = fromIndex; i < this.input.length; i++) {
      if (this.input[i].type === DOLLAR) return -1;
      if (PARSE_TABLE[top]?.[this.input[i].type] !== undefined) return i;
    }
    return -1;
  }

  private makeSyntheticToken(expectedType: string, reference: Token): Token {
    return {
      type: expectedType as TokenType,
      value: "<inserted>",
      line: reference.line,
      colStart: reference.colStart,
      colEnd: reference.colEnd,
    };
  }

  private handleTerminal(top: string, lookahead: Token): boolean {
    if (top !== lookahead.type) {
      if (this.errorMode() === "ignore-until-found") {
        return this.recoverTerminalBySkipping(top, lookahead);
      } else if (this.errorMode() === "add-missing") {
        return this.recoverTerminalByInserting(top, lookahead);
      }

      this.pushError(
        `Expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${this.formatLineWithCol(lookahead)}.`,
        `Expected ${top}`,
      );
      return false;
    }

    this.symbolStack.pop();
    const matchedNode: ParseTreeNode = this.nodeStack.pop()!;
    matchedNode.data = lookahead;
    matchedNode.processed = true;
    this.bufferIndex++;

    const message: string = `${top} = "${lookahead.value}" at line ${this.formatLineWithCol(lookahead)}`;
    this.steps.push(
      this.snapshot(
        { type: "match", message: message },
        { type: "match", symbol: top, tokenValue: lookahead.value },
        matchedNode,
      ),
    );

    return true;
  }

  private recoverTerminalBySkipping(top: string, lookahead: Token): boolean {
    this.hasErrors = true;

    const errorMessage = `Expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${this.formatLineWithCol(lookahead)}. Skipping tokens until '${top}' is found.`;
    this.steps.push(
      this.snapshot(
        { type: "error", message: errorMessage },
        { type: "error", errorMessage },
        this.nodeStack.at(-1),
        {
          nodeId: this.nodeStack.at(-1)?.id,
          message: errorMessage,
        },
      ),
    );

    const syncIndex: number = this.findSyncToken(this.bufferIndex, top);
    if (syncIndex === -1) {
      this.pushError(
        `Could not find '${top}' to recover. Reached end of input.`,
        `Recovery failed: '${top}' not found`,
      );
      return false;
    }

    for (let i: number = this.bufferIndex; i < syncIndex; i++) {
      const skipped: Token = this.input[i];
      this.bufferIndex++;
      this.steps.push(
        this.snapshot(
          {
            type: "skip",
            message: `Skipping '${skipped.type}' ("${skipped.value}") at line ${this.formatLineWithCol(skipped)}`,
          },
          { type: "skip", skippedToken: skipped.type },
          this.nodeStack.at(-1),
        ),
      );
    }

    const recovered = this.input[this.bufferIndex];
    this.steps.push(
      this.snapshot(
        {
          type: "recover",
          message: `Recovered: found '${top}' at line ${this.formatLineWithCol(recovered)}`,
        },
        { type: "recover", strategy: "ignore-until-found" },
        this.nodeStack.at(-1),
      ),
    );

    return true;
  }

  private recoverTerminalByInserting(top: string, lookahead: Token): boolean {
    this.hasErrors = true;

    const synthetic: Token = this.makeSyntheticToken(top, lookahead);

    const errorMessage = `Expected '${top}', got '${lookahead.type}' ("${lookahead.value}") at line ${this.formatLineWithCol(lookahead)}. Inserting missing '${top}'.`;
    this.steps.push(
      this.snapshot(
        { type: "error", message: errorMessage },
        { type: "error", errorMessage },
        this.nodeStack.at(-1),
        {
          nodeId: this.nodeStack.at(-1)?.id,
          message: errorMessage,
        },
      ),
    );

    this.symbolStack.pop();
    const matchedNode: ParseTreeNode = this.nodeStack.pop()!;
    matchedNode.data = synthetic;
    matchedNode.processed = true;

    this.steps.push(
      this.snapshot(
        {
          type: "recover",
          message: `Inserted synthetic '${top}' at line ${this.formatLineWithCol(lookahead)}`,
        },
        { type: "recover", strategy: "add-missing" },
        matchedNode,
      ),
    );

    return true;
  }

  private handleNonTerminal(top: string, lookahead: Token): boolean {
    const ruleNumber: RuleNumber = PARSE_TABLE[top]?.[lookahead.type];

    if (ruleNumber === undefined) {
      if (this.errorMode() === "ignore-until-found") {
        return this.recoverNonTerminalBySkipping(top, lookahead);
      } else if (this.errorMode() === "add-missing") {
        return this.recoverNonTerminalByInserting(top, lookahead);
      }

      this.pushError(
        `No rule for (${top}, ${lookahead.type}) at line ${this.formatLineWithCol(lookahead)}`,
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

      const message: string = `${top} -> ${EPSILON} (rule ${ruleNumber}, lookahead: ${lookahead.type})`;
      this.steps.push(
        this.snapshot(
          { type: "expand", message: message },
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

    const message: string = `${top} -> ${rule.right.join(" ")} (rule ${ruleNumber}, lookahead: ${lookahead.type})`;
    this.steps.push(
      this.snapshot(
        { type: "expand", message },
        { type: "expand", ruleNumber, symbol: top },
        parentNode,
      ),
    );

    return true;
  }

  private recoverNonTerminalBySkipping(top: string, lookahead: Token): boolean {
    this.hasErrors = true;

    const errorMessage = `No rule for (${top}, ${lookahead.type}) at line ${this.formatLineWithCol(lookahead)}. Skipping tokens to recover.`;
    this.steps.push(
      this.snapshot(
        { type: "error", message: errorMessage },
        { type: "error", errorMessage },
        this.nodeStack.at(-1),
        {
          nodeId: this.nodeStack.at(-1)?.id,
          message: errorMessage,
        },
      ),
    );

    const syncIndex: number = this.findSyncTokenForNonTerminal(this.bufferIndex, top);
    if (syncIndex === -1) {
      this.pushError(
        `Could not recover for non-terminal '${top}'. Reached end of input.`,
        `Recovery failed for '${top}'`,
      );
      return false;
    }

    for (let i: number = this.bufferIndex; i < syncIndex; i++) {
      const skipped: Token = this.input[i];
      this.bufferIndex++;
      this.steps.push(
        this.snapshot(
          {
            type: "skip",
            message: `Skipping '${skipped.type}' ("${skipped.value}") at line ${this.formatLineWithCol(skipped)}`,
          },
          { type: "skip", skippedToken: skipped.type },
          this.nodeStack.at(-1),
        ),
      );
    }

    const recovered: Token = this.input[this.bufferIndex];
    this.steps.push(
      this.snapshot(
        {
          type: "recover",
          message: `Recovered at '${recovered.type}' for non-terminal '${top}' at line ${this.formatLineWithCol(recovered)}`,
        },
        { type: "recover", strategy: "ignore-until-found" },
        this.nodeStack.at(-1),
      ),
    );

    return true;
  }

  private recoverNonTerminalByInserting(top: string, lookahead: Token): boolean {
    this.hasErrors = true;

    const validTypes: Array<string> = Object.keys(PARSE_TABLE[top] ?? {});
    if (validTypes.length === 0) {
      this.pushError(
        `No rule for (${top}, ${lookahead.type}) and no recovery possible.`,
        `Recovery failed for '${top}'`,
      );
      return false;
    }

    const insertType: string = validTypes[0];
    const synthetic: Token = this.makeSyntheticToken(insertType, lookahead);

    const errorMessage = `No rule for (${top}, ${lookahead.type}) at line ${this.formatLineWithCol(lookahead)}. Inserting '${insertType}' to recover.`;
    this.steps.push(
      this.snapshot(
        { type: "error", message: errorMessage },
        { type: "error", errorMessage },
        this.nodeStack.at(-1),
        {
          nodeId: this.nodeStack.at(-1)?.id,
          message: errorMessage,
        },
      ),
    );

    this.input.splice(this.bufferIndex, 0, synthetic);

    this.steps.push(
      this.snapshot(
        {
          type: "recover",
          message: `Inserted synthetic '${insertType}' at line ${this.formatLineWithCol(lookahead)} to satisfy '${top}'.`,
        },
        { type: "recover", strategy: "add-missing" },
        this.nodeStack.at(-1),
      ),
    );

    return true;
  }

  public parse(): Array<SyntaxParserStep> {
    this.nodeId = 0;
    this.bufferIndex = 0;
    this.resultReported = false;
    this.hasErrors = false;
    this.steps = [];
    this.input = [...this.tokens, EOF_TOKEN];

    this.root = this.createNode(PROGRAM);
    this.symbolStack = [DOLLAR, PROGRAM];
    this.nodeStack = [this.createNode(DOLLAR), this.root];

    const message: string = `Parser initialized. Starting symbol: ${PROGRAM}`;
    this.steps.push(
      this.snapshot({ type: "init", message: message }, { type: "init", symbol: PROGRAM }),
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
        "Exceeded safety step limit. Possible infinite loop in grammar.",
        "Step limit exceeded",
      );
    }

    return this.steps;
  }
}
