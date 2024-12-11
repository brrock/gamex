import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false, // Disable sourcemaps for smaller size
  target: "es2022", // Use modern JavaScript
  minify: true, // Minify output for Edge Function
  external: ["hono"], // Externalize large libraries
  esbuildOptions(options) {
    options.bundle = true; // Bundle dependencies
    options.define = {
      __dirname: "'/'",
      "process.env.NODE_ENV": '"production"',
    };
  },
  onSuccess: () => {

      execSync("tsx src/build/generate-route.ts", { stdio: "inherit" });
  },
});
