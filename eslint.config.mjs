import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.all,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    stylistic.configs["recommended-flat"],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                // @ts-expect-error import.meta
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "func-style": ["error", "declaration", { allowArrowFunctions: true }],
            "new-cap": "off",
            "no-console": "off",
            "no-invalid-this": "off",
            "no-magic-numbers": ["error", { ignore: [200, 201, 204, 404, 429] }],
            "no-negated-condition": "off",
            "one-var": ["error", "never"],
        },
    },
    {
        files: ["tests/**/*.ts"],
        rules: {
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "init-declarations": "off",
            "max-lines-per-function": ["error", { max: 100 }],
            "no-magic-numbers": "off",
        },
    },
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "eslint.config.mjs"],
    }
);
