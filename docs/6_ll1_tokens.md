## Tokens

- **BEGIN** = _BEGIN_
- **END** = _END_
- **READ** = _READ_
- **WRITE** = _WRITE_
- **IF** = _IF_
- **ELSE** = _ELSE_
- **THEN** = _THEN_
- **OR** = _OR_
- **AND** = _AND_
- **NOT** = _NOT_
- **TRUE** = _TRUE_
- **FALSE** = _FALSE_
- **IDENT** = letter (letter | digit09)\*
- **NUMBER** = sign? digit19 digit09\*

- **ASSIGN** = _:=_
- **SEMI** = _;_
- **LPAREN** = _(_
- **RPAREN** = _)_
- **COMMA** = _,_
- **PLUS** = _+_
- **MINUS** = _-_

## Grammar

After tokenization, `ident` and `number` were replaced in parser rules by
**IDENT** and **NUMBER**, and character rules `dent`, `letter`,
`umber`, `sign`, `digit09`, and `digit19` were removed because they are
handled by the lexer. Therefore, the parser `F1` and `FO1` sets are
computed only over token symbols.

- `program` -> **BEGIN** `statement_list` **END**
  - F1(`program`) = {**BEGIN**}
  - FO1(`program`) = {**$**}

- `statement_list` -> `statement` `statement_list'`
  - F1(`statement_list`) = {**IDENT**, **READ**, **WRITE**, **IF**}
  - FO1(`statement_list`) = {**END**}

- `statement_list'` -> e | `statement_list`
  - F1(`statement_list'`) = {**IDENT**, **READ**, **WRITE**, **IF**, e}
  - FO1(`statement_list'`) = {**END**}

- `statement` -> **IDENT** **ASSIGN** `expression` **SEMI** | **READ** **LPAREN** `id_list` **RPAREN** **SEMI** | **WRITE** **LPAREN** `expr_list` **RPAREN** **SEMI** | **IF** `bexpr` **THEN** `statement` `else` **SEMI**
  - F1(`statement`) = {**IDENT**, **READ**, **WRITE**, **IF**}
  - FO1(`statement`) = {**IDENT**, **READ**, **WRITE**, **IF**, **END**, **ELSE**, **SEMI**}

- `else` -> e | **ELSE** `statement`
  - F1(`else`) = {**ELSE**, e}
  - FO1(`else`) = {**SEMI**}

- `id_list` -> **IDENT** `id_list'`
  - F1(`id_list`) = {**IDENT**}
  - FO1(`id_list`) = {**RPAREN**}

- `id_list'` -> e | **COMMA** `id_list`
  - F1(`id_list'`) = {**COMMA**, e}
  - FO1(`id_list'`) = {**RPAREN**}

- `expr_list` -> `expression` `expr_list'`
  - F1(`expr_list`) = {**IDENT**, **NUMBER**, **LPAREN**}
  - FO1(`expr_list`) = {**RPAREN**}

- `expr_list'` -> e | **COMMA** `expr_list`
  - F1(`expr_list'`) = {**COMMA**, e}
  - FO1(`expr_list'`) = {**RPAREN**}

- `expression` -> `factor` `expression'`
  - F1(`expression`) = {**IDENT**, **NUMBER**, **LPAREN**}
  - FO1(`expression`) = {**SEMI**, **COMMA**, **RPAREN**}

- `expression'` -> e | `op` `factor` `expression'`
  - F1(`expression'`) = {**PLUS**, **MINUS**, e}
  - FO1(`expression'`) = {**SEMI**, **COMMA**, **RPAREN**}

- `factor` -> **IDENT** | **NUMBER** | **LPAREN** `expression` **RPAREN**
  - F1(`factor`) = {**IDENT**, **NUMBER**, **LPAREN**}
  - FO1(`factor`) = {**PLUS**, **MINUS**, **SEMI**, **COMMA**, **RPAREN**}

- `op` -> **PLUS** | **MINUS**
  - F1(`op`) = {**PLUS**, **MINUS**}
  - FO1(`op`) = {**IDENT**, **NUMBER**, **LPAREN**}

- `bexpr` -> `bterm` `bexpr'`
  - F1(`bexpr`) = {**NOT**, **LPAREN**, **TRUE**, **FALSE**}
  - FO1(`bexpr`) = {**THEN**, **RPAREN**}

- `bexpr'` -> e | **OR** `bterm` `bexpr'`
  - F1(`bexpr'`) = {**OR**, e}
  - FO1(`bexpr'`) = {**THEN**, **RPAREN**}

- `bterm` -> `bfactor` `bterm'`
  - F1(`bterm`) = {**NOT**, **LPAREN**, **TRUE**, **FALSE**}
  - FO1(`bterm`) = {**OR**, **THEN**, **RPAREN**}

- `bterm'` -> e | **AND** `bfactor` `bterm'`
  - F1(`bterm'`) = {**AND**, e}
  - FO1(`bterm'`) = {**OR**, **THEN**, **RPAREN**}

- `bfactor` -> **NOT** `bfactor` | **LPAREN** `bexpr` **RPAREN** | **TRUE** | **FALSE**
  - F1(`bfactor`) = {**NOT**, **LPAREN**, **TRUE**, **FALSE**}
  - FO1(`bfactor`) = {**AND**, **OR**, **THEN**, **RPAREN**}
