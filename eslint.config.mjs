// @ts-check
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginSolid from "eslint-plugin-solid/configs/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  pluginSolid,
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // prohibits relative imports
      "no-restricted-imports": ["error", { patterns: ["../*", "./*"] }],
      // prohibit value imports from lucide-solid (but allow type imports)
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-solid",
              message:
                "Import specific icons from 'lucide-solid/icons/icon-name' instead of the main package to avoid loading all icons in dev mode. Type imports are allowed: import { type LucideProps } from 'lucide-solid'",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
);
