const gulp = require('gulp');
const rollup = require('rollup');
const terser = require("rollup-plugin-terser").terser

gulp.task('build', async function () {
  const bundle = await rollup.rollup({
    input: '../lib/index.js',
    plugins: [
      terser()
    ]
  });

  await bundle.write({
    file: '../dist/easyCanvas.min.js',
    format: 'umd',
    name: 'easyCanvas',
    sourcemap: false
  });
});
