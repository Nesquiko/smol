import {Accessor, Component, Setter, Show} from "solid-js";

import { InputCommand } from "~/components/input-command";
import {Button} from "~/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";

interface InputScreenProps {
  fileContent: Accessor<string | undefined>;
  setFileContent: Setter<string | undefined>;
  onContinue: () => void;
}

export const InputScreen: Component<InputScreenProps> = (props: InputScreenProps) => {
  return (
    <div class="flex flex-col flex-1 items-center justify-center w-full min-h-screen relative">
      <div class="flex w-full max-w-md items-center justify-center">
        <InputCommand
          fileContent={props.fileContent}
          setFileContent={props.setFileContent}
        />
      </div>

      <div class="absolute p-6 bottom-0 right-0">
        <Show
          when={props.fileContent() !== undefined}
          fallback={
            <Tooltip placement="top" openDelay={0} closeDelay={0}>
              <TooltipTrigger
                as={Button}
                variant="ghost"
                size="default"
                class="w-fit text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60 cursor-not-allowed"
              >
                Lexical configuration
                <ChevronRightIcon/>
              </TooltipTrigger>

              <TooltipContent>
                Choose an input file before continuing
              </TooltipContent>
            </Tooltip>
          }
        >
          <Button
            variant="ghost"
            size="default"
            class="w-fit cursor-pointer"
            onClick={props.onContinue}
          >
            Lexical configuration
            <ChevronRightIcon/>
          </Button>
        </Show>
      </div>
    </div>
  );
};
