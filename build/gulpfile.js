const gulp = require('gulp');
const rollup = require('rollup');
const terser = require("rollup-plugin-terser").terser

async function build(){
    const bundle = await rollup.rollup({
      input: '../lib/index.js',
      plugins: [
        terser()
      ]
    });

    await bundle.write({
      file: '../dist/easy-canvas.min.js',
      format: 'umd',
      name: 'easyCanvas',
      sourcemap:true
    });
}

gulp.task('build', build);

gulp.task('default',async function(){
  gulp.watch('../lib',build)
})
