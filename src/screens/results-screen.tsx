import type { Chart, ChartData, ChartOptions } from "chart.js";

import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import { Accessor, Component, createMemo, For, Show } from "solid-js";

import { ResultStatCard } from "~/components/result-stat-card";
import { BarList } from "~/components/ui/bar-list";
import { Button } from "~/components/ui/button";
import { DonutChart } from "~/components/ui/charts";
import { LexErrorRecovery } from "~/lib/lexer";
import { computeLexStats, computeSyntaxStats, LexStats, SyntaxStats } from "~/lib/parsing/stats";
import { SyntaxParserStep, Result, Token, SyntaxErrorMode, LexErrorMode } from "~/lib/types";

interface ResultsScreenProps {
  result: Accessor<Result>;
  tokens: Accessor<Array<Token>>;
  steps: Accessor<Array<SyntaxParserStep>>;
  lexErrorMode: Accessor<LexErrorMode | undefined>;
  lexErrorRecoveries: Accessor<Array<LexErrorRecovery>>;
  syntaxErrorMode: Accessor<SyntaxErrorMode | undefined>;
  onBack: () => void;
}

export const ResultsScreen: Component<ResultsScreenProps> = (props) => {
  const lexStats: Accessor<LexStats> = createMemo(
    (): LexStats => computeLexStats(props.tokens(), props.lexErrorRecoveries()),
  );
  const synStats: Accessor<SyntaxStats> = createMemo(
    (): SyntaxStats => computeSyntaxStats(props.steps()),
  );

  const lexStatItems = createMemo(() => [
    { label: "Total tokens", value: lexStats().totalTokens },
    { label: "Lines of code", value: lexStats().lines },
    { label: "Unique token types", value: lexStats().uniqueTokenTypes },
  ]);

  const lexRecoveryStatItems = createMemo(() => {
    if (props.lexErrorMode() === "add-missing") {
      return [
        { label: "Strategy used", value: "Add" },
        { label: "Successful recoveries", value: lexStats().errors.count },
        { label: "Count of inserted characters", value: lexStats().errors.added.length },
        { label: "Characters inserted", value: [...new Set(lexStats().errors.added)].join(", ") },
      ];
    } else if (props.lexErrorMode() === "skip-until-found") {
      return [
        { label: "Strategy used", value: "Skip" },
        { label: "Successful recoveries", value: lexStats().errors.count },
        { label: "Characters skipped", value: lexStats().errors.skipped },
      ];
    } else {
      return [{ label: "Strategy used", value: "None" }];
    }
  });

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

  const syntaxRecoveryStatItems = createMemo(() => {
    if (props.syntaxErrorMode() === "add-missing") {
      return [
        { label: "Strategy used", value: "Add" },
        { label: "Successful recoveries", value: synStats().recoveries },
        { label: "Tokens inserted", value: synStats().tokensInserted },
      ];
    } else if (props.syntaxErrorMode() === "skip-until-found") {
      return [
        { label: "Strategy used", value: "Skip" },
        { label: "Successful recoveries", value: synStats().recoveries },
        { label: "Tokens skipped", value: synStats().tokensSkipped },
      ];
    } else {
      return [{ label: "Strategy used", value: "None" }];
    }
  });

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

      const total: number = synStats().totalSteps;

      const cx: number = (chartArea.left + chartArea.right) / 2;
      const cy: number = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();

      ctx.font = "bold 32px monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(total), cx, cy - 10);

      ctx.font = "10px sans-serif";
      ctx.fillText("total steps", cx, cy + 16);

      ctx.restore();
    },
  };

  const resultHeading = (): string => {
    return props.result().replaceAll("-", " ");
  };

  const resultDescription = (): string => {
    switch (props.result()) {
      case "correct":
        return "The input has been successfully parsed.";
      case "incorrect":
        return "The parser encountered errors in the input.";
      case "unknown":
        return "Could not determine the correctness of the input.";
      case "correct-with-errors":
        return "The parser encountered errors in the input but has successfully recovered from them.";
    }
  };

  return (
    <div class="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <div class="flex flex-col items-center gap-2">
        <span
          class="text-6xl font-bold uppercase"
          classList={{
            "text-primary-300": props.result() === "unknown",
            "text-green-300": props.result() === "correct",
            "text-red-400": props.result() === "incorrect",
            "text-yellow-200": props.result() === "correct-with-errors",
          }}
        >
          {resultHeading()}
        </span>
        <span class="text-xs text-muted-foreground">{resultDescription()}</span>
      </div>

      <div class="flex w-full max-w-3xl flex-col gap-10 pb-9">
        <div class="flex w-full flex-col gap-3">
          <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Lexical analysis
          </h2>
          <div class="flex w-full flex-col items-start justify-center gap-3 sm:flex-row">
            <div class="grid w-full grid-cols-3 gap-3 sm:grid-cols-1">
              <For each={lexStatItems()}>
                {(s) => <ResultStatCard label={s.label} value={s.value} />}
              </For>
            </div>

            <div class="h-full w-full rounded-lg bg-primary-900 p-[17px]">
              <p class="mb-3 text-xs font-medium text-muted-foreground/60">
                Most frequent token types
              </p>
              <BarList data={lexStats().tokenTypeFrequency} class="text-xs" />
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-3">
          <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Lexical error recovery
          </h2>
          <div class="grid w-full grid-cols-3 gap-3">
            <For each={lexRecoveryStatItems()}>
              {(s) => <ResultStatCard label={s.label} value={s.value} dim={s.value === 0} />}
            </For>
          </div>
          <p class="text-xs text-muted-foreground/40 italic">
            TODO: luky - lexical error recovery not yet implemented, showing dummy data
          </p>
        </div>

        <div class="flex w-full flex-col gap-3">
          <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Syntax analysis
          </h2>
          <div class="flex w-full flex-col items-center justify-center gap-3 md:flex-row">
            <div class="grid w-full grid-cols-2 gap-3">
              <For each={synStatItems()}>
                {(s) => <ResultStatCard label={s.label} value={s.value} dim={s.dim} />}
              </For>
            </div>

            <div class="flex max-h-70 w-full items-center justify-center rounded-lg bg-primary-900 p-4 md:max-w-70">
              <DonutChart data={donutData()} options={donutOptions} plugins={[donutCenterPlugin]} />
            </div>
          </div>
        </div>

        <Show when={props.result() === "correct-with-errors"}>
          <div class="flex w-full flex-col gap-3">
            <h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Syntax error recovery
            </h2>
            <div class="grid w-full grid-cols-3 gap-3">
              <For each={syntaxRecoveryStatItems()}>
                {(s) => <ResultStatCard label={s.label} value={s.value} />}
              </For>
            </div>
          </div>
        </Show>
      </div>

      <Button
        variant="ghost"
        size="default"
        class="absolute bottom-6 left-6 w-fit cursor-pointer"
        onClick={props.onBack}
      >
        <ChevronLeftIcon />
        Syntax analysis
      </Button>
    </div>
  );
};
