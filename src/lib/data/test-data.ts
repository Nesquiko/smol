import { ParseTreeNode, Token } from "~/lib/types";
import { randomToken } from "~/lib/ui-utils";

export const TOKENS_TEST: Array<Token> = [
  // Line 1: BEGIN
  { type: "BEGIN", value: "BEGIN", line: 1, colStart: 0, colEnd: 5 },

  // Line 2: READ(a,b,c,d,e);
  { type: "READ", value: "READ", line: 2, colStart: 0, colEnd: 4 },
  { type: "LPAREN", value: "(", line: 2, colStart: 4, colEnd: 5 },
  { type: "IDENT", value: "a", line: 2, colStart: 5, colEnd: 6 },
  { type: "COMMA", value: ",", line: 2, colStart: 6, colEnd: 7 },
  { type: "IDENT", value: "b", line: 2, colStart: 7, colEnd: 8 },
  { type: "COMMA", value: ",", line: 2, colStart: 8, colEnd: 9 },
  { type: "IDENT", value: "c", line: 2, colStart: 9, colEnd: 10 },
  { type: "COMMA", value: ",", line: 2, colStart: 10, colEnd: 11 },
  { type: "IDENT", value: "d", line: 2, colStart: 11, colEnd: 12 },
  { type: "COMMA", value: ",", line: 2, colStart: 12, colEnd: 13 },
  { type: "IDENT", value: "e", line: 2, colStart: 13, colEnd: 14 },
  { type: "RPAREN", value: ")", line: 2, colStart: 14, colEnd: 15 },
  { type: "SEMI", value: ";", line: 2, colStart: 15, colEnd: 16 },

  // Line 3: x:=a+b;
  { type: "IDENT", value: "x", line: 3, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 3, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "a", line: 3, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 3, colStart: 4, colEnd: 5 },
  { type: "IDENT", value: "b", line: 3, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 3, colStart: 6, colEnd: 7 },

  // Line 4: y:=x-c;
  { type: "IDENT", value: "y", line: 4, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 4, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "x", line: 4, colStart: 3, colEnd: 4 },
  { type: "MINUS", value: "-", line: 4, colStart: 4, colEnd: 5 },
  { type: "IDENT", value: "c", line: 4, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 4, colStart: 6, colEnd: 7 },

  // Line 5: z:=y+10;
  { type: "IDENT", value: "z", line: 5, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 5, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "y", line: 5, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 5, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "10", line: 5, colStart: 5, colEnd: 7 },
  { type: "SEMI", value: ";", line: 5, colStart: 7, colEnd: 8 },

  // Line 6: total:=z+d;
  { type: "IDENT", value: "total", line: 6, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 6, colStart: 5, colEnd: 7 },
  { type: "IDENT", value: "z", line: 6, colStart: 7, colEnd: 8 },
  { type: "PLUS", value: "+", line: 6, colStart: 8, colEnd: 9 },
  { type: "IDENT", value: "d", line: 6, colStart: 9, colEnd: 10 },
  { type: "SEMI", value: ";", line: 6, colStart: 10, colEnd: 11 },

  // Line 7: temp:=total-e;
  { type: "IDENT", value: "temp", line: 7, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", value: ":=", line: 7, colStart: 4, colEnd: 6 },
  { type: "IDENT", value: "total", line: 7, colStart: 6, colEnd: 11 },
  { type: "MINUS", value: "-", line: 7, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "e", line: 7, colStart: 12, colEnd: 13 },
  { type: "SEMI", value: ";", line: 7, colStart: 13, colEnd: 14 },

  // Line 8: WRITE(a,b,c,d,e);
  { type: "WRITE", value: "WRITE", line: 8, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 8, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "a", line: 8, colStart: 6, colEnd: 7 },
  { type: "COMMA", value: ",", line: 8, colStart: 7, colEnd: 8 },
  { type: "IDENT", value: "b", line: 8, colStart: 8, colEnd: 9 },
  { type: "COMMA", value: ",", line: 8, colStart: 9, colEnd: 10 },
  { type: "IDENT", value: "c", line: 8, colStart: 10, colEnd: 11 },
  { type: "COMMA", value: ",", line: 8, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "d", line: 8, colStart: 12, colEnd: 13 },
  { type: "COMMA", value: ",", line: 8, colStart: 13, colEnd: 14 },
  { type: "IDENT", value: "e", line: 8, colStart: 14, colEnd: 15 },
  { type: "RPAREN", value: ")", line: 8, colStart: 15, colEnd: 16 },
  { type: "SEMI", value: ";", line: 8, colStart: 16, colEnd: 17 },

  // Line 9: WRITE(x,y,z,total,temp);
  { type: "WRITE", value: "WRITE", line: 9, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 9, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "x", line: 9, colStart: 6, colEnd: 7 },
  { type: "COMMA", value: ",", line: 9, colStart: 7, colEnd: 8 },
  { type: "IDENT", value: "y", line: 9, colStart: 8, colEnd: 9 },
  { type: "COMMA", value: ",", line: 9, colStart: 9, colEnd: 10 },
  { type: "IDENT", value: "z", line: 9, colStart: 10, colEnd: 11 },
  { type: "COMMA", value: ",", line: 9, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "total", line: 9, colStart: 12, colEnd: 17 },
  { type: "COMMA", value: ",", line: 9, colStart: 17, colEnd: 18 },
  { type: "IDENT", value: "temp", line: 9, colStart: 18, colEnd: 22 },
  { type: "RPAREN", value: ")", line: 9, colStart: 22, colEnd: 23 },
  { type: "SEMI", value: ";", line: 9, colStart: 23, colEnd: 24 },

  // Line 10: IF TRUE THEN WRITE(x); ELSE WRITE(y);
  { type: "IF", value: "IF", line: 10, colStart: 0, colEnd: 2 },
  { type: "TRUE", value: "TRUE", line: 10, colStart: 3, colEnd: 7 },
  { type: "THEN", value: "THEN", line: 10, colStart: 8, colEnd: 12 },
  { type: "WRITE", value: "WRITE", line: 10, colStart: 13, colEnd: 18 },
  { type: "LPAREN", value: "(", line: 10, colStart: 18, colEnd: 19 },
  { type: "IDENT", value: "x", line: 10, colStart: 19, colEnd: 20 },
  { type: "RPAREN", value: ")", line: 10, colStart: 20, colEnd: 21 },
  { type: "SEMI", value: ";", line: 10, colStart: 21, colEnd: 22 }, // ends THEN statement
  { type: "ELSE", value: "ELSE", line: 10, colStart: 23, colEnd: 27 },
  { type: "WRITE", value: "WRITE", line: 10, colStart: 28, colEnd: 33 },
  { type: "LPAREN", value: "(", line: 10, colStart: 33, colEnd: 34 },
  { type: "IDENT", value: "y", line: 10, colStart: 34, colEnd: 35 },
  { type: "RPAREN", value: ")", line: 10, colStart: 35, colEnd: 36 },
  { type: "SEMI", value: ";", line: 10, colStart: 36, colEnd: 37 }, // ends ELSE and whole IF

  // Line 11: IF FALSE THEN READ(m); ELSE WRITE(z);
  { type: "IF", value: "IF", line: 11, colStart: 0, colEnd: 2 },
  { type: "FALSE", value: "FALSE", line: 11, colStart: 3, colEnd: 8 },
  { type: "THEN", value: "THEN", line: 11, colStart: 9, colEnd: 13 },
  { type: "READ", value: "READ", line: 11, colStart: 14, colEnd: 18 },
  { type: "LPAREN", value: "(", line: 11, colStart: 18, colEnd: 19 },
  { type: "IDENT", value: "m", line: 11, colStart: 19, colEnd: 20 },
  { type: "RPAREN", value: ")", line: 11, colStart: 20, colEnd: 21 },
  { type: "SEMI", value: ";", line: 11, colStart: 21, colEnd: 22 }, // ends THEN statement
  { type: "ELSE", value: "ELSE", line: 11, colStart: 23, colEnd: 27 },
  { type: "WRITE", value: "WRITE", line: 11, colStart: 28, colEnd: 33 },
  { type: "LPAREN", value: "(", line: 11, colStart: 33, colEnd: 34 },
  { type: "IDENT", value: "z", line: 11, colStart: 34, colEnd: 35 },
  { type: "RPAREN", value: ")", line: 11, colStart: 35, colEnd: 36 },
  { type: "SEMI", value: ";", line: 11, colStart: 36, colEnd: 37 }, // ends ELSE and whole IF

  // Line 12: alpha:=1;
  { type: "IDENT", value: "alpha", line: 12, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 12, colStart: 5, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 12, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 12, colStart: 8, colEnd: 9 },

  // Line 13: beta:=alpha+2;
  { type: "IDENT", value: "beta", line: 13, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", value: ":=", line: 13, colStart: 4, colEnd: 6 },
  { type: "IDENT", value: "alpha", line: 13, colStart: 6, colEnd: 11 },
  { type: "PLUS", value: "+", line: 13, colStart: 11, colEnd: 12 },
  { type: "NUMBER", value: "2", line: 13, colStart: 12, colEnd: 13 },
  { type: "SEMI", value: ";", line: 13, colStart: 13, colEnd: 14 },

  // Line 14: gamma:=beta+3;
  { type: "IDENT", value: "gamma", line: 14, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 14, colStart: 5, colEnd: 7 },
  { type: "IDENT", value: "beta", line: 14, colStart: 7, colEnd: 11 },
  { type: "PLUS", value: "+", line: 14, colStart: 11, colEnd: 12 },
  { type: "NUMBER", value: "3", line: 14, colStart: 12, colEnd: 13 },
  { type: "SEMI", value: ";", line: 14, colStart: 13, colEnd: 14 },

  // Line 15: delta:=gamma-4;
  { type: "IDENT", value: "delta", line: 15, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 15, colStart: 5, colEnd: 7 },
  { type: "IDENT", value: "gamma", line: 15, colStart: 7, colEnd: 12 },
  { type: "MINUS", value: "-", line: 15, colStart: 12, colEnd: 13 },
  { type: "NUMBER", value: "4", line: 15, colStart: 13, colEnd: 14 },
  { type: "SEMI", value: ";", line: 15, colStart: 14, colEnd: 15 },

  // Line 16: epsilon:=delta+5;
  { type: "IDENT", value: "epsilon", line: 16, colStart: 0, colEnd: 7 },
  { type: "ASSIGN", value: ":=", line: 16, colStart: 7, colEnd: 9 },
  { type: "IDENT", value: "delta", line: 16, colStart: 9, colEnd: 14 },
  { type: "PLUS", value: "+", line: 16, colStart: 14, colEnd: 15 },
  { type: "NUMBER", value: "5", line: 16, colStart: 15, colEnd: 16 },
  { type: "SEMI", value: ";", line: 16, colStart: 16, colEnd: 17 },

  // Line 17: WRITE(alpha,beta,gamma,delta,epsilon);
  { type: "WRITE", value: "WRITE", line: 17, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 17, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "alpha", line: 17, colStart: 6, colEnd: 11 },
  { type: "COMMA", value: ",", line: 17, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "beta", line: 17, colStart: 12, colEnd: 16 },
  { type: "COMMA", value: ",", line: 17, colStart: 16, colEnd: 17 },
  { type: "IDENT", value: "gamma", line: 17, colStart: 17, colEnd: 22 },
  { type: "COMMA", value: ",", line: 17, colStart: 22, colEnd: 23 },
  { type: "IDENT", value: "delta", line: 17, colStart: 23, colEnd: 28 },
  { type: "COMMA", value: ",", line: 17, colStart: 28, colEnd: 29 },
  { type: "IDENT", value: "epsilon", line: 17, colStart: 29, colEnd: 36 },
  { type: "RPAREN", value: ")", line: 17, colStart: 36, colEnd: 37 },
  { type: "SEMI", value: ";", line: 17, colStart: 37, colEnd: 38 },

  // Line 18: IF NOT FALSE THEN WRITE(epsilon); ELSE WRITE(alpha);
  { type: "IF", value: "IF", line: 18, colStart: 0, colEnd: 2 },
  { type: "NOT", value: "NOT", line: 18, colStart: 3, colEnd: 6 },
  { type: "FALSE", value: "FALSE", line: 18, colStart: 7, colEnd: 12 },
  { type: "THEN", value: "THEN", line: 18, colStart: 13, colEnd: 17 },
  { type: "WRITE", value: "WRITE", line: 18, colStart: 18, colEnd: 23 },
  { type: "LPAREN", value: "(", line: 18, colStart: 23, colEnd: 24 },
  { type: "IDENT", value: "epsilon", line: 18, colStart: 24, colEnd: 31 },
  { type: "RPAREN", value: ")", line: 18, colStart: 31, colEnd: 32 },
  { type: "SEMI", value: ";", line: 18, colStart: 32, colEnd: 33 },
  { type: "ELSE", value: "ELSE", line: 18, colStart: 34, colEnd: 38 },
  { type: "WRITE", value: "WRITE", line: 18, colStart: 39, colEnd: 44 },
  { type: "LPAREN", value: "(", line: 18, colStart: 44, colEnd: 45 },
  { type: "IDENT", value: "alpha", line: 18, colStart: 45, colEnd: 50 },
  { type: "RPAREN", value: ")", line: 18, colStart: 50, colEnd: 51 },
  { type: "SEMI", value: ";", line: 18, colStart: 51, colEnd: 52 },

  // Line 19: u:=1;
  { type: "IDENT", value: "u", line: 19, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 19, colStart: 1, colEnd: 3 },
  { type: "NUMBER", value: "1", line: 19, colStart: 3, colEnd: 4 },
  { type: "SEMI", value: ";", line: 19, colStart: 4, colEnd: 5 },

  // Line 20: v:=u+2;
  { type: "IDENT", value: "v", line: 20, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 20, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "u", line: 20, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 20, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "2", line: 20, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 20, colStart: 6, colEnd: 7 },

  // Line 21: w:=v+3;
  { type: "IDENT", value: "w", line: 21, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 21, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "v", line: 21, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 21, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "3", line: 21, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 21, colStart: 6, colEnd: 7 },

  // Line 22: p:=w-4;
  { type: "IDENT", value: "p", line: 22, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 22, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "w", line: 22, colStart: 3, colEnd: 4 },
  { type: "MINUS", value: "-", line: 22, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "4", line: 22, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 22, colStart: 6, colEnd: 7 },

  // Line 23: q:=p+5;
  { type: "IDENT", value: "q", line: 23, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 23, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "p", line: 23, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 23, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "5", line: 23, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 23, colStart: 6, colEnd: 7 },

  // Line 24: r:=q-6;
  { type: "IDENT", value: "r", line: 24, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 24, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "q", line: 24, colStart: 3, colEnd: 4 },
  { type: "MINUS", value: "-", line: 24, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "6", line: 24, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 24, colStart: 6, colEnd: 7 },

  // Line 25: s:=r+7;
  { type: "IDENT", value: "s", line: 25, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 25, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "r", line: 25, colStart: 3, colEnd: 4 },
  { type: "PLUS", value: "+", line: 25, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "7", line: 25, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 25, colStart: 6, colEnd: 7 },

  // Line 26: t:=s-8;
  { type: "IDENT", value: "t", line: 26, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", value: ":=", line: 26, colStart: 1, colEnd: 3 },
  { type: "IDENT", value: "s", line: 26, colStart: 3, colEnd: 4 },
  { type: "MINUS", value: "-", line: 26, colStart: 4, colEnd: 5 },
  { type: "NUMBER", value: "8", line: 26, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 26, colStart: 6, colEnd: 7 },

  // Line 27: WRITE(u,v,w,p,q,r,s,t);
  { type: "WRITE", value: "WRITE", line: 27, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 27, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "u", line: 27, colStart: 6, colEnd: 7 },
  { type: "COMMA", value: ",", line: 27, colStart: 7, colEnd: 8 },
  { type: "IDENT", value: "v", line: 27, colStart: 8, colEnd: 9 },
  { type: "COMMA", value: ",", line: 27, colStart: 9, colEnd: 10 },
  { type: "IDENT", value: "w", line: 27, colStart: 10, colEnd: 11 },
  { type: "COMMA", value: ",", line: 27, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "p", line: 27, colStart: 12, colEnd: 13 },
  { type: "COMMA", value: ",", line: 27, colStart: 13, colEnd: 14 },
  { type: "IDENT", value: "q", line: 27, colStart: 14, colEnd: 15 },
  { type: "COMMA", value: ",", line: 27, colStart: 15, colEnd: 16 },
  { type: "IDENT", value: "r", line: 27, colStart: 16, colEnd: 17 },
  { type: "COMMA", value: ",", line: 27, colStart: 17, colEnd: 18 },
  { type: "IDENT", value: "s", line: 27, colStart: 18, colEnd: 19 },
  { type: "COMMA", value: ",", line: 27, colStart: 19, colEnd: 20 },
  { type: "IDENT", value: "t", line: 27, colStart: 20, colEnd: 21 },
  { type: "RPAREN", value: ")", line: 27, colStart: 21, colEnd: 22 },
  { type: "SEMI", value: ";", line: 27, colStart: 22, colEnd: 23 },

  // Line 28: IF TRUE OR FALSE THEN WRITE(t); ELSE WRITE(u);
  { type: "IF", value: "IF", line: 28, colStart: 0, colEnd: 2 },
  { type: "TRUE", value: "TRUE", line: 28, colStart: 3, colEnd: 7 },
  { type: "OR", value: "OR", line: 28, colStart: 8, colEnd: 10 },
  { type: "FALSE", value: "FALSE", line: 28, colStart: 11, colEnd: 16 },
  { type: "THEN", value: "THEN", line: 28, colStart: 17, colEnd: 21 },
  { type: "WRITE", value: "WRITE", line: 28, colStart: 22, colEnd: 27 },
  { type: "LPAREN", value: "(", line: 28, colStart: 27, colEnd: 28 },
  { type: "IDENT", value: "t", line: 28, colStart: 28, colEnd: 29 },
  { type: "RPAREN", value: ")", line: 28, colStart: 29, colEnd: 30 },
  { type: "SEMI", value: ";", line: 28, colStart: 30, colEnd: 31 },
  { type: "ELSE", value: "ELSE", line: 28, colStart: 32, colEnd: 36 },
  { type: "WRITE", value: "WRITE", line: 28, colStart: 37, colEnd: 42 },
  { type: "LPAREN", value: "(", line: 28, colStart: 42, colEnd: 43 },
  { type: "IDENT", value: "u", line: 28, colStart: 43, colEnd: 44 },
  { type: "RPAREN", value: ")", line: 28, colStart: 44, colEnd: 45 },
  { type: "SEMI", value: ";", line: 28, colStart: 45, colEnd: 46 },

  // Line 29: left:=1;
  { type: "IDENT", value: "left", line: 29, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", value: ":=", line: 29, colStart: 4, colEnd: 6 },
  { type: "NUMBER", value: "1", line: 29, colStart: 6, colEnd: 7 },
  { type: "SEMI", value: ";", line: 29, colStart: 7, colEnd: 8 },

  // Line 30: right:=2;
  { type: "IDENT", value: "right", line: 30, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 30, colStart: 5, colEnd: 7 },
  { type: "NUMBER", value: "2", line: 30, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 30, colStart: 8, colEnd: 9 },

  // Line 31: mid:=left+right;
  { type: "IDENT", value: "mid", line: 31, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", value: ":=", line: 31, colStart: 3, colEnd: 5 },
  { type: "IDENT", value: "left", line: 31, colStart: 5, colEnd: 9 },
  { type: "PLUS", value: "+", line: 31, colStart: 9, colEnd: 10 },
  { type: "IDENT", value: "right", line: 31, colStart: 10, colEnd: 15 },
  { type: "SEMI", value: ";", line: 31, colStart: 15, colEnd: 16 },

  // Line 32: value:=mid+3;
  { type: "IDENT", value: "value", line: 32, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", value: ":=", line: 32, colStart: 5, colEnd: 7 },
  { type: "IDENT", value: "mid", line: 32, colStart: 7, colEnd: 10 },
  { type: "PLUS", value: "+", line: 32, colStart: 10, colEnd: 11 },
  { type: "NUMBER", value: "3", line: 32, colStart: 11, colEnd: 12 },
  { type: "SEMI", value: ";", line: 32, colStart: 12, colEnd: 13 },

  // Line 33: result:=value-1;
  { type: "IDENT", value: "result", line: 33, colStart: 0, colEnd: 6 },
  { type: "ASSIGN", value: ":=", line: 33, colStart: 6, colEnd: 8 },
  { type: "IDENT", value: "value", line: 33, colStart: 8, colEnd: 13 },
  { type: "MINUS", value: "-", line: 33, colStart: 13, colEnd: 14 },
  { type: "NUMBER", value: "1", line: 33, colStart: 14, colEnd: 15 },
  { type: "SEMI", value: ";", line: 33, colStart: 15, colEnd: 16 },

  // Line 34: WRITE(left,right,mid,value,result);
  { type: "WRITE", value: "WRITE", line: 34, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 34, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "left", line: 34, colStart: 6, colEnd: 10 },
  { type: "COMMA", value: ",", line: 34, colStart: 10, colEnd: 11 },
  { type: "IDENT", value: "right", line: 34, colStart: 11, colEnd: 16 },
  { type: "COMMA", value: ",", line: 34, colStart: 16, colEnd: 17 },
  { type: "IDENT", value: "mid", line: 34, colStart: 17, colEnd: 20 },
  { type: "COMMA", value: ",", line: 34, colStart: 20, colEnd: 21 },
  { type: "IDENT", value: "value", line: 34, colStart: 21, colEnd: 26 },
  { type: "COMMA", value: ",", line: 34, colStart: 26, colEnd: 27 },
  { type: "IDENT", value: "result", line: 34, colStart: 27, colEnd: 33 },
  { type: "RPAREN", value: ")", line: 34, colStart: 33, colEnd: 34 },
  { type: "SEMI", value: ";", line: 34, colStart: 34, colEnd: 35 },

  // Line 35: IF (TRUE AND NOT FALSE) THEN WRITE(result); ELSE WRITE(mid);
  { type: "IF", value: "IF", line: 35, colStart: 0, colEnd: 2 },
  { type: "LPAREN", value: "(", line: 35, colStart: 3, colEnd: 4 },
  { type: "TRUE", value: "TRUE", line: 35, colStart: 4, colEnd: 8 },
  { type: "AND", value: "AND", line: 35, colStart: 9, colEnd: 12 },
  { type: "NOT", value: "NOT", line: 35, colStart: 13, colEnd: 16 },
  { type: "FALSE", value: "FALSE", line: 35, colStart: 17, colEnd: 22 },
  { type: "RPAREN", value: ")", line: 35, colStart: 22, colEnd: 23 },
  { type: "THEN", value: "THEN", line: 35, colStart: 24, colEnd: 28 },
  { type: "WRITE", value: "WRITE", line: 35, colStart: 29, colEnd: 34 },
  { type: "LPAREN", value: "(", line: 35, colStart: 34, colEnd: 35 },
  { type: "IDENT", value: "result", line: 35, colStart: 35, colEnd: 41 },
  { type: "RPAREN", value: ")", line: 35, colStart: 41, colEnd: 42 },
  { type: "SEMI", value: ";", line: 35, colStart: 42, colEnd: 43 },
  { type: "ELSE", value: "ELSE", line: 35, colStart: 44, colEnd: 48 },
  { type: "WRITE", value: "WRITE", line: 35, colStart: 49, colEnd: 54 },
  { type: "LPAREN", value: "(", line: 35, colStart: 54, colEnd: 55 },
  { type: "IDENT", value: "mid", line: 35, colStart: 55, colEnd: 58 },
  { type: "RPAREN", value: ")", line: 35, colStart: 58, colEnd: 59 },
  { type: "SEMI", value: ";", line: 35, colStart: 59, colEnd: 60 },

  // Line 36: n1:=1;
  { type: "IDENT", value: "n1", line: 36, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 36, colStart: 2, colEnd: 4 },
  { type: "NUMBER", value: "1", line: 36, colStart: 4, colEnd: 5 },
  { type: "SEMI", value: ";", line: 36, colStart: 5, colEnd: 6 },

  // Line 37: n2:=n1+1;
  { type: "IDENT", value: "n2", line: 37, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 37, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n1", line: 37, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 37, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 37, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 37, colStart: 8, colEnd: 9 },

  // Line 38: n3:=n2+1;
  { type: "IDENT", value: "n3", line: 38, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 38, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n2", line: 38, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 38, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 38, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 38, colStart: 8, colEnd: 9 },

  // Line 39: n4:=n3+1;
  { type: "IDENT", value: "n4", line: 39, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 39, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n3", line: 39, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 39, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 39, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 39, colStart: 8, colEnd: 9 },

  // Line 40: n5:=n4+1;
  { type: "IDENT", value: "n5", line: 40, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 40, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n4", line: 40, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 40, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 40, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 40, colStart: 8, colEnd: 9 },

  // Line 41: n6:=n5+1;
  { type: "IDENT", value: "n6", line: 41, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 41, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n5", line: 41, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 41, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 41, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 41, colStart: 8, colEnd: 9 },

  // Line 42: n7:=n6+1;
  { type: "IDENT", value: "n7", line: 42, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 42, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n6", line: 42, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 42, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 42, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 42, colStart: 8, colEnd: 9 },

  // Line 43: n8:=n7+1;
  { type: "IDENT", value: "n8", line: 43, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 43, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n7", line: 43, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 43, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 43, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 43, colStart: 8, colEnd: 9 },

  // Line 44: n9:=n8+1;
  { type: "IDENT", value: "n9", line: 44, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", value: ":=", line: 44, colStart: 2, colEnd: 4 },
  { type: "IDENT", value: "n8", line: 44, colStart: 4, colEnd: 6 },
  { type: "PLUS", value: "+", line: 44, colStart: 6, colEnd: 7 },
  { type: "NUMBER", value: "1", line: 44, colStart: 7, colEnd: 8 },
  { type: "SEMI", value: ";", line: 44, colStart: 8, colEnd: 9 },

  // Line 45: WRITE(n1,n2,n3,n4,n5,n6,n7,n8,n9);
  { type: "WRITE", value: "WRITE", line: 45, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 45, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "n1", line: 45, colStart: 6, colEnd: 8 },
  { type: "COMMA", value: ",", line: 45, colStart: 8, colEnd: 9 },
  { type: "IDENT", value: "n2", line: 45, colStart: 9, colEnd: 11 },
  { type: "COMMA", value: ",", line: 45, colStart: 11, colEnd: 12 },
  { type: "IDENT", value: "n3", line: 45, colStart: 12, colEnd: 14 },
  { type: "COMMA", value: ",", line: 45, colStart: 14, colEnd: 15 },
  { type: "IDENT", value: "n4", line: 45, colStart: 15, colEnd: 17 },
  { type: "COMMA", value: ",", line: 45, colStart: 17, colEnd: 18 },
  { type: "IDENT", value: "n5", line: 45, colStart: 18, colEnd: 20 },
  { type: "COMMA", value: ",", line: 45, colStart: 20, colEnd: 21 },
  { type: "IDENT", value: "n6", line: 45, colStart: 21, colEnd: 23 },
  { type: "COMMA", value: ",", line: 45, colStart: 23, colEnd: 24 },
  { type: "IDENT", value: "n7", line: 45, colStart: 24, colEnd: 26 },
  { type: "COMMA", value: ",", line: 45, colStart: 26, colEnd: 27 },
  { type: "IDENT", value: "n8", line: 45, colStart: 27, colEnd: 29 },
  { type: "COMMA", value: ",", line: 45, colStart: 29, colEnd: 30 },
  { type: "IDENT", value: "n9", line: 45, colStart: 30, colEnd: 32 },
  { type: "RPAREN", value: ")", line: 45, colStart: 32, colEnd: 33 },
  { type: "SEMI", value: ";", line: 45, colStart: 33, colEnd: 34 },

  // Line 46: IF ((TRUE)) THEN WRITE(n9); ELSE WRITE(n1);
  { type: "IF", value: "IF", line: 46, colStart: 0, colEnd: 2 },
  { type: "LPAREN", value: "(", line: 46, colStart: 3, colEnd: 4 },
  { type: "LPAREN", value: "(", line: 46, colStart: 4, colEnd: 5 },
  { type: "TRUE", value: "TRUE", line: 46, colStart: 5, colEnd: 9 },
  { type: "RPAREN", value: ")", line: 46, colStart: 9, colEnd: 10 },
  { type: "RPAREN", value: ")", line: 46, colStart: 10, colEnd: 11 },
  { type: "THEN", value: "THEN", line: 46, colStart: 12, colEnd: 16 },
  { type: "WRITE", value: "WRITE", line: 46, colStart: 17, colEnd: 22 },
  { type: "LPAREN", value: "(", line: 46, colStart: 22, colEnd: 23 },
  { type: "IDENT", value: "n9", line: 46, colStart: 23, colEnd: 25 },
  { type: "RPAREN", value: ")", line: 46, colStart: 25, colEnd: 26 },
  { type: "SEMI", value: ";", line: 46, colStart: 26, colEnd: 27 },
  { type: "ELSE", value: "ELSE", line: 46, colStart: 28, colEnd: 32 },
  { type: "WRITE", value: "WRITE", line: 46, colStart: 33, colEnd: 38 },
  { type: "LPAREN", value: "(", line: 46, colStart: 38, colEnd: 39 },
  { type: "IDENT", value: "n1", line: 46, colStart: 39, colEnd: 41 },
  { type: "RPAREN", value: ")", line: 46, colStart: 41, colEnd: 42 },
  { type: "SEMI", value: ";", line: 46, colStart: 42, colEnd: 43 },

  // Line 47: foo:=1;
  { type: "IDENT", value: "foo", line: 47, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", value: ":=", line: 47, colStart: 3, colEnd: 5 },
  { type: "NUMBER", value: "1", line: 47, colStart: 5, colEnd: 6 },
  { type: "SEMI", value: ";", line: 47, colStart: 6, colEnd: 7 },

  // Line 48: bar:=foo+2;
  { type: "IDENT", value: "bar", line: 48, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", value: ":=", line: 48, colStart: 3, colEnd: 5 },
  { type: "IDENT", value: "foo", line: 48, colStart: 5, colEnd: 8 },
  { type: "PLUS", value: "+", line: 48, colStart: 8, colEnd: 9 },
  { type: "NUMBER", value: "2", line: 48, colStart: 9, colEnd: 10 },
  { type: "SEMI", value: ";", line: 48, colStart: 10, colEnd: 11 },

  // Line 49: baz:=bar-1;
  { type: "IDENT", value: "baz", line: 49, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", value: ":=", line: 49, colStart: 3, colEnd: 5 },
  { type: "IDENT", value: "bar", line: 49, colStart: 5, colEnd: 8 },
  { type: "MINUS", value: "-", line: 49, colStart: 8, colEnd: 9 },
  { type: "NUMBER", value: "1", line: 49, colStart: 9, colEnd: 10 },
  { type: "SEMI", value: ";", line: 49, colStart: 10, colEnd: 11 },

  // Line 50: WRITE(foo,bar,baz);
  { type: "WRITE", value: "WRITE", line: 50, colStart: 0, colEnd: 5 },
  { type: "LPAREN", value: "(", line: 50, colStart: 5, colEnd: 6 },
  { type: "IDENT", value: "foo", line: 50, colStart: 6, colEnd: 9 },
  { type: "COMMA", value: ",", line: 50, colStart: 9, colEnd: 10 },
  { type: "IDENT", value: "bar", line: 50, colStart: 10, colEnd: 13 },
  { type: "COMMA", value: ",", line: 50, colStart: 13, colEnd: 14 },
  { type: "IDENT", value: "baz", line: 50, colStart: 14, colEnd: 17 },
  { type: "RPAREN", value: ")", line: 50, colStart: 17, colEnd: 18 },
  { type: "SEMI", value: ";", line: 50, colStart: 18, colEnd: 19 },

  // Line 51: END
  { type: "END", value: "END", line: 51, colStart: 0, colEnd: 3 },
] satisfies Array<Token>;

export const TREE_TEST: ParseTreeNode = {
  id: "root",
  data: randomToken(),
  children: [
    {
      id: "n1",
      data: randomToken(),
      children: [
        { id: "n1a", data: randomToken(), children: [{ id: "n1a1", data: randomToken() }] },
        {
          id: "n1b",
          data: randomToken(),
          children: [
            { id: "n1b1", data: randomToken() },
            { id: "n1b2", data: randomToken() },
          ],
        },
        {
          id: "n1c",
          data: randomToken(),
          children: [
            { id: "n1c1", data: randomToken(), children: [{ id: "n1c1a", data: randomToken() }] },
            {
              id: "n1c2",
              data: randomToken(),
              children: [
                { id: "n1c2a", data: randomToken() },
                { id: "n1c2b", data: randomToken() },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "n2",
      data: randomToken(),
      children: [
        {
          id: "n2a",
          data: randomToken(),
          children: [
            { id: "n2a1", data: randomToken() },
            { id: "n2a2", data: randomToken() },
          ],
        },
        {
          id: "n2b",
          data: randomToken(),
          children: [
            { id: "n2b1", data: randomToken(), children: [{ id: "n2b1a", data: randomToken() }] },
            {
              id: "n2b2",
              data: randomToken(),
              children: [
                {
                  id: "n2b2a",
                  data: randomToken(),
                  children: [
                    { id: "n2b2a1", data: randomToken() },
                    { id: "n2b2a2", data: randomToken() },
                    { id: "n2b2a3", data: randomToken() },
                  ],
                },
                {
                  id: "n2b2b",
                  data: randomToken(),
                  children: [
                    {
                      id: "n2b2b1",
                      data: randomToken(),
                      children: [{ id: "n2b2b1a", data: randomToken() }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "n3",
      data: randomToken(),
      children: [
        { id: "n3a", data: randomToken() },
        { id: "n3b", data: randomToken() },
      ],
    },
  ],
} satisfies ParseTreeNode;

export const TREE_TEST_SMALL: ParseTreeNode = {
  id: "a",
  data: randomToken(),
  children: [],
};
