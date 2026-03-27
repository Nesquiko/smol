- `program` -> _BEGIN_`statement_list`_END_

- `statement_list` -> `statement` | `statement` `statement_list`

- `statement` -> `ident`_:=_`expression`_;_

- `statement` -> _READ_ _(_`id_list`_)_ _;_

- `statement` -> _WRITE_ _(_`expr_list`_)_ _;_

- `statement` -> _IF_`bexpr`_THEN_`statement` `else`_;_

- `else` -> e | _ELSE_`statement`

- `id_list` -> `ident` | `ident`_,_`id_list`

- `expr_list` -> `expression` | `expression`_,_`expr_list`

- `factor` -> _(_`expression`_)_

- `factor` -> `ident` | `number`

- `op` -> _+_ | _−_

- `bexpr` -> `bterm` | `bexpr`_OR_`bterm`

- `bterm` -> `bfactor` | `bterm`_AND_`bfactor`

- `bfactor` -> _NOT_`bfactor` | _(_`bexp`_)_ | _TRUE_ | _FALSE_

- `ident` -> `letter` `dent`

- `dent` -> e | `letter` `dent` | `digit09` `dent`

- `letter` -> _a_ | .. | _z_ | _A_ | .. | _Z_

- `number` -> `sign` `digit19` `umber`

- `umber` -> e | `digit09` `umber`

- `sign` -> e | _+_ | _-_

- `digit09` -> _0_ | .. | _9_

- `digit19` -> _1_ | .. | _9_
