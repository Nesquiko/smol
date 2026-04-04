import CaseSensitiveIcon from "lucide-solid/icons/case-sensitive";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import FileIcon from "lucide-solid/icons/file";
import FileChartColumnIncreasingIcon from "lucide-solid/icons/file-chart-column-increasing";
import FileInputIcon from "lucide-solid/icons/file-input";
import TextAlignStartIcon from "lucide-solid/icons/text-align-start";
import { Accessor, Component, createSignal, For, Setter } from "solid-js";
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

interface InputCommandProps {
  fileContent: Accessor<string | undefined>;
  setFileContent: Setter<string | undefined>;
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
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        class="relative w-full max-w-full cursor-pointer overflow-hidden bg-primary-700 hover:bg-primary-700/90"
        classList={{
          "bg-primary-700 hover:bg-primary-700/90": props.fileContent() === undefined,
          "bg-primary-600 hover:bg-primary-600/90": props.fileContent() !== undefined,
        }}
      >
        <span class="min-w-0 flex-1 truncate text-center">
          {selectedFileName() ?? "Choose input file"}
        </span>

        <Dynamic
          component={props.fileContent() === undefined ? FileInputIcon : CircleCheckIcon}
          class="absolute top-3 left-3 size-6"
          classList={{
            "text-primary-300": props.fileContent() !== undefined,
            "text-primary-500": props.fileContent() === undefined,
          }}
        />
      </Button>

      <CommandDialog open={open()} onOpenChange={setOpen}>
        <CommandInput placeholder="Search input file..." />
        <CommandList>
          <CommandEmpty>No examples found.</CommandEmpty>
          <CommandGroup heading="Examples">
            <For each={FILE_EXAMPLES}>
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
        </CommandList>
      </CommandDialog>
    </>
  );
};
