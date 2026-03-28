import {LucideIcon, TokenType} from "~/lib/types";
import {Component} from "solid-js";
import {TOKEN_ICONS} from "~/lib/data/tokens";
import {Dynamic} from "solid-js/web";

interface TokenIconProps {
  tokenType: TokenType;
}

export const TokenIcon: Component<TokenIconProps> = (props: TokenIconProps) => {
  const icon = (): LucideIcon => TOKEN_ICONS[props.tokenType];

  return (
    <Dynamic component={icon()} />
  );
};