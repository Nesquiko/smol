import { Accessor, Component, createSignal, For, Setter } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  cloneParseTable,
  DEFAULT_PARSE_TABLE,
  NON_TERMINAL_ORDER,
  RULE_NUMBERS,
  TERMINALS,
} from "~/lib/parsing/transition-table";
import { ParseTable } from "~/lib/types";

type DraftCellValue = string;

type TableDraft = Record<string, Record<string, DraftCellValue>>;

interface TransitionTableProps {
  parseTable: Accessor<ParseTable>;
  setParseTable: Setter<ParseTable>;
}

const toDraftTable = (table: ParseTable): TableDraft =>
  Object.fromEntries(
    NON_TERMINAL_ORDER.map((nonTerminal: string) => [
      nonTerminal,
      Object.fromEntries(
        TERMINALS.map((terminal: string) => [
          terminal,
          table[nonTerminal]?.[terminal] !== undefined ? String(table[nonTerminal][terminal]) : "",
        ]),
      ),
    ]),
  );

const toParseTable = (draftTable: TableDraft): ParseTable =>
  Object.fromEntries(
    NON_TERMINAL_ORDER.map((nonTerminal: string) => [
      nonTerminal,
      Object.fromEntries(
        TERMINALS.flatMap((terminal: string): Array<[string, number]> => {
          const ruleNumber: string = draftTable[nonTerminal]?.[terminal] ?? "";
          return ruleNumber === "" ? [] : [[terminal, Number(ruleNumber)]];
        }),
      ),
    ]),
  );

export const TransitionTable: Component<TransitionTableProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftTable, setDraftTable] = createStore<TableDraft>(toDraftTable(DEFAULT_PARSE_TABLE));

  const syncDraftTable = (table: ParseTable): void => {
    setDraftTable(reconcile(toDraftTable(table)));
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);
    syncDraftTable(props.parseTable());
    setIsEditing(false);
  };

  const updateCell = (nonTerminal: string, terminal: string, value: string): void => {
    setDraftTable(nonTerminal, terminal, value);
  };

  const resetToDefault = (): void => {
    syncDraftTable(DEFAULT_PARSE_TABLE);
  };

  const confirmChanges = (): void => {
    const nextParseTable: ParseTable = cloneParseTable(toParseTable(draftTable));
    props.setParseTable(nextParseTable);
    syncDraftTable(nextParseTable);
    setIsEditing(false);
  };

  return (
    <Dialog open={open()} onOpenChange={handleOpenChange}>
      <DialogTrigger
        as={Button}
        variant="default"
        size="sm"
        class="absolute top-full z-30 mt-6 w-full cursor-pointer"
      >
        Transition Table
      </DialogTrigger>

      <DialogContent class="h-full max-h-[90vh] w-full max-w-[90vw] overflow-auto bg-primary-900 p-0">
        <div class="sticky top-0 z-30 border-b border-white/10 bg-primary-900/95 p-4 backdrop-blur">
          <DialogHeader class="gap-2 text-left">
            <DialogTitle>Transition Table</DialogTitle>
            <DialogDescription class="text-muted-foreground/80">
              Confirmed changes are used by the syntax parser. Closing the dialog discards any
              unconfirmed edits.
            </DialogDescription>
          </DialogHeader>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer"
              disabled={isEditing()}
              onClick={() => setIsEditing(true)}
            >
              Edit table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="cursor-pointer"
              disabled={!isEditing()}
              onClick={resetToDefault}
            >
              Reset to default
            </Button>
            <Button
              variant="default"
              size="sm"
              class="cursor-pointer"
              disabled={!isEditing()}
              onClick={confirmChanges}
            >
              Confirm
            </Button>
          </div>
        </div>

        <fieldset
          disabled={!isEditing()}
          class="border-0 p-0"
          classList={{ "opacity-70": !isEditing() }}
        >
          <Table class="w-full table-fixed border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead class="sticky left-0 z-20 w-30 border-r bg-primary-900 px-2 text-left">
                  <div class="w-full overflow-hidden text-center text-ellipsis whitespace-nowrap select-none" />
                </TableHead>

                <For each={TERMINALS}>
                  {(header: string) => (
                    <TableHead
                      class="w-20 truncate border-r bg-primary-900 px-2 text-center hover:bg-white/5"
                      title={header}
                    >
                      <div class="w-full overflow-hidden text-center text-ellipsis whitespace-nowrap select-none">
                        {header}
                      </div>
                    </TableHead>
                  )}
                </For>
              </TableRow>
            </TableHeader>

            <TableBody>
              <For each={NON_TERMINAL_ORDER}>
                {(nonTerminal: string) => (
                  <TableRow>
                    <TableCell class="sticky left-0 z-10 w-30 border-r bg-primary-900 px-2">
                      <div class="overflow-hidden text-ellipsis whitespace-nowrap select-none">
                        {nonTerminal}
                      </div>
                    </TableCell>

                    <For each={TERMINALS}>
                      {(terminal: string) => (
                        <TableCell class="w-20 border-r bg-primary-800 px-2">
                          <select
                            class="h-8 w-full cursor-pointer rounded border border-transparent bg-primary-800 px-1 text-center text-xs font-bold focus-visible:border-primary-300 focus-visible:outline-none disabled:cursor-not-allowed"
                            value={draftTable[nonTerminal]?.[terminal] ?? ""}
                            onChange={(event) =>
                              updateCell(nonTerminal, terminal, event.currentTarget.value)
                            }
                          >
                            <option value="">-</option>
                            <For each={RULE_NUMBERS}>
                              {(ruleNumber: number) => (
                                <option value={String(ruleNumber)}>{ruleNumber}</option>
                              )}
                            </For>
                          </select>
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};
