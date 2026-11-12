import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tooling/rpc-timeout.fixture.ts"],
    pool: "forks",
    maxWorkers: 1,
    fileParallelism: false,
  },
});
