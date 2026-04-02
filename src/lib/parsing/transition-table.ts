import { NonTerminal, TokenType } from "~/lib/types";

export type RuleNumber = number;

// PARSE_TABLE[nonTerminal][terminal] = rule number
export const PARSE_TABLE: Record<string, Record<string, RuleNumber>> = {
  program: { BEGIN: 1 },
  statement_list: { IDENT: 2, READ: 2, WRITE: 2, IF: 2 },
  "statement_list'": { IDENT: 4, READ: 4, WRITE: 4, IF: 4, END: 3 },
  statement: { IDENT: 5, READ: 6, WRITE: 7, IF: 8 },
  else: { ELSE: 10, SEMI: 9 },
  id_list: { IDENT: 11 },
  "id_list'": { RPAREN: 12, COMMA: 13 },
  expr_list: { IDENT: 14, NUMBER: 14, LPAREN: 14 },
  "expr_list'": { RPAREN: 15, COMMA: 16 },
  expression: { IDENT: 17, NUMBER: 17, LPAREN: 17 },
  "expression'": { SEMI: 18, COMMA: 18, RPAREN: 18, PLUS: 19, MINUS: 19 },
  factor: { IDENT: 20, NUMBER: 21, LPAREN: 22 },
  op: { PLUS: 23, MINUS: 24 },
  bexpr: { NOT: 25, TRUE: 25, FALSE: 25, LPAREN: 25 },
  "bexpr'": { THEN: 26, RPAREN: 26, OR: 27 },
  bterm: { NOT: 28, TRUE: 28, FALSE: 28, LPAREN: 28 },
  "bterm'": { THEN: 29, OR: 29, RPAREN: 29, AND: 30 },
  bfactor: { NOT: 31, LPAREN: 32, TRUE: 33, FALSE: 34 },
};

export const RULES: Record<RuleNumber, { lhs: string; rhs: Array<NonTerminal | TokenType | "$"> }> =
  {
    1: { lhs: "program", rhs: ["BEGIN", "statement_list", "END"] },
    2: { lhs: "statement_list", rhs: ["statement", "statement_list'"] },
    3: { lhs: "statement_list'", rhs: [] },
    4: { lhs: "statement_list'", rhs: ["statement", "statement_list'"] },
    5: { lhs: "statement", rhs: ["IDENT", "ASSIGN", "expression", "SEMI"] },
    6: { lhs: "statement", rhs: ["READ", "LPAREN", "id_list", "RPAREN", "SEMI"] },
    7: { lhs: "statement", rhs: ["WRITE", "LPAREN", "expr_list", "RPAREN", "SEMI"] },
    8: { lhs: "statement", rhs: ["IF", "bexpr", "THEN", "statement", "else"] },
    9: { lhs: "else", rhs: [] }, // ε
    10: { lhs: "else", rhs: ["ELSE", "statement"] },
    11: { lhs: "id_list", rhs: ["IDENT", "id_list'"] },
    12: { lhs: "id_list'", rhs: [] }, // ε
    13: { lhs: "id_list'", rhs: ["COMMA", "id_list"] },
    14: { lhs: "expr_list", rhs: ["expression", "expr_list'"] },
    15: { lhs: "expr_list'", rhs: [] }, // ε
    16: { lhs: "expr_list'", rhs: ["COMMA", "expr_list"] },
    17: { lhs: "expression", rhs: ["factor", "expression'"] },
    18: { lhs: "expression'", rhs: [] }, // ε
    19: { lhs: "expression'", rhs: ["op", "factor", "expression'"] },
    20: { lhs: "factor", rhs: ["IDENT"] },
    21: { lhs: "factor", rhs: ["NUMBER"] },
    22: { lhs: "factor", rhs: ["LPAREN", "expression", "RPAREN"] },
    23: { lhs: "op", rhs: ["PLUS"] },
    24: { lhs: "op", rhs: ["MINUS"] },
    25: { lhs: "bexpr", rhs: ["bterm", "bexpr'"] },
    26: { lhs: "bexpr'", rhs: [] }, // ε
    27: { lhs: "bexpr'", rhs: ["OR", "bterm", "bexpr'"] },
    28: { lhs: "bterm", rhs: ["bfactor", "bterm'"] },
    29: { lhs: "bterm'", rhs: [] }, // ε
    30: { lhs: "bterm'", rhs: ["AND", "bfactor", "bterm'"] },
    31: { lhs: "bfactor", rhs: ["NOT", "bfactor"] },
    32: { lhs: "bfactor", rhs: ["LPAREN", "bexpr", "RPAREN"] },
    33: { lhs: "bfactor", rhs: ["TRUE"] },
    34: { lhs: "bfactor", rhs: ["FALSE"] },
  };

export const NON_TERMINALS = new Set(Object.keys(PARSE_TABLE));
