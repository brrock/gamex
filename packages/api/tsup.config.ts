// packages/api/tsup.config.ts
import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2020",
  external: ["hono"],
  esbuildOptions(options) {
    options.bundle = true;
    options.define = {
      __dirname: "'/'",
      "process.env.NODE_ENV": '"production"',
    };
  },
  onSuccess: () => {
    return execSync("tsx src/build/generate-route.ts", { stdio: "inherit" });
  },
});
