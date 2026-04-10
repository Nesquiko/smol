type ExampleID = `example-${number}`;
type ServerPath = `/${string}`;

export type InputExample = {
  id: ExampleID;
  name: string;
  lineCount: number;
  characterCount: number;
  path: ServerPath;
};

export const FILE_EXAMPLES: Array<InputExample> = [
  {
    id: "example-0",
    name: "Simple Example",
    lineCount: 7,
    characterCount: 71,
    path: "/examples/simple-example.txt",
  } satisfies InputExample,
  {
    id: "example-1",
    name: "Complex Example",
    lineCount: 55,
    characterCount: 849,
    path: "/examples/complex-example.txt",
  } satisfies InputExample,
  {
    id: "example-2",
    name: "Complex Example 2",
    lineCount: 55,
    characterCount: 849,
    path: "/examples/complex-example-2.txt",
  } satisfies InputExample,
] satisfies Array<InputExample>;
