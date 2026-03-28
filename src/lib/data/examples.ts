type ServerPath = `/${string}`;

export type InputExample = {
  name: string;
  path: ServerPath;
};

export const EXAMPLES: Array<InputExample> = [
  {
    name: "Simple Example",
    path: "/examples/simple-example.txt",
  } satisfies InputExample,
  {
    name: "Complex Example",
    path: "/examples/complex-example.txt",
  } satisfies InputExample,
] satisfies Array<InputExample>;