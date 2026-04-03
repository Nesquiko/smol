import {Accessor, Component, createSignal, For, Setter} from "solid-js";

import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { EXAMPLES, InputExample } from "~/lib/data/examples";
import {Dynamic} from "solid-js/web";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import FileInputIcon from "lucide-solid/icons/file-input";

interface InputCommandProps {
  fileContent: Accessor<string | undefined>;
  setFileContent: Setter<string | undefined>;
}

export const InputCommand: Component<InputCommandProps> = (props: InputCommandProps) => {
  const [open, setOpen] = createSignal<boolean>(false);
  const [selectedFileName, setSelectedFileName] = createSignal<string | undefined>(undefined);

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
          class="absolute left-3 top-3 size-6"
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
            <For each={EXAMPLES}>
              {(example: InputExample) => (
                <CommandItem
                  onSelect={() => handleSelect(example)}
                  class="group flex cursor-pointer flex-row items-center justify-start gap-0.5 py-2 text-sm"
                >
                  {example.name}
                </CommandItem>
              )}
            </For>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
