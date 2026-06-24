import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  { ignores: ["dist/**", "dist-ssr/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        queueMicrotask: "readonly",
        AbortController: "readonly",
        ResizeObserver: "readonly",
        File: "readonly",
        Blob: "readonly",
        structuredClone: "readonly",
        navigator: "readonly",
        self: "readonly",
        global: "readonly",
        performance: "readonly",
        define: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "off",
      "no-func-assign": "off",
      "no-fallthrough": "off",
      "no-cond-assign": "off",
      "no-unsafe-finally": "off",
      "no-empty": "off",
      "no-sparse-arrays": "off",
      "no-prototype-builtins": "off",
      "no-useless-assignment": "off",
    },
  },
];
