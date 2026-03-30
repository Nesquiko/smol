## LL(1) Transition Table

| Non-terminal      | **BEGIN** | **END** | **READ** | **WRITE** | **IF** | **ELSE** | **THEN** | **OR** | **AND** | **NOT** | **TRUE** | **FALSE** | **IDENT** | **NUMBER** | **ASSIGN** | **SEMI** | **LPAREN** | **RPAREN** | **COMMA** | **PLUS** | **MINUS** | **$** |
| ----------------- | --------- | ------- | -------- | --------- | ------ | -------- | -------- | ------ | ------- | ------- | -------- | --------- | --------- | ---------- | ---------- | -------- | ---------- | ---------- | --------- | -------- | --------- | ----- |
| `program`         |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement_list`  |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement_list'` |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `statement`       |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `else`            |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `id_list`         |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `id_list'`        |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expr_list`       |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expr_list'`      |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expression`      |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `expression'`     |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `factor`          |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `op`              |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bexpr`           |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bexpr'`          |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bterm`           |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bterm'`          |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |
| `bfactor`         |           |         |          |           |        |          |          |        |         |         |          |           |           |            |            |          |            |            |           |          |           |       |

## Rules

1. `program` -> **BEGIN** `statement_list` **END**
   - F1 = {**BEGIN**}
2. `statement_list` -> `statement` `statement_list'`
   - F1 = {**IDENT**, **READ**, **WRITE**, **IF**}
3. `statement_list'` -> e
   - FO1 = {**END**}
4. `statement_list'` -> `statement_list`
   - F1 = {**IDENT**, **READ**, **WRITE**, **IF**}
5. `statement` -> **IDENT** **ASSIGN** `expression` **SEMI**
   - F1 = {**IDENT**}
6. `statement` -> **READ** **LPAREN** `id_list` **RPAREN** **SEMI**
   - F1 = {**READ**}
7. `statement` -> **WRITE** **LPAREN** `expr_list` **RPAREN** **SEMI**
   - F1 = {**WRITE**}
8. `statement` -> **IF** `bexpr` **THEN** `statement` `else` **SEMI**
   - F1 = {**IF**}
9. `else` -> e
   - FO1 = {**SEMI**}
10. `else` -> **ELSE** `statement`
    - F1 = {**ELSE**}
11. `id_list` -> **IDENT** `id_list'`
    - F1 = {**IDENT**}
12. `id_list'` -> e
    - FO1 = {**RPAREN**}
13. `id_list'` -> **COMMA** `id_list`
    - F1 = {**COMMA**}
14. `expr_list` -> `expression` `expr_list'`
    - F1 = {**IDENT**, **NUMBER**, **LPAREN**}
15. `expr_list'` -> e
    - FO1 = {**RPAREN**}
16. `expr_list'` -> **COMMA** `expr_list`
    - F1 = {**COMMA**}
17. `expression` -> `factor` `expression'`
    - F1 = {**IDENT**, **NUMBER**, **LPAREN**}
18. `expression'` -> e
    - FO1 = {**SEMI**, **COMMA**, **RPAREN**}
19. `expression'` -> `op` `factor` `expression'`
    - F1 = {**PLUS**, **MINUS**}
20. `factor` -> **IDENT**
    - F1 = {**IDENT**}
21. `factor` -> **NUMBER**
    - F1 = {**NUMBER**}
22. `factor` -> **LPAREN** `expression` **RPAREN**
    - F1 = {**LPAREN**}
23. `op` -> **PLUS**
    - F1 = {**PLUS**}
24. `op` -> **MINUS**
    - F1 = {**MINUS**}
25. `bexpr` -> `bterm` `bexpr'`
    - F1 = {**NOT**, **LPAREN**, **TRUE**, **FALSE**}
26. `bexpr'` -> e
    - FO1 = {**THEN**, **RPAREN**}
27. `bexpr'` -> **OR** `bterm` `bexpr'`
    - F1 = {**OR**}
28. `bterm` -> `bfactor` `bterm'`
    - F1 = {**NOT**, **LPAREN**, **TRUE**, **FALSE**}
29. `bterm'` -> e
    - FO1 = {**OR**, **THEN**, **RPAREN**}
30. `bterm'` -> **AND** `bfactor` `bterm'`
    - F1 = {**AND**}
31. `bfactor` -> **NOT** `bfactor`
    - F1 = {**NOT**}
32. `bfactor` -> **LPAREN** `bexpr` **RPAREN**
    - F1 = {**LPAREN**}
33. `bfactor` -> **TRUE**
    - F1 = {**TRUE**}
34. `bfactor` -> **FALSE**
    - F1 = {**FALSE**}
