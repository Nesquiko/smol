import { Component } from "solid-js";

interface ResultStatCardProps {
  label: string;
  value: string | number;
  dim?: boolean;
}

export const ResultStatCard: Component<ResultStatCardProps> = (props: ResultStatCardProps) => {
  return (
    <div class="flex flex-col items-start justify-between gap-1 rounded-lg bg-primary-900 p-4">
      <span class="text-xs font-medium text-muted-foreground/60">{props.label}</span>
      <span
        class="font-mono text-2xl font-bold"
        classList={{
          "text-primary-300": !props.dim,
          "text-muted-foreground": props.dim,
        }}
      >
        {props.value}
      </span>
    </div>
  );
};
