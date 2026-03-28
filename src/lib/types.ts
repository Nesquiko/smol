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
  | "FALSE";

export type Operator = ":=" | "+" | "-";

export type Punctuation = ";" | "(" | ")" | ",";

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
