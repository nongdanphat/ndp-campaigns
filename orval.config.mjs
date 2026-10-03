import { defineConfig } from "orval";

export default defineConfig({
  ndp: {
    input: {
      target: "./swagger-spec.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      schemas: "./src/api/generated/model",
      client: "fetch",
      clean: true,
      indexFiles: false,
      override: {
        mutator: {
          path: "./src/api/mutator.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
