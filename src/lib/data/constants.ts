import { Dollar, Epsilon, Program, Token } from "~/lib/types";

export const BLINK_DURATION: number = 100;

export const KEYS_PREVIOUS: Array<string> = ["ArrowLeft", "a", "A"];
export const KEYS_NEXT: Array<string> = ["ArrowRight", "d", "D"];
export const KEYS_FORWARD: Array<string> = ["ArrowUp", "w", "W", " "];
export const KEYS_BACKWARD: Array<string> = ["ArrowDown", "s", "s"];
export const KEYS_FAST_FORWARD: Array<string> = ["l", "L"];
export const KEYS_FAST_BACKWARD: Array<string> = ["f", "F"];

export const AUTO_MODE_SPEED_MS: number = 500;

export const PROGRAM: Program = "program";
export const DOLLAR: Dollar = "$";
export const EPSILON: Epsilon = "ε";
export const EOF_TOKEN: Token = {
  type: DOLLAR,
  value: DOLLAR,
  line: 0,
  colStart: 0,
  colEnd: 0,
};

export const STEP_SAFETY_LIMIT: number = 5000;
