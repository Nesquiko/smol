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

- `program` -> **BEGIN** `statement_list` **END**
  - F1(`program`) = {**BEGIN**}
  - FO1(`program`) = {**$**}

- `statement_list` -> `statement` `statement_list'`
  - F1(`statement_list`) = {**IDENT**, **READ**, **WRITE**, **IF**}
  - FO1(`statement_list`) = {**END**}

- `statement_list'` -> e | `statement_list`
  - F1(`statement_list'`) = {**IDENT**, **READ**, **WRITE**, **IF**, e}
  - FO1(`statement_list'`) = {**END**}

- `statement` -> `ident` **ASSIGN** `expression` **SEMI** | **READ** **LPAREN** `id_list` **RPAREN** **SEMI** | **WRITE** **LPAREN** `expr_list` **RPAREN** **SEMI** | **IF** `bexpr` **THEN** `statement` `else` **SEMI**
  - F1(`statement`) = {**IDENT**, **READ**, **WRITE**, **IF**}
  - FO1(`statement`) = {**IDENT**, **READ**, **WRITE**, **IF**, **END**, **ELSE**, **SEMI**}

- `else` -> e | **ELSE** `statement`
  - F1(`else`) = {**ELSE**, e}
  - FO1(`else`) = {**SEMI**}

- `id_list` -> `ident` `id_list'`
  - F1(`id_list`) = {**IDENT**}
  - FO1(`id_list`) = {**RPAREN**}

- `id_list'` -> e | **COMMA** `id_list`
  - F1(`id_list'`) = {**COMMA**, e}
  - FO1(`id_list'`) = {**RPAREN**}

- `expr_list` -> `expression` `expr_list'`
  - F1(`expr_list`) = {**IDENT**, **PLUS**, **MINUS**, **NUMBER**, **LPAREN**}
  - FO1(`expr_list`) = {**RPAREN**}

- `expr_list'` -> e | **COMMA** `expr_list`
  - F1(`expr_list'`) = {**COMMA**, e}
  - FO1(`expr_list'`) = {**RPAREN**}

- `expression` -> `factor` `expression'`
  - F1(`expression`) = {**IDENT**, **PLUS**, **MINUS**, **NUMBER**, **LPAREN**}
  - FO1(`expression`) = {**SEMI**, **COMMA**, **RPAREN**}

- `expression'` -> e | `op` `factor` `expression'`
  - F1(`expression'`) = {**PLUS**, **MINUS**, e}
  - FO1(`expression'`) = {**SEMI**, **COMMA**, **RPAREN**}

- `factor` -> `ident` | `number` | **LPAREN** `expression` **RPAREN**
  - F1(`factor`) = {**IDENT**, **PLUS**, **MINUS**, **NUMBER**, **LPAREN**}
  - FO1(`factor`) = {**PLUS**, **MINUS**, **SEMI**, **COMMA**, **RPAREN**}

- `op` -> **PLUS** | **MINUS**
  - F1(`op`) = {**PLUS**, **MINUS**}
  - FO1(`op`) = {**IDENT**, **PLUS**, **MINUS**, **NUMBER**, **LPAREN**}

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

- `ident` -> **IDENT**
  - F1(`ident`) = {**IDENT**}
  - FO1(`ident`) = {**ASSIGN**, **COMMA**, **RPAREN**, **PLUS**, **MINUS**, **SEMI**}

- `dent` -> e | `letter` `dent` | `digit09` `dent`
  - F1(`dent`) = {**IDENT**, **NUMBER**, e}
  - FO1(`dent`) = {**ASSIGN**, **COMMA**, **RPAREN**, **PLUS**, **MINUS**, **SEMI**}

- `letter` -> **IDENT**
  - F1(`letter`) = {**IDENT**}
  - FO1(`letter`) = {**IDENT**, **NUMBER**, **ASSIGN**, **COMMA**, **RPAREN**, **PLUS**, **MINUS**, **SEMI**}

- `number` -> **NUMBER**
  - F1(`number`) = {**NUMBER**}
  - FO1(`number`) = {**PLUS**, **MINUS**, **SEMI**, **COMMA**, **RPAREN**}

- `umber` -> e | `digit09` `umber`
  - F1(`umber`) = {**NUMBER**, e}
  - FO1(`umber`) = {**PLUS**, **MINUS**, **SEMI**, **COMMA**, **RPAREN**}

- `sign` -> e | **PLUS** | **MINUS**
  - F1(`sign`) = {**PLUS**, **MINUS**, e}
  - FO1(`sign`) = {**NUMBER**}

- `digit09` -> **NUMBER**
  - F1(`digit09`) = {**NUMBER**}
  - FO1(`digit09`) = {**IDENT**, **NUMBER**, **ASSIGN**, **COMMA**, **RPAREN**, **PLUS**, **MINUS**, **SEMI**}

- `digit19` -> **NUMBER**
  - F1(`digit19`) = {**NUMBER**}
  - FO1(`digit19`) = {**NUMBER**, **PLUS**, **MINUS**, **SEMI**, **COMMA**, **RPAREN**}
