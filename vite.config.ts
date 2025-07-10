import { defineConfig, loadEnv } from 'vite'
import pkg from './package.json'

// 名字+版本号
const nameVersion = `${pkg.name}.${pkg.version.replace(/\./g, '-')}`

export default defineConfig(({ mode, command }) => {
  // .env 文件配置
  const envConf = loadEnv(mode, process.cwd())

  return {
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      lib: {
        entry: './lib/index.ts',
        name: 'Tracker',
        fileName: (format) => `${nameVersion}.${format}.js`,
      },
      outDir: mode === 'production' ? 'dist' : `dist-${mode}`,
      minify: true,
      sourcemap: envConf.VITE_BUILD_SOURCEMAP === 'true',
    },
    server: {
      port: 5199,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
