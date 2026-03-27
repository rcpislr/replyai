import type { Config } from 'tailwindcss'
import path from 'path'

const toPosix = (value: string) => value.replace(/\\/g, '/')

const config: Config = {
  content: [
    toPosix(path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')),
    toPosix(path.join(__dirname, '../../packages/ui-base/src/**/*.{js,ts,jsx,tsx,mdx}')),
    toPosix(path.join(__dirname, '../../packages/ui-dashboard/src/**/*.{js,ts,jsx,tsx,mdx}')),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
