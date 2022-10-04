const dotenv = require("dotenv").config();
const gnodemon = require('gulp-nodemon')
const { watch, task, series, dest } = require('gulp');

task('dev', async () => {
    gnodemon({
      script: "server.js",
      require: '.env',
      ignore: [ 'node_modules/**',
                'sessions/**',
                'uploads/**'
              ],
      ext: 'css js ejs',
      verbose: true,
      watch: [ 
               '*.js',
               './*.js',
               './**/*.js',
               './**/**/*.js',
                './public/*',
               './views/**/*.ejs',
               './config/*.*'
            ],
      env: {'NODE_ENV': 'development'}
    });
})
  
task('production', async () => {
  gnodemon({
    script: "server.js",
    require: '.env',
    ignore: ['node_modules/**','views/**/**','./public/**/*.*'],
    ext: 'css js pug',
    verbose: true,
    watch: [ '*.js',
             './*.js',
             './**/*.js',
             './**/**/*.js',
             // './public/css/*.css',
             //'./views/**/*.pug',
             './config/*.*'
          ],
    env: {'NODE_ENV': 'production'}
  });
})

task('default', series('dev'));