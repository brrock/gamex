import { Options, defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["index.ts"],
  banner: {
    js: "'use client'",
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: ["react"],
  injectStyle: true,
  ...options,
}));
