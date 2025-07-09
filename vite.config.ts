import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode, command }) => {
  // .env 文件配置
  const envConf = loadEnv(mode, process.cwd());
  // 是否为构建
  const isBuild = command === "build";

  return {
    build: {
      lib: {
        entry: "./lib/index.ts",
        name: "Tracker",
      },
      outDir: mode === "production" ? "dist" : `dist-${mode}`,
      minify: true,
      sourcemap: envConf.VITE_BUILD_SOURCEMAP === "true",
    },
    server: {
      port: 5199,
      host: true,
      open: true,
    },
  };
});
