import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        antique: resolve(__dirname, 'antique.html'),
        jewellery: resolve(__dirname, 'jewellery.html'),
        store: resolve(__dirname, 'store.html'),
        plain: resolve(__dirname, 'plain.html'),
        goldPolished: resolve(__dirname, 'gold-polished.html'),
        templejewellery: resolve(__dirname, 'templejewellery.html'),
        woodenitems: resolve(__dirname, 'woodenitems.html'),
      },
    },
  },
})
