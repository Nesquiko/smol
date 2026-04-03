import { Accessor, createMemo, For } from "solid-js";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { PARSE_TABLE, TERMINALS } from "~/lib/parsing/transition-table";

type TableRows = Array<{
  cells: Array<string>;
}>;

type TableDisplay = {
  header: Array<string>;
  rows: TableRows;
};

export const TransitionTable = () => {
  const table: Accessor<TableDisplay> = createMemo((): TableDisplay => {
    const rows: TableRows = Object.entries(PARSE_TABLE).map(([nonTerminal, transitions]) => ({
      cells: [
        nonTerminal,
        ...TERMINALS.map((t: string): string =>
          transitions[t] !== undefined ? String(transitions[t]) : "",
        ),
      ],
    }));

    return {
      header: ["", ...TERMINALS],
      rows,
    };
  });

  return (
    <Dialog>
      <DialogTrigger
        as={Button}
        variant="default"
        size="sm"
        class="absolute top-full z-30 mt-6 w-full cursor-pointer"
      >
        Transition Table
      </DialogTrigger>

      <DialogContent class="h-full max-h-[90vh] w-full max-w-[90vw] overflow-auto bg-primary-900 p-0">
        <Table class="w-full table-fixed border-collapse">
          <TableHeader>
            <TableRow>
              <For each={table().header}>
                {(header: string, index: Accessor<number>) => (
                  <TableHead
                    class="border-r hover:bg-white/5"
                    classList={{
                      "px-2 w-30 text-left bg-primary-900 sticky left-0 z-20": index() === 0,
                      "text-center px-2 w-20 truncate bg-primary-900": index() !== 0,
                    }}
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
            <For each={table().rows}>
              {(row: { cells: Array<string> }) => (
                <TableRow>
                  <For each={row.cells}>
                    {(cell: string, index: Accessor<number>) => (
                      <TableCell
                        class="border-r hover:bg-white/5"
                        classList={{
                          "px-2 w-30 bg-primary-900 sticky left-0 z-10": index() === 0,
                          "text-center px-2 w-20 font-bold truncate bg-primary-800": index() !== 0,
                        }}
                      >
                        <div class="overflow-hidden text-ellipsis whitespace-nowrap select-none">
                          {cell}
                        </div>
                      </TableCell>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
