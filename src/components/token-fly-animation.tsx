import { Component, For } from "solid-js";
import { Portal } from "solid-js/web";
import { Motion } from "solid-motionone";

export interface FlyingToken {
  id: number;
  label: string;
  fromRect: DOMRect;
  toRect: DOMRect;
}

interface TokenFlyAnimationProps {
  flyingTokens: () => Array<FlyingToken>;
  onComplete: (id: number) => void;
}

export const TokenFlyAnimation: Component<TokenFlyAnimationProps> = (props) => {
  return (
    <Portal>
      <For each={props.flyingTokens()}>
        {(ft) => (
          <Motion.div
            style={{
              position: "fixed",
              top: `${ft.fromRect.top}px`,
              left: `${ft.fromRect.left}px`,
              width: `${ft.fromRect.width}px`,
              height: `${ft.fromRect.height}px`,
              "z-index": "9999",
              "pointer-events": "none",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "border-radius": "6px",
              "font-size": "12px",
              "background-color": "var(--color-primary-400)",
              color: "white",
              overflow: "hidden",
              "text-overflow": "ellipsis",
              "white-space": "nowrap",
            }}
            animate={{
              top: [`${ft.fromRect.top}px`, `${ft.toRect.top}px`],
              left: [`${ft.fromRect.left}px`, `${ft.toRect.left}px`],
              width: [
                `${ft.fromRect.width}px`,
                `${ft.toRect.width}px`,
              ],
              height: [
                `${ft.fromRect.height}px`,
                `${ft.toRect.height}px`,
              ],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.5, easing: "ease-in-out" }}
            onMotionComplete={() => props.onComplete(ft.id)}
          >
            {ft.label}
          </Motion.div>
        )}
      </For>
    </Portal>
  );
};