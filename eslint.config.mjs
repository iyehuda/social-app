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
                tsconfigRootDir: import.meta.dirname
            }
        },
        plugins: {
            "@stylistic": stylistic
        },
        rules: {
            "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "eslint-disable-next-line max-statements-per-line": "off",
            "eslint-disable-next-line max-lines-per-function": "off",
            "eslint-disable-next-line max-lines": "off",
            "eslint-disable-next-line max-params": "off",
            "eslint-disable-next-line max-statements": "off",
            "eslint-disable-next-line no-use-before-defined": "off",
            "eslint-disable-next-line @typescript-eslint/no-unsafe-argument": "off",
            "slint-disable-next-line @typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "func-style": ["error", "declaration", { allowArrowFunctions: true }],
            "new-cap": "off",
            "no-console": "off",
            "no-invalid-this": "off",
            "no-magic-numbers": ["error", { ignore: [200, 201, 204, 404, 409, 1, 400, 500] }],
            "no-negated-condition": "off",
            "one-var": ["error", "never"],
            "sort-imports": "off",
            "no-underscore-dangle": "off"
        }
    },
    {
        files: ["tests/**/*.ts"],
        rules: {
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "init-declarations": "off",
            "max-lines-per-function": ["error", { max: 100 }],
            "no-magic-numbers": "off"
        }
    },
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "eslint.config.mjs"]
    }
);