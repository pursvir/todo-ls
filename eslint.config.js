import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
  { ignores: ["dist/**", "node_modules/**", "tests/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint },
    languageOptions: {
      parser: parser,
      parserOptions: { ecmaVersion: 2020, sourceType: "module" },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
    },
  },
];
