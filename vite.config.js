import 'dotenv/config'
import restart from 'vite-plugin-restart'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default {
  root: 'client/',
  envDir: '../',
  publicDir: 'public/',
  base: './',
  server: { host: true, open: false },
  build: { outDir: '../dist', emptyOutDir: true, sourcemap: false },
  plugins: [restart({ restart: ['public/**'] }), nodePolyfills()],
}
