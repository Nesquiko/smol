## LL(1) Transition Table

| Non-terminal      | **BEGIN** | **END** | **READ** | **WRITE** | **IF** | **THEN** | **OR** | **AND** | **NOT** | **TRUE** | **FALSE** | **IDENT** | **NUMBER** | **ASSIGN** | **SEMI** | **LPAREN** | **RPAREN** | **COMMA** | **PLUS** | **MINUS** | **$** |
| ----------------- | --------- | ------- | -------- | --------- | ------ | -------- | ------ | ------- | ------- | -------- | --------- | --------- | ---------- | ---------- | -------- | ---------- | ---------- | --------- | -------- | --------- | ----- |
| `program`         |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement_list`  |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement_list'` |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement`       |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `else`            |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `id_list`         |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `id_list'`        |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expr_list`       |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expr_list'`      |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expression`      |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expression'`     |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `factor`          |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `op`              |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bexpr`           |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bexpr'`          |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bterm`           |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bterm'`          |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bfactor`         |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `ident`           |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `dent`            |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `letter`          |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `number`          |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `umber`           |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `sign`            |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `digit09`         |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `digit19`         |           |         |          |           |        |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |

## rules

- `program` -> _BEGIN_`statement_list`_END_
  - F1(`program`) = {_BEGIN_}
  - FO1(`program`) = {$}

- `statement_list` -> `statement` `statement_list'`
  - F1(`statement_list`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _READ_, _WRITE_, _IF_}
  - FO1(`statement_list`) = {_END_}

- `statement_list'` -> e | `statement_list`
  - F1(`statement_list'`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _READ_, _WRITE_, _IF_, e}
  - FO1(`statement_list'`) = {_END_}

- `statement` -> `ident`_:=_`expression`_;_ | _READ_ _(_`id_list`_)_ _;_ | _WRITE_ _(_`expr_list`_)_ _;_ | _IF_`bexpr`_THEN_`statement` `else`_;_
  - F1(`statement`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _READ_, _WRITE_, _IF_}
  - FO1(`statement`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _READ_, _WRITE_, _IF_, _END_, _ELSE_, _;_}

- `else` -> e | _ELSE_`statement`
  - F1(`else`) = {_ELSE_, e}
  - FO1(`else`) = {_;_}

- `id_list` -> `ident` `id_list'`
  - F1(`id_list`) = {_a_ | .. | _z_ | _A_ | .. | _Z_}
  - FO1(`id_list`) = {_)_}

- `id_list'` -> e | _,_`id_list`
  - F1(`id_list'`) = {_,_, e}
  - FO1(`id_list'`) = {_)_}

- `expr_list` -> `expression` `expr_list'`
  - F1(`expr_list`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _+_, _-_, _1_, ..., _9_, _(_}
  - FO1(`expr_list`) = {_)_}

- `expr_list'` -> e | _,_`expr_list`
  - F1(`expr_list'`) = {_,_, e}
  - FO1(`expr_list'`) = {_)_}

- `expression` -> `factor` `expression'`
  - F1(`expression`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _+_, _-_, _1_, ..., _9_, _(_}
  - FO1(`expression`) = {_;_, _,_, _)_}

- `expression'` -> e | `op` `factor` `expression'`
  - F1(`expression'`) = {_+_, _-_, e}
  - FO1(`expression'`) = {_;_, _,_, _)_}

- `factor` -> `ident` | `number` | _(_`expression`_)_
  - F1(`factor`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _+_, _-_, _1_, ..., _9_, _(_}
  - FO1(`factor`) = {_+_, _-_, _;_, _,_, _)_}

- `op` -> _+_ | _−_
  - F1(`op`) = {_+_, _-_}
  - FO1(`op`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _+_, _-_, _1_, ..., _9_, _(_}

- `bexpr` -> `bterm` `bexpr'`
  - F1(`bexpr`) = {_NOT_, _(_, _TRUE_, _FALSE_}
  - FO1(`bexpr`) = {_THEN_, _)_}

- `bexpr'` -> e | _OR_`bterm` `bexpr'`
  - F1(`bexpr'`) = {_OR_, e}
  - FO1(`bexpr'`) = {_THEN_, _)_}

- `bterm` -> `bfactor` `bterm'`
  - F1(`bterm`) = {_NOT_, _(_, _TRUE_, _FALSE_}
  - FO1(`bterm`) = {_OR_, _THEN_, _)_}

- `bterm'` -> e | _AND_`bfactor` `bterm'`
  - F1(`bterm'`) = {_AND_, e}
  - FO1(`bterm'`) = {_OR_, _THEN_, _)_}

- `bfactor` -> _NOT_`bfactor` | _(_`bexpr`_)_ | _TRUE_ | _FALSE_
  - F1(`bfactor`) = {_NOT_, _(_, _TRUE_, _FALSE_}
  - FO1(`bfactor`) = {_AND_, _OR_, _THEN_, _)_}

- `ident` -> `letter` `dent`
  - F1(`ident`) = {_a_ | .. | _z_ | _A_ | .. | _Z_}
  - FO1(`ident`) = {_:=_, _,_, _)_, _+_, _-_, _;_}

- `dent` -> e | `letter` `dent` | `digit09` `dent`
  - F1(`dent`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _0_, _1_, ..., _9_, e}
  - FO1(`dent`) = {_:=_, _,_, _)_, _+_, _-_, _;_}

- `letter` -> _a_ | .. | _z_ | _A_ | .. | _Z_
  - F1(`letter`) = {_a_ | .. | _z_ | _A_ | .. | _Z_}
  - FO1(`letter`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _0_, _1_, ..., _9_, _:=_, _,_, _)_, _+_, _-_, _;_}

- `number` -> `sign` `digit19` `umber`
  - F1(`number`) = {_+_, _-_, _1_, ..., _9_}
  - FO1(`number`) = {_+_, _-_, _;_, _,_, _)_}

- `umber` -> e | `digit09` `umber`
  - F1(`umber`) = {_0_, _1_, ..., _9_, e}
  - FO1(`umber`) = {_+_, _-_, _;_, _,_, _)_}

- `sign` -> e | _+_ | _-_
  - F1(`sign`) = {_+_, _-_, e}
  - FO1(`sign`) = {_1_, ..., _9_}

- `digit09` -> _0_ | .. | _9_
  - F1(`digit09`) = {_0_, _1_, ..., _9_}
  - FO1(`digit09`) = {_a_ | .. | _z_ | _A_ | .. | _Z_, _0_, _1_, ..., _9_, _:=_, _,_, _)_, _+_, _-_, _;_}

- `digit19` -> _1_ | .. | _9_
  - F1(`digit19`) = {_1_, ..., _9_}
  - FO1(`digit19`) = {_0_, _1_, ..., _9_, _+_, _-_, _;_, _,_, _)_}
