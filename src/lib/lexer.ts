import { assert } from "~/lib/assert";
import { LexErrorMode, LexLog, Token, TokenType } from "~/lib/types";

interface LexerArgs {
  char: string;
  line: number;
  linePos: number;
}

type IllegalCharError = { stateLabel: string; char: string; expected?: string };

export type LexError = { type: "illegal-char"; tokenPos?: TokenPosition; error: IllegalCharError };

export type LexErrorRecovery =
  | { mode: "skip-until-found"; skippedChars: number }
  | { mode: "add-missing"; added: string };

export type ProcessResult =
  | { type: "ok"; tokens: Array<Token>; logs: Array<LexLog>; errorRecovery?: LexErrorRecovery }
  | { type: "error"; error: LexError; logs: Array<LexLog> }
  | { type: "none"; logs: Array<LexLog> };

const EOF = "EOF";

export interface Lexer {
  /* Advances the state according to the args.char and if in accepting state, then emits a token **/
  process(args: LexerArgs): ProcessResult;
  /* Makes one final step in order to finalize potential token, if the final state is accepting, then emits a token  **/
  eof(args: Omit<LexerArgs, "char">): ProcessResult;
}

export function newLexer(args: { startingLine: number; errorMode: LexErrorMode }): {
  lexer: Lexer;
  log: LexLog;
} {
  let lexer: Lexer;
  switch (args.errorMode) {
    case "no-errors":
      lexer = new CorrectLexer(args);
      break;
    case "skip-until-found":
      lexer = new SkipUntilFoundLexer(args);
      break;
    case "add-missing":
      lexer = new AddIfMissingLexer(args);
      break;
  }

  const log: LexLog = {
    type: "init",
    message: "q0 - Lexer initialized",
  };
  return {
    lexer,
    log,
  };
}

interface TokenPosition {
  line: number;
  tokenStart: number;
  tokenEnd: number;
}

class CorrectLexer implements Lexer {
  protected state: NonAcceptingState;
  protected tokenPos: TokenPosition | undefined;

  constructor(args: Partial<{ startingLine: number }>) {
    this.state = Q0;
    this.tokenPos = { line: args.startingLine ?? 0, tokenStart: 0, tokenEnd: 0 };
  }

  process(args: LexerArgs, tokens: Array<Token> = [], logs: Array<LexLog> = []): ProcessResult {
    const result = this.state.move(args.char);
    if (result.type === "error") {
      return {
        type: "error",
        error: { type: "illegal-char", tokenPos: this.tokenPos, error: result.error },
        logs: [
          ...logs,
          {
            type: "error",
            message: `Illegal character '${displayChar(args.char)}' passed to state ${this.state.label} (input ${displayPos(args)})`,
          },
        ],
      };
    }
    logs.push({
      type: "transition",
      message: `Lexer moved from state ${this.state.label} to ${result.state.label} on char '${displayChar(args.char)}' (input ${displayPos(args)})`,
    });

    if (isAcceptingState(result.state)) {
      assert(this.tokenPos !== undefined, "token position was undefined", {
        currentState: this.state,
        args,
      });

      // a token needs to receive at one additional char to confirm that it really is that token.
      this.tokenPos.tokenEnd = args.linePos - 1;
      const token = result.state.emit(this.tokenPos);
      logs.push({
        type: "emit",
        message: `State '${result.state.label}' emitted token ${displayToken(token)}`,
      });
      tokens.push(token);

      // +/- should be treated as `op`, not as start of number after IDENT/NUMBER/RPAREN
      if (
        (args.char === "+" || args.char === "-") &&
        (token.type === "IDENT" || token.type === "NUMBER" || token.type === "RPAREN")
      ) {
        logs.push({
          type: "emit",
          message: `Emit: '${displayChar(args.char)}' treated like 'op'`,
        });
        if (args.char === "-") {
          tokens.push(
            MINUS.emit({ line: args.line, tokenStart: args.linePos, tokenEnd: args.linePos }),
          );
        } else if (args.char === "+") {
          tokens.push(
            PLUS.emit({ line: args.line, tokenStart: args.linePos, tokenEnd: args.linePos }),
          );
        }
        this.tokenPos = undefined;
        this.state = Q0;
        return { type: "ok", tokens, logs };
      }

      this.tokenPos = undefined;
      this.state = Q0;
      // a token needs to receive at one additional char to confirm that it really
      // is that token. Instead of making the caller repeat the char, process
      // also the confirming char.
      return this.process(args, tokens, logs);
    }

    // Q0 can loop on whitespace, which doesn't produce any token, and only
    // start tracking token when there is none being tracked.
    if (result.state.label !== Q0.label && this.tokenPos === undefined) {
      this.tokenPos = { line: args.line, tokenStart: args.linePos, tokenEnd: args.linePos };
    }
    this.state = result.state;

    return tokens.length === 0 ? { type: "none", logs } : { type: "ok", tokens, logs };
  }

  eof(args: Omit<LexerArgs, "char">): ProcessResult {
    const result = this.process({ ...args, char: EOF });
    result.logs.push({
      type: "eof",
      message: "Finished processing of input",
    });
    return result;
  }
}

class SkipUntilFoundLexer extends CorrectLexer {
  private skipped: number;

  constructor(args: Partial<{ startingLine: number }>) {
    super(args);
    this.skipped = 0;
  }

  process(args: LexerArgs, tokens?: Array<Token>, logs?: Array<LexLog>): ProcessResult {
    const beforeState = this.state;
    const result = super.process(args, tokens, logs);

    if (result.type === "none") {
      return result;
    } else if (result.type === "ok") {
      if (result.errorRecovery || this.skipped !== 0) {
        result.errorRecovery = result.errorRecovery ?? {
          mode: "skip-until-found",
          skippedChars: this.skipped,
        };
        this.skipped = 0;
      }

      return result;
    }

    this.skipped++;
    result.logs.push({
      type: "recover",
      message: `error recovery: skipping char '${displayChar(args.char)}' (input ${displayPos(args)})`,
    });

    this.state = beforeState;
    return { type: "none", logs: result.logs };
  }
}

/**
 * When there is not a concrete char that can be added, this will be used
 */
const RECOVERY_AMBIGUOUS_CHAR = "R";

class AddIfMissingLexer extends CorrectLexer {
  private added: string;
  constructor(args: Partial<{ startingLine: number }>) {
    super(args);
    this.added = "";
  }

  process(args: LexerArgs, tokens?: Array<Token>, logs?: Array<LexLog>): ProcessResult {
    const beforeState = this.state;
    const result = super.process(args, tokens, logs);

    if (result.type === "none") {
      return result;
    } else if (result.type === "ok") {
      result.errorRecovery = { mode: "add-missing", added: this.added };
      this.added = "";
      return result;
    }

    const expectedChar = result.error.error.expected ?? RECOVERY_AMBIGUOUS_CHAR;
    this.added = expectedChar;
    result.logs.push({
      type: "recover",
      message: `error recovery: adding '${displayChar(expectedChar)}' at input ${displayPos(args)}`,
    });

    this.state = beforeState;
    return super.process(
      {
        char: expectedChar,
        line: args.line,
        linePos: args.linePos - 1,
      },
      tokens,
      result.logs,
    );
  }
}

type State = NonAcceptingState | AcceptingState;

type MoveResult = { type: "ok"; state: State } | { type: "error"; error: IllegalCharError };

const Ok = (state: State) => ({ type: "ok", state }) satisfies MoveResult;
const Err = (error: IllegalCharError) => ({ type: "error", error }) satisfies MoveResult;

interface NonAcceptingState {
  label: string;
  move: (char: string) => MoveResult;
}

interface AcceptingState {
  label: string;
  emit: (pos: TokenPosition) => Token;
}

const Q0 = nonAccepting("Q0", (char) => {
  if (char === EOF) return Ok(Q0);
  if (isWhitespaceChar(char)) return Ok(Q0);

  switch (char) {
    case "B":
      return Ok(BStart);
    case "A":
      return Ok(AStart);
    case "E":
      return Ok(EStart);
    case "F":
      return Ok(FStart);
    case "I":
      return Ok(IStart);
    case "N":
      return Ok(NStart);
    case "O":
      return Ok(OStart);
    case "R":
      return Ok(RStart);
    case "T":
      return Ok(TStart);
    case "W":
      return Ok(WStart);
    case ":":
      return Ok(AssignStart);
    case ";":
      return Ok(SemiStart);
    case "(":
      return Ok(LParenStart);
    case ")":
      return Ok(RParenStart);
    case ",":
      return Ok(CommaStart);
    case "+":
      return Ok(PlusStart);
    case "-":
      return Ok(MinusStart);
  }

  if (isNumberStart(char)) {
    return Ok(Num(char));
  }
  if (isLetter(char)) {
    return Ok(Id(char));
  }

  return Err({ char, stateLabel: Q0.label });
});

const BStart = nonAccepting("B", (char) => {
  if (char === "E") return Ok(EBegin);
  if (isAlphanumeric(char)) return Ok(Id("B" + char));
  return Ok(IdAccept("B"));
});

const EBegin = nonAccepting("EBegin", (char) => {
  if (char === "G") return Ok(G);
  if (isAlphanumeric(char)) return Ok(Id("BE" + char));
  return Ok(IdAccept("BE"));
});

const G = nonAccepting("G", (char) => {
  if (char === "I") return Ok(IBegin);
  if (isAlphanumeric(char)) return Ok(Id("BEG" + char));
  return Ok(IdAccept("BEG"));
});

const IBegin = nonAccepting("I", (char) => {
  if (char === "N") return Ok(NBegin);
  if (isAlphanumeric(char)) return Ok(Id("BEGI" + char));
  return Ok(IdAccept("BEGI"));
});

const NBegin = nonAccepting("NBegin", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("BEGIN" + char));
  return Ok(BEGIN);
});

const BEGIN = accepting("BEGIN", { type: "BEGIN", value: "BEGIN" });

const AStart = nonAccepting("A", (char) => {
  if (char === "N") return Ok(NAnd);
  if (isAlphanumeric(char)) return Ok(Id("A" + char));
  return Ok(IdAccept("A"));
});

const NAnd = nonAccepting("NAnd", (char) => {
  if (char === "D") return Ok(DAnd);
  if (isAlphanumeric(char)) return Ok(Id("AN" + char));
  return Ok(IdAccept("AN"));
});

const DAnd = nonAccepting("DAnd", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("AND" + char));
  return Ok(AND);
});

const AND = accepting("AND", { type: "AND", value: "AND" });

const EStart = nonAccepting("E", (char) => {
  if (char === "N") return Ok(NEnd);
  if (char === "L") return Ok(LElse);
  if (isAlphanumeric(char)) return Ok(Id("E" + char));
  return Ok(IdAccept("E"));
});

const NEnd = nonAccepting("NEnd", (char) => {
  if (char === "D") return Ok(DEnd);
  if (isAlphanumeric(char)) return Ok(Id("EN" + char));
  return Ok(IdAccept("EN"));
});

const DEnd = nonAccepting("DEnd", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("END" + char));
  return Ok(END);
});

const END = accepting("END", { type: "END", value: "END" });

const LElse = nonAccepting("LElse", (char) => {
  if (char === "S") return Ok(SElse);
  if (isAlphanumeric(char)) return Ok(Id("EL" + char));
  return Ok(IdAccept("EL"));
});

const SElse = nonAccepting("SElse", (char) => {
  if (char === "E") return Ok(EElse);
  if (isAlphanumeric(char)) return Ok(Id("ELS" + char));
  return Ok(IdAccept("ELS"));
});

const EElse = nonAccepting("EElse", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("ELSE" + char));
  return Ok(ELSE);
});

const ELSE = accepting("ELSE", { type: "ELSE", value: "ELSE" });

const FStart = nonAccepting("F", (char) => {
  if (char === "A") return Ok(AFalse);
  if (isAlphanumeric(char)) return Ok(Id("F" + char));
  return Ok(IdAccept("F"));
});

const AFalse = nonAccepting("AFalse", (char) => {
  if (char === "L") return Ok(LFalse);
  if (isAlphanumeric(char)) return Ok(Id("FA" + char));
  return Ok(IdAccept("FA"));
});

const LFalse = nonAccepting("LFalse", (char) => {
  if (char === "S") return Ok(SFalse);
  if (isAlphanumeric(char)) return Ok(Id("FAL" + char));
  return Ok(IdAccept("FAL"));
});

const SFalse = nonAccepting("SFalse", (char) => {
  if (char === "E") return Ok(EFalse);
  if (isAlphanumeric(char)) return Ok(Id("FALS" + char));
  return Ok(IdAccept("FALS"));
});

const EFalse = nonAccepting("EFalse", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("FALSE" + char));
  return Ok(FALSE);
});

const FALSE = accepting("FALSE", { type: "FALSE", value: "FALSE" });

const IStart = nonAccepting("IIf", (char) => {
  if (char === "F") return Ok(FIf);
  if (isAlphanumeric(char)) return Ok(Id("I" + char));
  return Ok(IdAccept("I"));
});

const FIf = nonAccepting("FIf", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("IF" + char));
  return Ok(IF);
});

const IF = accepting("IF", { type: "IF", value: "IF" });

const NStart = nonAccepting("NNot", (char) => {
  if (char === "O") return Ok(ONot);
  if (isAlphanumeric(char)) return Ok(Id("N" + char));
  return Ok(IdAccept("N"));
});

const ONot = nonAccepting("ONot", (char) => {
  if (char === "T") return Ok(TNot);
  if (isAlphanumeric(char)) return Ok(Id("NO" + char));
  return Ok(IdAccept("NO"));
});

const TNot = nonAccepting("TNot", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("NOT" + char));
  return Ok(NOT);
});

const NOT = accepting("NOT", { type: "NOT", value: "NOT" });

const OStart = nonAccepting("O", (char) => {
  if (char === "R") return Ok(ROr);
  if (isAlphanumeric(char)) return Ok(Id("O" + char));
  return Ok(IdAccept("O"));
});

const ROr = nonAccepting("ROr", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("OR" + char));
  return Ok(OR);
});

const OR = accepting("OR", { type: "OR", value: "OR" });

const RStart = nonAccepting("R", (char) => {
  if (char === "E") return Ok(ERead);
  if (isAlphanumeric(char)) return Ok(Id("R" + char));
  return Ok(IdAccept("R"));
});

const ERead = nonAccepting("ERead", (char) => {
  if (char === "A") return Ok(ARead);
  if (isAlphanumeric(char)) return Ok(Id("RE" + char));
  return Ok(IdAccept("RE"));
});

const ARead = nonAccepting("ARead", (char) => {
  if (char === "D") return Ok(DRead);
  if (isAlphanumeric(char)) return Ok(Id("REA" + char));
  return Ok(IdAccept("REA"));
});

const DRead = nonAccepting("DRead", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("READ" + char));
  return Ok(READ);
});

const READ = accepting("READ", { type: "READ", value: "READ" });

const TStart = nonAccepting("T", (char) => {
  if (char === "H") return Ok(HThen);
  if (char === "R") return Ok(RTrue);
  if (isAlphanumeric(char)) return Ok(Id("T" + char));
  return Ok(IdAccept("T"));
});

const HThen = nonAccepting("HThen", (char) => {
  if (char === "E") return Ok(EThen);
  if (isAlphanumeric(char)) return Ok(Id("TH" + char));
  return Ok(IdAccept("TH"));
});

const EThen = nonAccepting("EThen", (char) => {
  if (char === "N") return Ok(NThen);
  if (isAlphanumeric(char)) return Ok(Id("THE" + char));
  return Ok(IdAccept("THE"));
});

const NThen = nonAccepting("NThen", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("THEN" + char));
  return Ok(THEN);
});

const THEN = accepting("THEN", { type: "THEN", value: "THEN" });

const RTrue = nonAccepting("RTrue", (char) => {
  if (char === "U") return Ok(UTrue);
  if (isAlphanumeric(char)) return Ok(Id("TR" + char));
  return Ok(IdAccept("TR"));
});

const UTrue = nonAccepting("UTrue", (char) => {
  if (char === "E") return Ok(ETrue);
  if (isAlphanumeric(char)) return Ok(Id("TRU" + char));
  return Ok(IdAccept("TRU"));
});

const ETrue = nonAccepting("ETrue", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("TRUE" + char));
  return Ok(TRUE);
});

const TRUE = accepting("TRUE", { type: "TRUE", value: "TRUE" });

const WStart = nonAccepting("W", (char) => {
  if (char === "R") return Ok(RWrite);
  if (isAlphanumeric(char)) return Ok(Id("W" + char));
  return Ok(IdAccept("W"));
});

const RWrite = nonAccepting("RWrite", (char) => {
  if (char === "I") return Ok(IWrite);
  if (isAlphanumeric(char)) return Ok(Id("WR" + char));
  return Ok(IdAccept("WR"));
});

const IWrite = nonAccepting("IWrite", (char) => {
  if (char === "T") return Ok(TWrite);
  if (isAlphanumeric(char)) return Ok(Id("WRI" + char));
  return Ok(IdAccept("WRI"));
});

const TWrite = nonAccepting("TWrite", (char) => {
  if (char === "E") return Ok(EWrite);
  if (isAlphanumeric(char)) return Ok(Id("WRIT" + char));
  return Ok(IdAccept("WRIT"));
});

const EWrite = nonAccepting("EWrite", (char) => {
  if (isAlphanumeric(char)) return Ok(Id("WRITE" + char));
  return Ok(WRITE);
});

const WRITE = accepting("WRITE", { type: "WRITE", value: "WRITE" });

const Id = (id: string = "") => {
  let idBuffer = id;

  const idState = nonAccepting("id", (char) => {
    if (isAlphanumeric(char)) {
      idBuffer += char;
      return Ok(idState);
    }

    return Ok(IdAccept(idBuffer));
  });

  return idState;
};

const IdAccept = (id: string) => accepting("id-accept", { type: "IDENT", value: id });

const Num = (num: string = "") => {
  let numberBuffer = num;

  const numberState = nonAccepting("number", (char) => {
    if (isDigit(char)) {
      numberBuffer += char;
      return Ok(numberState);
    }

    return Ok(NumAccept(numberBuffer));
  });

  return numberState;
};

const NumAccept = (num: string) => accepting("number-accept", { type: "NUMBER", value: num });

const AssignStart = nonAccepting(":", (char) => {
  if (char === "=") return Ok(AssignAccept);
  return Err({ char, stateLabel: AssignStart.label, expected: "=" });
});

const AssignAccept = nonAccepting(":=", () => Ok(ASSIGN));

const ASSIGN = accepting(":=", { type: "ASSIGN", value: ":=" });

const SemiStart = nonAccepting(";", () => Ok(SEMI));

const SEMI = accepting(";-accept", { type: "SEMI", value: ";" });

const LParenStart = nonAccepting("(", () => Ok(LPAREN));

const LPAREN = accepting("(-accept", { type: "LPAREN", value: "(" });

const RParenStart = nonAccepting(")", () => Ok(RPAREN));

const RPAREN = accepting(")-accept", { type: "RPAREN", value: ")" });

const CommaStart = nonAccepting(",", () => Ok(COMMA));

const COMMA = accepting(",-accept", { type: "COMMA", value: "," });

const PlusStart = nonAccepting("+", (char) => {
  if (isNumberStart(char)) return Ok(Num("+" + char));
  return Ok(PLUS);
});

const PLUS = accepting("+-accept", { type: "PLUS", value: "+" });

const MinusStart = nonAccepting("-", (char) => {
  if (isNumberStart(char)) return Ok(Num("-" + char));
  return Ok(MINUS);
});

const MINUS = accepting("--accept", { type: "MINUS", value: "-" });

function nonAccepting(label: string, move: (char: string) => MoveResult): NonAcceptingState {
  return { label, move };
}

function accepting(label: string, emitToken: { type: TokenType; value: string }): AcceptingState {
  return {
    label,
    emit: (tokenPos) =>
      ({
        type: emitToken.type,
        value: emitToken.value,
        line: tokenPos.line,
        colStart: tokenPos.tokenStart,
        colEnd: tokenPos.tokenEnd,
      }) satisfies Token,
  };
}

function isWhitespaceChar(char: string): boolean {
  if (char === EOF) return false;
  assert(char.length === 1, `input must be a string of length 1, was '${char}'`);
  return /\s/.test(char);
}

function isAcceptingState(s: State): s is AcceptingState {
  return (s as AcceptingState).emit !== undefined;
}

function isAlphanumeric(char: string): boolean {
  return /^[a-zA-Z0-9]$/.test(char);
}

function isLetter(char: string): boolean {
  return /^[a-zA-Z]$/.test(char);
}

function isDigit(char: string): boolean {
  return /^\d$/.test(char);
}

function isNumberStart(char: string): boolean {
  return /^[1-9]$/.test(char);
}

function displayChar(c: string) {
  if (c === "\n") return "\\n";
  if (c === "\t") return "\\t";
  return c;
}

function displayToken(t: Token) {
  return JSON.stringify(t);
}

function displayPos(args: LexerArgs) {
  return `${args.line}:${args.linePos}`;
}
