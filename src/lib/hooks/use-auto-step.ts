import { Accessor, createEffect, createSignal, onCleanup, Setter } from "solid-js";

import {
  AUTO_MODE_SPEED_MS,
  BLINK_DURATION,
  KEYS_BACKWARD,
  KEYS_FAST_BACKWARD,
  KEYS_FAST_FORWARD,
  KEYS_FORWARD,
  KEYS_NEXT,
  KEYS_PREVIOUS,
} from "~/lib/data/constants";
import { ControlButton, Direction } from "~/lib/types";

export type UseAutoStepType = {
  autoModeDirection: () => Direction;
  setAutoModeDirection: Setter<Direction>;
  lastPressedButton: () => ControlButton | undefined;
  blink: (button: ControlButton) => void;
};

export const useAutoStep = (
  nextStep: () => void,
  previousStep: () => void,
  firstStep?: () => void,
  lastStep?: () => void,
  enabled: Accessor<boolean> = () => true,
): UseAutoStepType => {
  const [autoModeDirection, setAutoModeDirection] = createSignal<Direction>("none");
  const [lastPressedButton, setLastPressedButton] = createSignal<ControlButton | undefined>(
    undefined,
  );

  const blink = (button: ControlButton) => {
    setLastPressedButton(button);
    setTimeout(() => {
      setLastPressedButton(undefined);
    }, BLINK_DURATION);
  };

  createEffect(() => {
    const direction: Direction = autoModeDirection();
    if (direction === "none" || !enabled()) return;

    const interval: NodeJS.Timeout = setInterval(() => {
      if (direction === "forward") nextStep();
      else previousStep();
    }, AUTO_MODE_SPEED_MS);

    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_PREVIOUS.includes(e.key)) {
        previousStep();
      } else if (KEYS_NEXT.includes(e.key)) {
        nextStep();
      } else if (KEYS_FORWARD.includes(e.key)) {
        blink("play");
        setAutoModeDirection(autoModeDirection() === "none" ? "forward" : "none");
      } else if (KEYS_BACKWARD.includes(e.key)) {
        blink("play");
        setAutoModeDirection(autoModeDirection() === "none" ? "backward" : "none");
      } else if (KEYS_FAST_FORWARD.includes(e.key)) {
        blink("last");
        lastStep?.();
      } else if (KEYS_FAST_BACKWARD.includes(e.key)) {
        blink("first");
        firstStep?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  return {
    autoModeDirection,
    setAutoModeDirection,
    lastPressedButton,
    blink,
  };
};
