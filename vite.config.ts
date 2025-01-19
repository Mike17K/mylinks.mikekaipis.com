import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [mkcert(), viteCompression()],
  server: {
    port: 4355,
  },
})