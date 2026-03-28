import {LucideIcon, TokenType} from "~/lib/types";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleStopIcon,
  EqualIcon,
  EyeIcon,
  GitBranchIcon,
  GitBranchMinusIcon,
  IdCardIcon,
  MinusIcon,
  PenIcon,
  PlayIcon,
  PlusIcon,
  XIcon
} from "lucide-solid";

export const TOKEN_ICONS: Record<TokenType, LucideIcon | string> = {
  IDENTIFIER: IdCardIcon,
  BEGIN: PlayIcon,
  END: CircleStopIcon,
  READ: EyeIcon,
  WRITE: PenIcon,
  IF: GitBranchIcon,
  THEN: ArrowRightIcon,
  ELSE: GitBranchMinusIcon,
  OR: "|",
  AND: "&",
  NOT: "X",
  TRUE: CheckIcon,
  FALSE: XIcon,
  ":=": EqualIcon,
  "+": PlusIcon,
  "-": MinusIcon,
  ";": ";",
  "(": "(",
  ")": ")",
  ",": ",",
};