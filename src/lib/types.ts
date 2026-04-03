import type { LucideIcon } from "lucide-solid";

export type Program = "program";
export type Dollar = "$";
export type Epsilon = "ε";

export type Token = {
  type: TokenType;
  value: string;
  line: number;
  colStart: number;
  colEnd: number;
};

export type TokenType = Identifier | Keyword | Operator | Punctuation | Dollar;

export type Identifier = "IDENT";

export type Keyword =
  | "BEGIN"
  | "END"
  | "READ"
  | "WRITE"
  | "IF"
  | "THEN"
  | "ELSE"
  | "OR"
  | "AND"
  | "NOT"
  | "TRUE"
  | "FALSE"
  | "NUMBER";

export type Operator = "ASSIGN" | "PLUS" | "MINUS";

export type Punctuation = "SEMI" | "LPAREN" | "RPAREN" | "COMMA";

export type Screen = "input" | "lex-config" | "lex" | "syntax-config" | "syntax" | "results";

export type ParseTreeNodeData = Token | NonTerminal | TokenType | Dollar;

export type ParseTreeNode = {
  id: string;
  data: ParseTreeNodeData;
  processed: boolean;
  children?: Array<ParseTreeNode>;
};

export type Direction = "none" | "backward" | "forward";

export type ControlButton = "previous" | "next" | "play" | "first" | "last";

export type Result = "unknown" | "correct" | "incorrect";

export type Caret = {
  line: number;
  col: number;
};

export type NonTerminal =
  | "program"
  | "statement_list"
  | "statement_list'"
  | "statement"
  | "else"
  | "id_list"
  | "id_list'"
  | "expr_list"
  | "expr_list'"
  | "expression"
  | "expression'"
  | "factor"
  | "op"
  | "bexpr"
  | "bexpr'"
  | "bterm"
  | "bterm'"
  | "bfactor"
  | Epsilon;

export type BufferType = Array<Token>;
export type StackItem = Token | NonTerminal | Dollar;
export type StackType = Array<StackItem>;

export type SyntaxParserActionType = "init" | "expand" | "match" | "accept" | "error";

export interface SyntaxParserAction {
  type: SyntaxParserActionType;
  ruleNumber?: number;
  symbol?: string;
  tokenValue?: string;
  errorMessage?: string;
}

export interface SyntaxParserStep {
  stack: Array<string>;
  bufferIndex: number;
  tree: ParseTreeNode;
  log: string;
  action: SyntaxParserAction;
  currentTokenIndex: number;
  currentNodeId: string | undefined;
}

export type NodeType = "eof" | "epsilon" | "token" | "non-terminal" | "unknown";

export type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type LexErrorMode = "lex-no-errors" | "lex-error-1" | "lex-error-2";

export type SyntaxErrorMode = "syntax-no-errors" | "syntax-error-1" | "syntax-error-2";

export type ErrorModeData = {
  mode: LexErrorMode | SyntaxErrorMode;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type RuleNumber = number;

export type ParseTable = Record<string, Record<string, RuleNumber>>;

export type Rule = {
  left: string;
  right: Array<NonTerminal | TokenType | Dollar>;
};

export type Rules = Record<RuleNumber, Rule>;
