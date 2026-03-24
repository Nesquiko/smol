type ServerPath = `/${string}`;

export type InputExample = {
  name: string;
  path: ServerPath;
};

export const EXAMPLES: Array<InputExample> = [
  {
    name: "Example 1",
    path: "/examples/example-1.smol",
  } satisfies InputExample,
] satisfies Array<InputExample>;