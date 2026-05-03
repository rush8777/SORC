import tailwindcss from '@tailwindcss/vite'
import { createViteConfig } from '../shared/vite/createViteConfig'

export default createViteConfig('Editor', {
  plugins: [tailwindcss()],
})
