import { ParseTreeNode, Token } from "~/lib/types";

export const TOKENS_TEST: Array<Token> = [
  // Line 1: BEGIN
  { type: "BEGIN", line: 1, colStart: 0, colEnd: 5 },

  // Line 2: READ(a,b,c,d,e);
  { type: "READ", line: 2, colStart: 0, colEnd: 4 },
  { type: "LPAREN", line: 2, colStart: 4, colEnd: 5 },
  { type: "IDENT", line: 2, colStart: 5, colEnd: 6 },
  { type: "COMMA", line: 2, colStart: 6, colEnd: 7 },
  { type: "IDENT", line: 2, colStart: 7, colEnd: 8 },
  { type: "COMMA", line: 2, colStart: 8, colEnd: 9 },
  { type: "IDENT", line: 2, colStart: 9, colEnd: 10 },
  { type: "COMMA", line: 2, colStart: 10, colEnd: 11 },
  { type: "IDENT", line: 2, colStart: 11, colEnd: 12 },
  { type: "COMMA", line: 2, colStart: 12, colEnd: 13 },
  { type: "IDENT", line: 2, colStart: 13, colEnd: 14 },
  { type: "RPAREN", line: 2, colStart: 14, colEnd: 15 },
  { type: "SEMI", line: 2, colStart: 15, colEnd: 16 },

  // Line 3: x:=a+b;
  { type: "IDENT", line: 3, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 3, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 3, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 3, colStart: 4, colEnd: 5 },
  { type: "IDENT", line: 3, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 3, colStart: 6, colEnd: 7 },

  // Line 4: y:=x-c;
  { type: "IDENT", line: 4, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 4, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 4, colStart: 3, colEnd: 4 },
  { type: "MINUS", line: 4, colStart: 4, colEnd: 5 },
  { type: "IDENT", line: 4, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 4, colStart: 6, colEnd: 7 },

  // Line 5: z:=y+10;
  { type: "IDENT", line: 5, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 5, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 5, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 5, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 5, colStart: 5, colEnd: 7 },
  { type: "SEMI", line: 5, colStart: 7, colEnd: 8 },

  // Line 6: total:=z+d;
  { type: "IDENT", line: 6, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 6, colStart: 5, colEnd: 7 },
  { type: "IDENT", line: 6, colStart: 7, colEnd: 8 },
  { type: "PLUS", line: 6, colStart: 8, colEnd: 9 },
  { type: "IDENT", line: 6, colStart: 9, colEnd: 10 },
  { type: "SEMI", line: 6, colStart: 10, colEnd: 11 },

  // Line 7: temp:=total-e;
  { type: "IDENT", line: 7, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", line: 7, colStart: 4, colEnd: 6 },
  { type: "IDENT", line: 7, colStart: 6, colEnd: 11 },
  { type: "MINUS", line: 7, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 7, colStart: 12, colEnd: 13 },
  { type: "SEMI", line: 7, colStart: 13, colEnd: 14 },

  // Line 8: WRITE(a,b,c,d,e);
  { type: "WRITE", line: 8, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 8, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 8, colStart: 6, colEnd: 7 },
  { type: "COMMA", line: 8, colStart: 7, colEnd: 8 },
  { type: "IDENT", line: 8, colStart: 8, colEnd: 9 },
  { type: "COMMA", line: 8, colStart: 9, colEnd: 10 },
  { type: "IDENT", line: 8, colStart: 10, colEnd: 11 },
  { type: "COMMA", line: 8, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 8, colStart: 12, colEnd: 13 },
  { type: "COMMA", line: 8, colStart: 13, colEnd: 14 },
  { type: "IDENT", line: 8, colStart: 14, colEnd: 15 },
  { type: "RPAREN", line: 8, colStart: 15, colEnd: 16 },
  { type: "SEMI", line: 8, colStart: 16, colEnd: 17 },

  // Line 9: WRITE(x,y,z,total,temp);
  { type: "WRITE", line: 9, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 9, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 9, colStart: 6, colEnd: 7 },
  { type: "COMMA", line: 9, colStart: 7, colEnd: 8 },
  { type: "IDENT", line: 9, colStart: 8, colEnd: 9 },
  { type: "COMMA", line: 9, colStart: 9, colEnd: 10 },
  { type: "IDENT", line: 9, colStart: 10, colEnd: 11 },
  { type: "COMMA", line: 9, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 9, colStart: 12, colEnd: 17 },
  { type: "COMMA", line: 9, colStart: 17, colEnd: 18 },
  { type: "IDENT", line: 9, colStart: 18, colEnd: 22 },
  { type: "RPAREN", line: 9, colStart: 22, colEnd: 23 },
  { type: "SEMI", line: 9, colStart: 23, colEnd: 24 },

  // Line 10: IF TRUE THEN WRITE(x); ELSE WRITE(y);
  { type: "IF", line: 10, colStart: 0, colEnd: 2 },
  { type: "TRUE", line: 10, colStart: 3, colEnd: 7 },
  { type: "THEN", line: 10, colStart: 8, colEnd: 12 },
  { type: "WRITE", line: 10, colStart: 13, colEnd: 18 },
  { type: "LPAREN", line: 10, colStart: 18, colEnd: 19 },
  { type: "IDENT", line: 10, colStart: 19, colEnd: 20 },
  { type: "RPAREN", line: 10, colStart: 20, colEnd: 21 },
  { type: "SEMI", line: 10, colStart: 21, colEnd: 22 },
  { type: "ELSE", line: 10, colStart: 23, colEnd: 27 },
  { type: "WRITE", line: 10, colStart: 28, colEnd: 33 },
  { type: "LPAREN", line: 10, colStart: 33, colEnd: 34 },
  { type: "IDENT", line: 10, colStart: 34, colEnd: 35 },
  { type: "RPAREN", line: 10, colStart: 35, colEnd: 36 },
  { type: "SEMI", line: 10, colStart: 36, colEnd: 37 },

  // Line 11: IF FALSE THEN READ(m); ELSE WRITE(z);
  { type: "IF", line: 11, colStart: 0, colEnd: 2 },
  { type: "FALSE", line: 11, colStart: 3, colEnd: 8 },
  { type: "THEN", line: 11, colStart: 9, colEnd: 13 },
  { type: "READ", line: 11, colStart: 14, colEnd: 18 },
  { type: "LPAREN", line: 11, colStart: 18, colEnd: 19 },
  { type: "IDENT", line: 11, colStart: 19, colEnd: 20 },
  { type: "RPAREN", line: 11, colStart: 20, colEnd: 21 },
  { type: "SEMI", line: 11, colStart: 21, colEnd: 22 },
  { type: "ELSE", line: 11, colStart: 23, colEnd: 27 },
  { type: "WRITE", line: 11, colStart: 28, colEnd: 33 },
  { type: "LPAREN", line: 11, colStart: 33, colEnd: 34 },
  { type: "IDENT", line: 11, colStart: 34, colEnd: 35 },
  { type: "RPAREN", line: 11, colStart: 35, colEnd: 36 },
  { type: "SEMI", line: 11, colStart: 36, colEnd: 37 },

  // Line 12: alpha:=1;
  { type: "IDENT", line: 12, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 12, colStart: 5, colEnd: 7 },
  { type: "NUMBER", line: 12, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 12, colStart: 8, colEnd: 9 },

  // Line 13: beta:=alpha+2;
  { type: "IDENT", line: 13, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", line: 13, colStart: 4, colEnd: 6 },
  { type: "IDENT", line: 13, colStart: 6, colEnd: 11 },
  { type: "PLUS", line: 13, colStart: 11, colEnd: 12 },
  { type: "NUMBER", line: 13, colStart: 12, colEnd: 13 },
  { type: "SEMI", line: 13, colStart: 13, colEnd: 14 },

  // Line 14: gamma:=beta+3;
  { type: "IDENT", line: 14, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 14, colStart: 5, colEnd: 7 },
  { type: "IDENT", line: 14, colStart: 7, colEnd: 11 },
  { type: "PLUS", line: 14, colStart: 11, colEnd: 12 },
  { type: "NUMBER", line: 14, colStart: 12, colEnd: 13 },
  { type: "SEMI", line: 14, colStart: 13, colEnd: 14 },

  // Line 15: delta:=gamma-4;
  { type: "IDENT", line: 15, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 15, colStart: 5, colEnd: 7 },
  { type: "IDENT", line: 15, colStart: 7, colEnd: 12 },
  { type: "MINUS", line: 15, colStart: 12, colEnd: 13 },
  { type: "NUMBER", line: 15, colStart: 13, colEnd: 14 },
  { type: "SEMI", line: 15, colStart: 14, colEnd: 15 },

  // Line 16: epsilon:=delta+5;
  { type: "IDENT", line: 16, colStart: 0, colEnd: 7 },
  { type: "ASSIGN", line: 16, colStart: 7, colEnd: 9 },
  { type: "IDENT", line: 16, colStart: 9, colEnd: 14 },
  { type: "PLUS", line: 16, colStart: 14, colEnd: 15 },
  { type: "NUMBER", line: 16, colStart: 15, colEnd: 16 },
  { type: "SEMI", line: 16, colStart: 16, colEnd: 17 },

  // Line 17: WRITE(alpha,beta,gamma,delta,epsilon);
  { type: "WRITE", line: 17, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 17, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 17, colStart: 6, colEnd: 11 },
  { type: "COMMA", line: 17, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 17, colStart: 12, colEnd: 16 },
  { type: "COMMA", line: 17, colStart: 16, colEnd: 17 },
  { type: "IDENT", line: 17, colStart: 17, colEnd: 22 },
  { type: "COMMA", line: 17, colStart: 22, colEnd: 23 },
  { type: "IDENT", line: 17, colStart: 23, colEnd: 28 },
  { type: "COMMA", line: 17, colStart: 28, colEnd: 29 },
  { type: "IDENT", line: 17, colStart: 29, colEnd: 36 },
  { type: "RPAREN", line: 17, colStart: 36, colEnd: 37 },
  { type: "SEMI", line: 17, colStart: 37, colEnd: 38 },

  // Line 18: IF NOT FALSE THEN WRITE(epsilon); ELSE WRITE(alpha);
  { type: "IF", line: 18, colStart: 0, colEnd: 2 },
  { type: "NOT", line: 18, colStart: 3, colEnd: 6 },
  { type: "FALSE", line: 18, colStart: 7, colEnd: 12 },
  { type: "THEN", line: 18, colStart: 13, colEnd: 17 },
  { type: "WRITE", line: 18, colStart: 18, colEnd: 23 },
  { type: "LPAREN", line: 18, colStart: 23, colEnd: 24 },
  { type: "IDENT", line: 18, colStart: 24, colEnd: 31 },
  { type: "RPAREN", line: 18, colStart: 31, colEnd: 32 },
  { type: "SEMI", line: 18, colStart: 32, colEnd: 33 },
  { type: "ELSE", line: 18, colStart: 34, colEnd: 38 },
  { type: "WRITE", line: 18, colStart: 39, colEnd: 44 },
  { type: "LPAREN", line: 18, colStart: 44, colEnd: 45 },
  { type: "IDENT", line: 18, colStart: 45, colEnd: 50 },
  { type: "RPAREN", line: 18, colStart: 50, colEnd: 51 },
  { type: "SEMI", line: 18, colStart: 51, colEnd: 52 },

  // Line 19: u:=1;
  { type: "IDENT", line: 19, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 19, colStart: 1, colEnd: 3 },
  { type: "NUMBER", line: 19, colStart: 3, colEnd: 4 },
  { type: "SEMI", line: 19, colStart: 4, colEnd: 5 },

  // Line 20: v:=u+2;
  { type: "IDENT", line: 20, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 20, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 20, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 20, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 20, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 20, colStart: 6, colEnd: 7 },

  // Line 21: w:=v+3;
  { type: "IDENT", line: 21, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 21, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 21, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 21, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 21, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 21, colStart: 6, colEnd: 7 },

  // Line 22: p:=w-4;
  { type: "IDENT", line: 22, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 22, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 22, colStart: 3, colEnd: 4 },
  { type: "MINUS", line: 22, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 22, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 22, colStart: 6, colEnd: 7 },

  // Line 23: q:=p+5;
  { type: "IDENT", line: 23, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 23, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 23, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 23, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 23, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 23, colStart: 6, colEnd: 7 },

  // Line 24: r:=q-6;
  { type: "IDENT", line: 24, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 24, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 24, colStart: 3, colEnd: 4 },
  { type: "MINUS", line: 24, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 24, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 24, colStart: 6, colEnd: 7 },

  // Line 25: s:=r+7;
  { type: "IDENT", line: 25, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 25, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 25, colStart: 3, colEnd: 4 },
  { type: "PLUS", line: 25, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 25, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 25, colStart: 6, colEnd: 7 },

  // Line 26: t:=s-8;
  { type: "IDENT", line: 26, colStart: 0, colEnd: 1 },
  { type: "ASSIGN", line: 26, colStart: 1, colEnd: 3 },
  { type: "IDENT", line: 26, colStart: 3, colEnd: 4 },
  { type: "MINUS", line: 26, colStart: 4, colEnd: 5 },
  { type: "NUMBER", line: 26, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 26, colStart: 6, colEnd: 7 },

  // Line 27: WRITE(u,v,w,p,q,r,s,t);
  { type: "WRITE", line: 27, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 27, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 27, colStart: 6, colEnd: 7 },
  { type: "COMMA", line: 27, colStart: 7, colEnd: 8 },
  { type: "IDENT", line: 27, colStart: 8, colEnd: 9 },
  { type: "COMMA", line: 27, colStart: 9, colEnd: 10 },
  { type: "IDENT", line: 27, colStart: 10, colEnd: 11 },
  { type: "COMMA", line: 27, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 27, colStart: 12, colEnd: 13 },
  { type: "COMMA", line: 27, colStart: 13, colEnd: 14 },
  { type: "IDENT", line: 27, colStart: 14, colEnd: 15 },
  { type: "COMMA", line: 27, colStart: 15, colEnd: 16 },
  { type: "IDENT", line: 27, colStart: 16, colEnd: 17 },
  { type: "COMMA", line: 27, colStart: 17, colEnd: 18 },
  { type: "IDENT", line: 27, colStart: 18, colEnd: 19 },
  { type: "COMMA", line: 27, colStart: 19, colEnd: 20 },
  { type: "IDENT", line: 27, colStart: 20, colEnd: 21 },
  { type: "RPAREN", line: 27, colStart: 21, colEnd: 22 },
  { type: "SEMI", line: 27, colStart: 22, colEnd: 23 },

  // Line 28: IF TRUE OR FALSE THEN WRITE(t); ELSE WRITE(u);
  { type: "IF", line: 28, colStart: 0, colEnd: 2 },
  { type: "TRUE", line: 28, colStart: 3, colEnd: 7 },
  { type: "OR", line: 28, colStart: 8, colEnd: 10 },
  { type: "FALSE", line: 28, colStart: 11, colEnd: 16 },
  { type: "THEN", line: 28, colStart: 17, colEnd: 21 },
  { type: "WRITE", line: 28, colStart: 22, colEnd: 27 },
  { type: "LPAREN", line: 28, colStart: 27, colEnd: 28 },
  { type: "IDENT", line: 28, colStart: 28, colEnd: 29 },
  { type: "RPAREN", line: 28, colStart: 29, colEnd: 30 },
  { type: "SEMI", line: 28, colStart: 30, colEnd: 31 },
  { type: "ELSE", line: 28, colStart: 32, colEnd: 36 },
  { type: "WRITE", line: 28, colStart: 37, colEnd: 42 },
  { type: "LPAREN", line: 28, colStart: 42, colEnd: 43 },
  { type: "IDENT", line: 28, colStart: 43, colEnd: 44 },
  { type: "RPAREN", line: 28, colStart: 44, colEnd: 45 },
  { type: "SEMI", line: 28, colStart: 45, colEnd: 46 },

  // Line 29: left:=1;
  { type: "IDENT", line: 29, colStart: 0, colEnd: 4 },
  { type: "ASSIGN", line: 29, colStart: 4, colEnd: 6 },
  { type: "NUMBER", line: 29, colStart: 6, colEnd: 7 },
  { type: "SEMI", line: 29, colStart: 7, colEnd: 8 },

  // Line 30: right:=2;
  { type: "IDENT", line: 30, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 30, colStart: 5, colEnd: 7 },
  { type: "NUMBER", line: 30, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 30, colStart: 8, colEnd: 9 },

  // Line 31: mid:=left+right;
  { type: "IDENT", line: 31, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", line: 31, colStart: 3, colEnd: 5 },
  { type: "IDENT", line: 31, colStart: 5, colEnd: 9 },
  { type: "PLUS", line: 31, colStart: 9, colEnd: 10 },
  { type: "IDENT", line: 31, colStart: 10, colEnd: 15 },
  { type: "SEMI", line: 31, colStart: 15, colEnd: 16 },

  // Line 32: value:=mid+3;
  { type: "IDENT", line: 32, colStart: 0, colEnd: 5 },
  { type: "ASSIGN", line: 32, colStart: 5, colEnd: 7 },
  { type: "IDENT", line: 32, colStart: 7, colEnd: 10 },
  { type: "PLUS", line: 32, colStart: 10, colEnd: 11 },
  { type: "NUMBER", line: 32, colStart: 11, colEnd: 12 },
  { type: "SEMI", line: 32, colStart: 12, colEnd: 13 },

  // Line 33: result:=value-1;
  { type: "IDENT", line: 33, colStart: 0, colEnd: 6 },
  { type: "ASSIGN", line: 33, colStart: 6, colEnd: 8 },
  { type: "IDENT", line: 33, colStart: 8, colEnd: 13 },
  { type: "MINUS", line: 33, colStart: 13, colEnd: 14 },
  { type: "NUMBER", line: 33, colStart: 14, colEnd: 15 },
  { type: "SEMI", line: 33, colStart: 15, colEnd: 16 },

  // Line 34: WRITE(left,right,mid,value,result);
  { type: "WRITE", line: 34, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 34, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 34, colStart: 6, colEnd: 10 },
  { type: "COMMA", line: 34, colStart: 10, colEnd: 11 },
  { type: "IDENT", line: 34, colStart: 11, colEnd: 16 },
  { type: "COMMA", line: 34, colStart: 16, colEnd: 17 },
  { type: "IDENT", line: 34, colStart: 17, colEnd: 20 },
  { type: "COMMA", line: 34, colStart: 20, colEnd: 21 },
  { type: "IDENT", line: 34, colStart: 21, colEnd: 26 },
  { type: "COMMA", line: 34, colStart: 26, colEnd: 27 },
  { type: "IDENT", line: 34, colStart: 27, colEnd: 33 },
  { type: "RPAREN", line: 34, colStart: 33, colEnd: 34 },
  { type: "SEMI", line: 34, colStart: 34, colEnd: 35 },

  // Line 35: IF (TRUE AND NOT FALSE) THEN WRITE(result);
  // ELSE WRITE(mid);
  { type: "IF", line: 35, colStart: 0, colEnd: 2 },
  { type: "LPAREN", line: 35, colStart: 3, colEnd: 4 },
  { type: "TRUE", line: 35, colStart: 4, colEnd: 8 },
  { type: "AND", line: 35, colStart: 9, colEnd: 12 },
  { type: "NOT", line: 35, colStart: 13, colEnd: 16 },
  { type: "FALSE", line: 35, colStart: 17, colEnd: 22 },
  { type: "RPAREN", line: 35, colStart: 22, colEnd: 23 },
  { type: "THEN", line: 35, colStart: 24, colEnd: 28 },
  { type: "WRITE", line: 35, colStart: 29, colEnd: 34 },
  { type: "LPAREN", line: 35, colStart: 34, colEnd: 35 },
  { type: "IDENT", line: 35, colStart: 35, colEnd: 41 },
  { type: "RPAREN", line: 35, colStart: 41, colEnd: 42 },
  { type: "SEMI", line: 35, colStart: 42, colEnd: 43 },
  { type: "ELSE", line: 35, colStart: 44, colEnd: 48 },
  { type: "WRITE", line: 35, colStart: 49, colEnd: 54 },
  { type: "LPAREN", line: 35, colStart: 54, colEnd: 55 },
  { type: "IDENT", line: 35, colStart: 55, colEnd: 58 },
  { type: "RPAREN", line: 35, colStart: 58, colEnd: 59 },
  { type: "SEMI", line: 35, colStart: 59, colEnd: 60 },

  // Line 36: n1:=1;
  { type: "IDENT", line: 36, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 36, colStart: 2, colEnd: 4 },
  { type: "NUMBER", line: 36, colStart: 4, colEnd: 5 },
  { type: "SEMI", line: 36, colStart: 5, colEnd: 6 },

  // Line 37: n2:=n1+1;
  { type: "IDENT", line: 37, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 37, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 37, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 37, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 37, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 37, colStart: 8, colEnd: 9 },

  // Line 38: n3:=n2+1;
  { type: "IDENT", line: 38, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 38, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 38, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 38, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 38, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 38, colStart: 8, colEnd: 9 },

  // Line 39: n4:=n3+1;
  { type: "IDENT", line: 39, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 39, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 39, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 39, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 39, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 39, colStart: 8, colEnd: 9 },

  // Line 40: n5:=n4+1;
  { type: "IDENT", line: 40, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 40, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 40, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 40, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 40, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 40, colStart: 8, colEnd: 9 },

  // Line 41: n6:=n5+1;
  { type: "IDENT", line: 41, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 41, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 41, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 41, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 41, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 41, colStart: 8, colEnd: 9 },

  // Line 42: n7:=n6+1;
  { type: "IDENT", line: 42, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 42, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 42, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 42, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 42, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 42, colStart: 8, colEnd: 9 },

  // Line 43: n8:=n7+1;
  { type: "IDENT", line: 43, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 43, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 43, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 43, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 43, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 43, colStart: 8, colEnd: 9 },

  // Line 44: n9:=n8+1;
  { type: "IDENT", line: 44, colStart: 0, colEnd: 2 },
  { type: "ASSIGN", line: 44, colStart: 2, colEnd: 4 },
  { type: "IDENT", line: 44, colStart: 4, colEnd: 6 },
  { type: "PLUS", line: 44, colStart: 6, colEnd: 7 },
  { type: "NUMBER", line: 44, colStart: 7, colEnd: 8 },
  { type: "SEMI", line: 44, colStart: 8, colEnd: 9 },

  // Line 45: WRITE(n1,n2,n3,n4,n5,n6,n7,n8,n9);
  { type: "WRITE", line: 45, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 45, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 45, colStart: 6, colEnd: 8 },
  { type: "COMMA", line: 45, colStart: 8, colEnd: 9 },
  { type: "IDENT", line: 45, colStart: 9, colEnd: 11 },
  { type: "COMMA", line: 45, colStart: 11, colEnd: 12 },
  { type: "IDENT", line: 45, colStart: 12, colEnd: 14 },
  { type: "COMMA", line: 45, colStart: 14, colEnd: 15 },
  { type: "IDENT", line: 45, colStart: 15, colEnd: 17 },
  { type: "COMMA", line: 45, colStart: 17, colEnd: 18 },
  { type: "IDENT", line: 45, colStart: 18, colEnd: 20 },
  { type: "COMMA", line: 45, colStart: 20, colEnd: 21 },
  { type: "IDENT", line: 45, colStart: 21, colEnd: 23 },
  { type: "COMMA", line: 45, colStart: 23, colEnd: 24 },
  { type: "IDENT", line: 45, colStart: 24, colEnd: 26 },
  { type: "COMMA", line: 45, colStart: 26, colEnd: 27 },
  { type: "IDENT", line: 45, colStart: 27, colEnd: 29 },
  { type: "COMMA", line: 45, colStart: 29, colEnd: 30 },
  { type: "IDENT", line: 45, colStart: 30, colEnd: 32 },
  { type: "RPAREN", line: 45, colStart: 32, colEnd: 33 },
  { type: "SEMI", line: 45, colStart: 33, colEnd: 34 },

  // Line 46: IF ((TRUE)) THEN WRITE(n9); ELSE WRITE(n1);
  { type: "IF", line: 46, colStart: 0, colEnd: 2 },
  { type: "LPAREN", line: 46, colStart: 3, colEnd: 4 },
  { type: "LPAREN", line: 46, colStart: 4, colEnd: 5 },
  { type: "TRUE", line: 46, colStart: 5, colEnd: 9 },
  { type: "RPAREN", line: 46, colStart: 9, colEnd: 10 },
  { type: "RPAREN", line: 46, colStart: 10, colEnd: 11 },
  { type: "THEN", line: 46, colStart: 12, colEnd: 16 },
  { type: "WRITE", line: 46, colStart: 17, colEnd: 22 },
  { type: "LPAREN", line: 46, colStart: 22, colEnd: 23 },
  { type: "IDENT", line: 46, colStart: 23, colEnd: 25 },
  { type: "RPAREN", line: 46, colStart: 25, colEnd: 26 },
  { type: "SEMI", line: 46, colStart: 26, colEnd: 27 },
  { type: "ELSE", line: 46, colStart: 28, colEnd: 32 },
  { type: "WRITE", line: 46, colStart: 33, colEnd: 38 },
  { type: "LPAREN", line: 46, colStart: 38, colEnd: 39 },
  { type: "IDENT", line: 46, colStart: 39, colEnd: 41 },
  { type: "RPAREN", line: 46, colStart: 41, colEnd: 42 },
  { type: "SEMI", line: 46, colStart: 42, colEnd: 43 },

  // Line 47: foo:=1;
  { type: "IDENT", line: 47, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", line: 47, colStart: 3, colEnd: 5 },
  { type: "NUMBER", line: 47, colStart: 5, colEnd: 6 },
  { type: "SEMI", line: 47, colStart: 6, colEnd: 7 },

  // Line 48: bar:=foo+2;
  { type: "IDENT", line: 48, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", line: 48, colStart: 3, colEnd: 5 },
  { type: "IDENT", line: 48, colStart: 5, colEnd: 8 },
  { type: "PLUS", line: 48, colStart: 8, colEnd: 9 },
  { type: "NUMBER", line: 48, colStart: 9, colEnd: 10 },
  { type: "SEMI", line: 48, colStart: 10, colEnd: 11 },

  // Line 49: baz:=bar-1;
  { type: "IDENT", line: 49, colStart: 0, colEnd: 3 },
  { type: "ASSIGN", line: 49, colStart: 3, colEnd: 5 },
  { type: "IDENT", line: 49, colStart: 5, colEnd: 8 },
  { type: "MINUS", line: 49, colStart: 8, colEnd: 9 },
  { type: "NUMBER", line: 49, colStart: 9, colEnd: 10 },
  { type: "SEMI", line: 49, colStart: 10, colEnd: 11 },

  // Line 50: WRITE(foo,bar,baz);
  { type: "WRITE", line: 50, colStart: 0, colEnd: 5 },
  { type: "LPAREN", line: 50, colStart: 5, colEnd: 6 },
  { type: "IDENT", line: 50, colStart: 6, colEnd: 9 },
  { type: "COMMA", line: 50, colStart: 9, colEnd: 10 },
  { type: "IDENT", line: 50, colStart: 10, colEnd: 13 },
  { type: "COMMA", line: 50, colStart: 13, colEnd: 14 },
  { type: "IDENT", line: 50, colStart: 14, colEnd: 17 },
  { type: "RPAREN", line: 50, colStart: 17, colEnd: 18 },
  { type: "SEMI", line: 50, colStart: 18, colEnd: 19 },

  // Line 51: END
  { type: "END", line: 51, colStart: 0, colEnd: 3 },
] satisfies Array<Token>;

export const TREE_TEST: ParseTreeNode = {
  id: "root",
  label: "S",
  children: [
    {
      id: "n1",
      label: "NP",
      children: [
        { id: "n1a", label: "d", children: [{ id: "n1a1", label: "t" }] },
        {
          id: "n1b",
          label: "N",
          children: [
            { id: "n1b1", label: "c" },
            { id: "n1b2", label: "s" },
          ],
        },
        {
          id: "n1c",
          label: "AP",
          children: [
            { id: "n1c1", label: "A", children: [{ id: "n1c1a", label: "l" }] },
            {
              id: "n1c2",
              label: "a",
              children: [
                { id: "n1c2a", label: "v" },
                { id: "n1c2b", label: "q" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "n2",
      label: "VP",
      children: [
        {
          id: "n2a",
          label: "V",
          children: [
            { id: "n2a1", label: "j" },
            { id: "n2a2", label: "r" },
          ],
        },
        {
          id: "n2b",
          label: "PP",
          children: [
            { id: "n2b1", label: "P", children: [{ id: "n2b1a", label: "o" }] },
            {
              id: "n2b2",
              label: "NP",
              children: [
                {
                  id: "n2b2a",
                  label: "N",
                  children: [
                    { id: "n2b2a1", label: "m" },
                    { id: "n2b2a2", label: "f" },
                    { id: "n2b2a3", label: "h" },
                  ],
                },
                {
                  id: "n2b2b",
                  label: "AP",
                  children: [
                    { id: "n2b2b1", label: "A", children: [{ id: "n2b2b1a", label: "h" }] },
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
      label: "A",
      children: [
        { id: "n3a", label: "y" },
        { id: "n3b", label: "t" },
      ],
    },
  ],
} satisfies ParseTreeNode;

export const TREE_TEST_SMALL: ParseTreeNode = {
  id: "a",
  label: "A",
  children: [],
};
