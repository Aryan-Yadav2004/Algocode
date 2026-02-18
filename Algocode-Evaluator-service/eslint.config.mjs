// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  {
    languageOptions:{
      parserOptions:{
        project: true,
        tsconfigRootDir: import.meta.dirname,
      }
    },
    files: ["src/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // semi: ["error", "never"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-floating-promises":"off",
      "require-await": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": "off",
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-explicit-any' : 'off',
      '@typescript-eslint/no-floating-promises' : 'off',
      '@typescript-eslint/no-unsafe-member-access' : 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-misused-promise': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off'
    }
  }
);