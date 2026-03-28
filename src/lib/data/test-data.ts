import {ParseTreeNode, Token} from "~/lib/types";

export const TOKENS_TEST: Array<Token> = [
  {
    type: "ident",
    line: 6,
    colStart: 2,
    colEnd: 12,
  } satisfies Token,
  {
    type: "ident",
    line: 10,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
  {
    type: "ident",
    line: 13,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
  {
    type: "ident",
    line: 16,
    colStart: 5,
    colEnd: 8,
  } satisfies Token,
] satisfies Array<Token>;

export const TREE_TEST: ParseTreeNode = {
  id: 'root',
  label: 'S',
  children: [
    {
      id: 'n1',
      label: 'NP',
      children: [
        { id: 'n1a', label: 'd', children: [{ id: 'n1a1', label: 't' }] },
        {
          id: 'n1b',
          label: 'N',
          children: [
            { id: 'n1b1', label: 'c' },
            { id: 'n1b2', label: 's' },
          ],
        },
        {
          id: 'n1c',
          label: 'AP',
          children: [
            { id: 'n1c1', label: 'A', children: [{ id: 'n1c1a', label: 'l' }] },
            {
              id: 'n1c2',
              label: 'a',
              children: [
                { id: 'n1c2a', label: 'v' },
                { id: 'n1c2b', label: 'q' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'n2',
      label: 'VP',
      children: [
        {
          id: 'n2a',
          label: 'V',
          children: [
            { id: 'n2a1', label: 'j' },
            { id: 'n2a2', label: 'r' },
          ],
        },
        {
          id: 'n2b',
          label: 'PP',
          children: [
            { id: 'n2b1', label: 'P', children: [{ id: 'n2b1a', label: 'o' }] },
            {
              id: 'n2b2',
              label: 'NP',
              children: [
                {
                  id: 'n2b2a',
                  label: 'N',
                  children: [
                    { id: 'n2b2a1', label: 'm' },
                    { id: 'n2b2a2', label: 'f' },
                    { id: 'n2b2a3', label: 'h' },
                  ],
                },
                {
                  id: 'n2b2b',
                  label: 'AP',
                  children: [
                    { id: 'n2b2b1', label: 'A', children: [{ id: 'n2b2b1a', label: 'h' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'n3',
      label: 'A',
      children: [
        { id: 'n3a', label: 'y' },
        { id: 'n3b', label: 't' },
      ],
    },
  ],
} satisfies ParseTreeNode;

export const TREE_TEST_SMALL: ParseTreeNode = {
  id: "a",
  label: "A",
  children: [],
};