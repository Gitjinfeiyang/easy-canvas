import { terser } from "rollup-plugin-terser";
const path = require('path')

export default {
  input: path.resolve(__dirname, '../lib/index'),
  output: {
    file: path.resolve(__dirname, '../dist/easy-canvas.min.js'),
    format: 'umd',
    name: 'easyCanvas'
  },
  plugins: [
    terser()
  ]
}
