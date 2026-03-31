import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { NonTerminal, ParseTreeNode, StackItem, TokenType } from "~/lib/types";

export const cn = (...inputs: Array<ClassValue>): string => {
  return twMerge(clsx(inputs));
};

export const formatLineNumber = (lineNum: number, totalLines: number): string => {
  const width: number = totalLines.toString().length;
  return lineNum.toString().padStart(width, " ");
};

export type NodeInsertResult = {
  tree: ParseTreeNode;
  nodeId: string;
};

export const insertNodeAtRandom = (node: ParseTreeNode): NodeInsertResult => {
  const nodeId = `node-${Date.now()}-${Math.random()}`;
  const newNode: ParseTreeNode = {
    id: nodeId,
    label: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    children: [],
  };

  if (!node.children || Math.random() > 0.5 || node.children.length === 0) {
    return {
      tree: {
        ...node,
        children: [...(node.children || []), newNode],
      },
      nodeId,
    };
  }

  const randomIndex = Math.floor(Math.random() * node.children.length);
  const newChildren = [...node.children];
  const result = insertNodeAtRandom(newChildren[randomIndex]);
  newChildren[randomIndex] = result.tree;

  return {
    tree: {
      ...node,
      children: newChildren,
    },
    nodeId: result.nodeId,
  };
};

export const removeNodeById = (node: ParseTreeNode, id: string): ParseTreeNode => {
  if (!node.children) return node;

  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== id)
      .map((child) => removeNodeById(child, id)),
  };
};

export const randomStackItem = (): StackItem => {
  const nonTerminals: NonTerminal[] = [
    "program",
    "statement_list",
    "statement_list'",
    "statement",
    "else",
    "id_list",
    "id_list'",
    "expr_list",
    "expr_list'",
    "expression",
    "expression'",
    "factor",
    "op",
    "bexpr",
    "bexpr'",
    "bterm",
    "bterm'",
    "bfactor",
  ];

  const tokenTypes: TokenType[] = [
    "IDENT",
    "BEGIN",
    "END",
    "READ",
    "WRITE",
    "IF",
    "THEN",
    "ELSE",
    "OR",
    "AND",
    "NOT",
    "TRUE",
    "FALSE",
    "NUMBER",
    "ASSIGN",
    "PLUS",
    "MINUS",
    "SEMI",
    "LPAREN",
    "RPAREN",
    "COMMA",
  ];

  const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  if (Math.random() < 0.5) {
    return random(nonTerminals);
  }

  return {
    type: random(tokenTypes),
    line: Math.floor(Math.random() * 10),
    colStart: Math.floor(Math.random() * 20),
    colEnd: Math.floor(Math.random() * 20),
  };
};
