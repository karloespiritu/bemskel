// Include gulp
const gulp = require('gulp')

// Plugins
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const eslint = require('gulp-eslint')
const minify = require('gulp-cssnano')
const rename = require('gulp-rename')

const concat = require('gulp-concat')
const header = require('gulp-header')
const cache = require('gulp-cache')
const pkg = require('./package.json')
const del = require('del')
const size = require('gulp-size')
const bs = require('browser-sync').create()

const banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @homepage <%= pkg.homepage %>',
  ' * @copyright ' + new Date().getFullYear() + ' <%= pkg.author.name %> ',
  ' * @license <%= pkg.license %>',
  ' */',
  '\n'
].join('\n')

const files = {
  lint: [ 'Gulpfile.js', 'package.json' ],
  sass: [ 'src/sass/**/*.scss' ],
  css: [ 'dist/app.css' ],
  clean: [
    'dist/bemskel.css',
    'dist/bemskel.min.css',
    'docs/css/bemskel/bemskel.css',
    'docs/css/bemskel/bemskel.min.css'
  ],
  home: [ 'index.html', 'docs/css/custom.css' ]
}

// Lint Task
gulp.task('lint', function () {
  return (gulp
      .src(files.lint)
      .pipe(
        eslint({
          rules: {
            extends: 'eslint:recommended'
          }
        })
      )
      .pipe(eslint.format())
      // Brick on failure to be super strict
      .pipe(eslint.failOnError()))
})

// Compile Sass
gulp.task('compileSass', function () {
  return gulp
    .src('./src/sass/main.scss')
    .pipe(
      sass({ style: 'expanded', quiet: false, cacheLocation: '.sass-cache' })
    )
    .pipe(sass())
    .pipe(autoprefixer('last 1 version'))
    .pipe(rename('bemskel.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./docs/css/bemskel'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minify({ keepSpecialComments: 0 }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./docs/css/bemskel'))
    .pipe(
      size({
        gzip: true
      })
    )
    .pipe(bs.reload({ stream: true }))
})

// Build CSS - unminified
gulp.task('build', function () {
  gulp.start([ 'compileSass' ])
})

gulp.task('browser-sync', [ 'compileSass' ], function () {
  bs.init({
    server: {
      baseDir: './docs'
    }
  })
})

// Watch Files For Changes
gulp.task('watch', [ 'browser-sync' ], function () {
  // gulp.watch(files.lint, ['scripts']);
  gulp.watch(files.sass, [ 'compileSass' ]).on('change', bs.reload)
  gulp.watch(files.home).on('change', bs.reload)
})

// Clean
gulp.task('clean', function () {
  files.clean.map(function (x) {
    console.log('Deleting ' + x)
  })
  return del(files.clean)
})

// Default Task
gulp.task('default', function () {
  gulp.start([ 'compileSass' ])
})
