import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    splitting: false,
    clean: true,
    dts: true,
    format: ["cjs", "esm"],
    outDir: "dist",
    outExtension({ format }) {
        return {
            js: `.${format}.js`,
        };
    },
});
