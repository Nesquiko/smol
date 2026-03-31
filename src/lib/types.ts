export type Token = {
  type: TokenType;
  line: number;
  colStart: number;
  colEnd: number;
};

export type TokenType = Identifier | Keyword | Operator | Punctuation;

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

export type Page = "input" | "lex" | "syntax" | "results";

export type ParseTreeNode = {
  id: string;
  label: string;
  children?: Array<ParseTreeNode>;
};

export type Direction = "none" | "backward" | "forward";

export type ControlButton = "previous" | "next" | "play";

export type Result = "could-not-determine" | "correct" | "incorrect";

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
  | "bfactor";

export type Dollar = "$";

export type BufferType = Array<Token>;
export type StackItem = Token | NonTerminal | Dollar;
export type StackType = Array<StackItem>;

export type LL1Table = Record<NonTerminal, Partial<Record<TokenType | Dollar, number>>>;

type Range<N extends number, Result extends number[] = []> = Result["length"] extends N
  ? Result[number]
  : Range<N, [...Result, Result["length"]]>;

export type Rule = Range<34>;
