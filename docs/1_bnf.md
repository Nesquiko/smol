- `program` := "BEGIN"`statement_list`"END".

- `statement_list` := `statement`{`statement`}.

- `statement` := `ident`":="`expression`";".

- `statement` := "READ""("`id_list`")"";".

- `statement` := "WRITE""("`expr_list`")"";".

- `statement` := "IF"`bexpr`"THEN"`statement`\["ELSE"`statement`\]";".

--else--

- `id_list` := `ident`{","`ident`}.

- `expr_list` := `expression`{","`expression`}.

- `factor` := "("`expression`")".

- `factor` := `ident` | `number`.

- `op` := "+" | "−".

- `bexpr` := \[`bexpr`"OR"\]`bterm`.

- `bterm` := \[`bterm`"AND"\]`bfactor`.

- `bfactor` := "NOT"`bfactor` | "("`bexp`")" | "TRUE" | "FALSE".

- `ident` := `letter`{`letter` | `digit09`}.

--dent--

- `letter` := "a" | .. | "z" | "A" | .. | "Z"

- `number` := \["+" | "−"\]`digit19`{`digit09`}

--umber--

--sign--

- `digit09` := "0" | .. | "9".

- `digit19` := "1" | .. | "9".
