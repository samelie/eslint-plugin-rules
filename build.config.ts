import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/index"],
    outDir: "dist",
    failOnWarn: false,
    declaration: true,
    clean: true,
    rollup: {
        emitCJS: true,
        cjsBridge: true,
    },
    externals: ["@typescript-eslint/utils", "eslint"],
});
