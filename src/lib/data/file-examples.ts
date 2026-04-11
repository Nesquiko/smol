type ExampleID = `example-${number}`;
type ServerPath = `/${string}`;

export type InputExample = {
  id: ExampleID;
  name: string;
  lineCount: number;
  characterCount: number;
  intentionalError?: boolean;
  path: ServerPath;
};

export const FILE_EXAMPLES: Array<InputExample> = [
  {
    id: "example-0",
    name: "Simple Example",
    lineCount: 7,
    characterCount: 71,
    path: "/examples/simple-example.smol",
  } satisfies InputExample,
  {
    id: "example-1",
    name: "Complex Example",
    lineCount: 55,
    characterCount: 849,
    path: "/examples/complex-example.smol",
  } satisfies InputExample,
  {
    id: "example-2",
    name: "Missing Assignment Example",
    lineCount: 5,
    characterCount: 33,
    intentionalError: true,
    path: "/examples/errors/missing-assignment.smol",
  } satisfies InputExample,
  {
    id: "example-3",
    name: "Missing Operator Example",
    lineCount: 5,
    characterCount: 41,
    intentionalError: true,
    path: "/examples/errors/missing-operator.smol",
  } satisfies InputExample,
  {
    id: "example-4",
    name: "Missing Right Parenthesis Example",
    lineCount: 4,
    characterCount: 33,
    intentionalError: true,
    path: "/examples/errors/missing-rparen.smol",
  } satisfies InputExample,
  {
    id: "example-5",
    name: "Missing Then Example",
    lineCount: 4,
    characterCount: 51,
    intentionalError: true,
    path: "/examples/errors/missing-then.smol",
  } satisfies InputExample,
  {
    id: "example-6",
    name: "Operator Expected Example",
    lineCount: 5,
    characterCount: 45,
    intentionalError: true,
    path: "/examples/errors/operator-expected.smol",
  } satisfies InputExample,
  {
    id: "example-7",
    name: "Lexer error recovery",
    lineCount: 5,
    characterCount: 49,
    intentionalError: true,
    path: "/examples/errors/lex-error-recovery.smol",
  } satisfies InputExample,
] satisfies Array<InputExample>;
