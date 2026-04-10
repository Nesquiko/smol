import CaseSensitiveIcon from "lucide-solid/icons/case-sensitive";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import FileIcon from "lucide-solid/icons/file";
import FileChartColumnIncreasingIcon from "lucide-solid/icons/file-chart-column-increasing";
import FileInputIcon from "lucide-solid/icons/file-input";
import TextAlignStartIcon from "lucide-solid/icons/text-align-start";
import { Accessor, Component, createMemo, createSignal, For, Setter } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion } from "solid-motionone";

import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { FILE_EXAMPLES, InputExample } from "~/lib/data/file-examples";

type ExampleGroup = {
  heading: string;
  examples: Accessor<Array<InputExample>>;
};

interface InputCommandProps {
  fileContent: Accessor<string | undefined>;
  setFileContent: Setter<string | undefined>;
  onContinue: () => void;
}

export const InputCommand: Component<InputCommandProps> = (props: InputCommandProps) => {
  const [open, setOpen] = createSignal<boolean>(false);
  const [selectedFileName, setSelectedFileName] = createSignal<string | undefined>(undefined);
  const [hovered, setHovered] = createSignal<string | undefined>(undefined);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSelect = async (example: InputExample) => {
    setSelectedFileName(example.name);

    setOpen(false);

    const response: Response = await fetch(example.path + "?raw");
    const text: string = await response.text();

    props.setFileContent(text);
    props.onContinue();
  };

  const correctExamples: Accessor<Array<InputExample>> = createMemo(
    (): Array<InputExample> =>
      FILE_EXAMPLES.filter((e: InputExample): boolean => !e.intentionalError),
  );
  const incorrectExamples: Accessor<Array<InputExample>> = createMemo(
    (): Array<InputExample> =>
      FILE_EXAMPLES.filter((e: InputExample): boolean => !!e.intentionalError),
  );

  const exampleGroups: Accessor<Array<ExampleGroup>> = () =>
    [
      {
        heading: "Correct examples",
        examples: correctExamples,
      } satisfies ExampleGroup,
      {
        heading: "Examples with error",
        examples: incorrectExamples,
      } satisfies ExampleGroup,
    ] satisfies Array<ExampleGroup>;

  return (
    <>
      <Button
        onClick={handleOpen}
        class="relative w-full max-w-full cursor-pointer overflow-hidden bg-primary-700 text-primary-100 hover:bg-primary-700/90"
        classList={{
          "bg-primary-700 hover:bg-primary-700/90 text-primary-100":
            props.fileContent() === undefined,
          "bg-primary-500 hover:bg-primary-500/90 text-primary-900":
            props.fileContent() !== undefined,
        }}
      >
        <span class="min-w-0 flex-1 truncate text-center">
          {selectedFileName() ?? "Choose input file"}
        </span>

        <Dynamic
          component={props.fileContent() === undefined ? FileInputIcon : CircleCheckIcon}
          class="absolute top-3 left-3 size-6"
          classList={{
            "text-primary-900": props.fileContent() !== undefined,
            "text-primary-100": props.fileContent() === undefined,
          }}
        />
      </Button>

      <CommandDialog open={open()} onOpenChange={setOpen}>
        <CommandInput placeholder="Search input file..." />
        <CommandList>
          <CommandEmpty>No examples found.</CommandEmpty>
          <For each={exampleGroups()}>
            {(group: ExampleGroup) => (
              <CommandGroup heading={group.heading}>
                <For each={group.examples()}>
                  {(example: InputExample) => {
                    const isHovered = (): boolean => hovered() === example.id;

                    return (
                      <CommandItem
                        onSelect={() => handleSelect(example)}
                        onMouseEnter={() => setHovered(example.id)}
                        onMouseLeave={() => setHovered(undefined)}
                        class="group relative flex cursor-pointer py-2 text-sm"
                      >
                        <Dynamic
                          component={isHovered() ? FileChartColumnIncreasingIcon : FileIcon}
                          class="mr-2 inline-block p-[2px] text-primary-500"
                        />
                        <span>{example.name}</span>

                        <Motion.div
                          class="absolute right-4 flex w-fit items-center justify-end gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: isHovered() ? 1 : 0,
                            x: isHovered() ? 0 : 20,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Tooltip placement="top" openDelay={0} closeDelay={0}>
                            <TooltipTrigger as="div">
                              <TextAlignStartIcon class="mr-1 inline-block p-[2px] text-primary-500" />
                              <span class="text-xs">{example.lineCount}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {example.lineCount}
                              <span class="text-primary-500"> lines</span>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip placement="top" openDelay={0} closeDelay={0}>
                            <TooltipTrigger as="div">
                              <CaseSensitiveIcon class="mr-1 inline-block p-[2px] text-primary-500" />
                              <span class="text-xs">{example.characterCount}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {example.characterCount}
                              <span class="text-primary-500"> characters</span>
                            </TooltipContent>
                          </Tooltip>
                        </Motion.div>
                      </CommandItem>
                    );
                  }}
                </For>
              </CommandGroup>
            )}
          </For>
        </CommandList>
      </CommandDialog>
    </>
  );
};
