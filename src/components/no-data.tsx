import type { LucideIcon } from "lucide-solid";

import { Component } from "solid-js";

import { cn } from "~/lib/ui-utils";

interface NoDataProps {
  icon: LucideIcon;
  text: string;
  class?: string;
}

export const NoData: Component<NoDataProps> = (props: NoDataProps) => {
  return (
    <div class={cn("flex h-full w-full flex-1 flex-col items-center justify-center", props.class)}>
      <props.icon class="size-24 text-primary-700" />
      <span class="text-sm font-medium text-primary-600">{props.text}</span>
    </div>
  );
};
