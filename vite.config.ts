import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app is deployed to GitHub Pages at https://<user>.github.io/hello-world/
// so the base path must match the repository name. For local dev (`npm run dev`)
// Vite serves from "/" regardless, so this only affects production builds.
export default defineConfig({
  base: '/hello-world/',
  plugins: [react()],
})
