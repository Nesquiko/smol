import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {Component, createSignal, For, Setter} from "solid-js";
import {Button} from "~/components/ui/button";
import {EXAMPLES, InputExample} from "~/lib/data/examples";

interface InputCommandProps {
  onInput: (text: string) => void;
}

export const InputCommand: Component<InputCommandProps> = (props: InputCommandProps) => {
  const [open, setOpen] = createSignal<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSelect = async (example: InputExample) => {
    setOpen(false);

    const response: Response = await fetch(example.path + "?raw");
    const text: string = await response.text();
    props.onInput(text);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        class="w-full max-w-full overflow-hidden text-foreground bg-primary cursor-pointer"
      >
        <span class="min-w-0 flex-1 truncate text-center">
          Choose input file
        </span>
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
                  class="group flex flex-row items-center justify-start gap-0.5 py-2 cursor-pointer text-sm"
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