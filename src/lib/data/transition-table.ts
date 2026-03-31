import { Dollar, LL1Table, TokenType } from "~/lib/types";

export const TERMINALS: Array<TokenType | Dollar> = [
  "BEGIN",
  "END",
  "READ",
  "WRITE",
  "IF",
  "ELSE",
  "THEN",
  "OR",
  "AND",
  "NOT",
  "TRUE",
  "FALSE",
  "IDENT",
  "NUMBER",
  "ASSIGN",
  "SEMI",
  "LPAREN",
  "RPAREN",
  "COMMA",
  "PLUS",
  "MINUS",
  "$",
] satisfies Array<TokenType | Dollar>;

export const LL1_TABLE: LL1Table = {
  program: {
    BEGIN: 1,
  },

  statement_list: {
    READ: 2,
    WRITE: 2,
    IF: 2,
    IDENT: 2,
  },

  "statement_list'": {
    END: 3,
    READ: 4,
    WRITE: 4,
    IF: 4,
    IDENT: 4,
  },

  statement: {
    READ: 6,
    WRITE: 7,
    IF: 8,
    IDENT: 5,
  },

  else: {
    ELSE: 10,
    SEMI: 9,
  },

  id_list: {
    IDENT: 11,
  },

  "id_list'": {
    RPAREN: 12,
    COMMA: 13,
  },

  expr_list: {
    IDENT: 14,
    NUMBER: 14,
    LPAREN: 14,
  },

  "expr_list'": {
    RPAREN: 15,
    COMMA: 16,
  },

  expression: {
    IDENT: 17,
    NUMBER: 17,
    LPAREN: 17,
  },

  "expression'": {
    SEMI: 18,
    RPAREN: 18,
    COMMA: 18,
    PLUS: 19,
    MINUS: 19,
  },

  factor: {
    IDENT: 20,
    NUMBER: 21,
    LPAREN: 22,
  },

  op: {
    PLUS: 23,
    MINUS: 24,
  },

  bexpr: {
    NOT: 25,
    TRUE: 25,
    FALSE: 25,
    LPAREN: 25,
  },

  "bexpr'": {
    THEN: 26,
    OR: 27,
    RPAREN: 26,
  },

  bterm: {
    NOT: 28,
    TRUE: 28,
    FALSE: 28,
    LPAREN: 28,
  },

  "bterm'": {
    THEN: 29,
    OR: 29,
    AND: 30,
    RPAREN: 29,
  },

  bfactor: {
    NOT: 31,
    TRUE: 33,
    FALSE: 34,
    LPAREN: 32,
  },
} satisfies LL1Table;

export const TRANSITION_TABLE = {
  header: ["Non-terminal", ...TERMINALS],

  rows: Object.entries(LL1_TABLE).map(([nonTerminal, row]) => ({
    cells: [
      nonTerminal,
      ...TERMINALS.map((terminal: TokenType | Dollar): string => {
        const value: number | undefined = row[terminal];
        return value !== undefined ? String(value) : "";
      }),
    ],
  })),
};
