import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import { copyFileSync, mkdirSync } from "fs";

const isProduction = process.argv.includes("production");

esbuild.build({
    entryPoints: ["main.ts"],
    bundle: true,
    format: "cjs",
    target: ["node16"],
    platform: "node",
    external: ["obsidian"],
    outfile: "dist/main.js",
    plugins: [nodeExternalsPlugin()],
    minify: isProduction,
    sourcemap: !isProduction,
}).catch(() => process.exit(1));

try {
    mkdirSync("dist", { recursive: true });
    copyFileSync("manifest.json", "dist/manifest.json");
    copyFileSync("styles.css", "dist/styles.css");
} catch (e) {
    console.error("Error copying static files:", e);
}