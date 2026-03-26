import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {ParseTreeNode} from "~/components/home";

export const cn = (...inputs: Array<ClassValue>): string => {
  return twMerge(clsx(inputs));
};

export const formatLineNumber = (
  lineNum: number,
  totalLines: number,
): string => {
  const width: number = totalLines.toString().length;
  return lineNum.toString().padStart(width, ' ');
};

export const insertNodeAtRandom = (node: ParseTreeNode): { tree: ParseTreeNode; nodeId: string } => {
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