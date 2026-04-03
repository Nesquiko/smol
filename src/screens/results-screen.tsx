import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import { Accessor, Component, createMemo, For } from "solid-js";

import { BarList } from "~/components/ui/bar-list";
import { DonutChart } from "~/components/ui/charts";
import { Button } from "~/components/ui/button";
import {
  computeLexStats,
  computeSyntaxStats,
  LexStats,
  SyntaxStats,
} from "~/lib/parsing/stats";
import { ParserStep, Result, Token } from "~/lib/types";
import type {Chart, ChartData, ChartOptions} from "chart.js";

interface StatCardProps {
  label: string;
  value: string | number;
  dim?: boolean;
}

const StatCard: Component<StatCardProps> = (props) => (
  <div class="flex flex-col items-start justify-between gap-1 rounded-lg bg-primary-900 p-4">
    <span class="text-xs text-muted-foreground/60 font-medium">{props.label}</span>
    <span
      class="font-mono text-2xl font-bold"
      classList={{ "text-primary-300": !props.dim, "text-muted-foreground": props.dim }}
    >
      {props.value}
    </span>
  </div>
);

interface ResultsScreenProps {
  result: Accessor<Result>;
  tokens: Accessor<Array<Token>>;
  steps: Accessor<Array<ParserStep>>;
  onBack: () => void;
}

export const ResultsScreen: Component<ResultsScreenProps> = (props) => {
  const lexStats = createMemo((): LexStats => computeLexStats(props.tokens()));
  const synStats = createMemo((): SyntaxStats => computeSyntaxStats(props.steps()));

  const lexStatItems = createMemo(() => [
    { label: "Total tokens", value: lexStats().totalTokens },
    { label: "Lines of code", value: lexStats().lines },
    { label: "Unique token types", value: lexStats().uniqueTokenTypes },
    //{ label: "Most frequent type", value: lexStats().mostFrequentType },
  ]);

  const synStatItems = createMemo(() => [
    { label: "Total steps", value: synStats().totalSteps },
    { label: "Expansions", value: synStats().expansions },
    { label: "Matches", value: synStats().matches },
    { label: "Unique rules applied", value: synStats().uniqueRulesApplied },
    { label: "Max stack depth", value: synStats().maxStackDepth },
    {
      label: "Errors encountered",
      value: synStats().errors,
      dim: synStats().errors === 0,
    },
  ]);

  const donutData = createMemo(
    (): ChartData<"doughnut"> => ({
      labels: synStats().stepBreakdown.map((e) => e.name),
      datasets: [
        {
          data: synStats().stepBreakdown.map((e) => e.value),
          backgroundColor: synStats().stepBreakdown.map((e) => e.fill),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
  );

  const donutOptions: ChartOptions<"doughnut"> = {
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 6,
      },
    },
  };

  const donutCenterPlugin = {
    id: "centerLabel",
    beforeDraw(chart: Chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const total = synStats().totalSteps;

      const cx = (chartArea.left + chartArea.right) / 2;
      const cy = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();

      ctx.font = "bold 28px monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(total), cx, cy - 10);

      ctx.font = "11px sans-serif";
      ctx.fillText("total steps", cx, cy + 14);

      ctx.restore();
    },
  };

  const resultDescription = (): string => {
    switch (props.result()) {
      case "correct": return "The input has been successfully parsed.";
      case "incorrect": return "The parser encountered errors in the input.";
      case "unknown": return "Could not determine the correctness of the input.";
    }
  };

  return (
    <div class="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <div class="flex flex-col items-center gap-2">
        <span class="text-6xl font-bold text-primary-300 uppercase">
          {props.result()}
        </span>
        <span class="text-xs text-muted-foreground">
          {resultDescription()}
        </span>
      </div>

      <div class="flex w-full max-w-3xl flex-col gap-10 pb-9">
        <div class="flex w-full flex-col gap-3">
          <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Lexical analysis
          </h2>
          <div class="flex flex-col sm:flex-row items-start justify-center w-full gap-3">
            <div class="grid grid-cols-3 sm:grid-cols-1 gap-3 w-full">
              <For each={lexStatItems()}>
                {(s) => <StatCard label={s.label} value={s.value}/>}
              </For>
            </div>

            <div class="rounded-lg bg-primary-900 p-[17px] w-full h-full">
              <p class="mb-3 text-xs text-muted-foreground/60 font-medium">Most frequent token types</p>
              <BarList data={lexStats().tokenTypeFrequency} class="text-xs"/>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-3">
          <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Syntax Analysis
          </h2>
          <div class="flex flex-col md:flex-row items-center justify-center w-full gap-3">
            <div class="grid grid-cols-2 gap-3 w-full">
              <For each={synStatItems()}>
                {(s) => <StatCard label={s.label} value={s.value} dim={s.dim}/>}
              </For>
            </div>

            <div class="rounded-lg bg-primary-900 p-4 flex items-center justify-center w-full max-h-70 md:max-w-70">
              <DonutChart
                data={donutData()}
                options={donutOptions}
                plugins={[donutCenterPlugin]}
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="default"
        class="absolute bottom-6 left-6 w-fit cursor-pointer"
        onClick={props.onBack}
      >
        <ChevronLeftIcon/>
        Syntax analysis
      </Button>
    </div>
  );
};