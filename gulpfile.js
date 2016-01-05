var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    imagemin = require('gulp-imagemin'),
    del = require("del"),
    newer = require('gulp-newer'),
    pkg = require('./package.json'),
    preprocess = require('gulp-preprocess'),
    htmlclean = require('gulp-htmlclean'),
    deporder = require('gulp-deporder'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    browserSync = require('browser-sync').create();
var
    source = 'src/',
    dest = 'build/',
    images = { in : source + 'img/**/*',
            out: dest + 'img'
    },
    js = { in : source + 'js/**/*',
            out: dest + 'js',
            filename: 'app.js'
    },

    devBuild = ((process.env.NODE_ENV || 'development').trim().toLocaleLowerCase() !== 'production'),

    html = { in : source + '*.html',
            watch: [source + '*.html', source + 'template/**/*'],
            out: dest,
            context: {
                devBuild: devBuild,
                author: pkg.author,
                version: pkg.version
            }
    },
    css = { in : source + 'scss/*.scss',
            watch: source + 'scss/**/*',
            out: source + 'css/',
            sassOpt: {
                outpuStyle: 'nested',
                imagePath: '../img',
                precision: 3,
                errLogToConsole: true
            }
    },
    fonts = { in : source + 'css/fonts/*.*',
            out: dest + 'css/fonts/'
    };

console.log(pkg.name + '' + pkg.version + ',' + (devBuild ? 'development' : 'production') + 'build');

//объединение и перенос js
gulp.task('js', function () {
    if (devBuild) {
        return gulp.src(js.in)
            .pipe(gulp.dest(js.out));
    } else {
        return gulp.src(js.in)
            .pipe(deporder())
            .pipe(plugins.concat(js.filename))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(js.out));
    }
});

gulp.task('imagescss', function () {
    return gulp.src(source + 'css/images/*.*').pipe(newer(images.out)).pipe(imagemin()).pipe(gulp.dest(dest + 'css/images'));

});
//оптимизация и перенос картинок
gulp.task('images', ['imagescss'], function () {
    return gulp.src(images.in).pipe(newer(images.out)).pipe(imagemin()).pipe(gulp.dest(images.out));

});

// очистка сборки
gulp.task('clean', function () {
    del([dest + "*"]);
});



gulp.task('html', function () {
    var page = gulp.src(html.in)
        .pipe(preprocess({
            context: html.context
        }));
    if (!devBuild) {
        page = page.pipe(htmlclean());
    }

    return page.pipe(gulp.dest(html.out));
});

gulp.task('sass', function () {
    return gulp.src(css.in).pipe(sass(css.sassOpt)).pipe(gulp.dest(css.out))

});

gulp.task('fonts', function () {
    return gulp.src(fonts.in)
        .pipe(gulp.dest(fonts.out));
});

gulp.task('css', ['sass'], function () {
    if (!devBuild) {
        gulp.src('src/css/**/*').pipe(minifyCss()).pipe(gulp.dest(dest + 'css'));
    } else {
        gulp.src('src/css/**/*').pipe(gulp.dest(dest + 'css'));
    }


});

gulp.task('browser-sync', function () {
    var files = [
      'build/*.html',
      'build/css/**/*.css',
      'build/img/**/*',
      'build/js/**/*.js'
   ];

    browserSync.init(files, {
        server: {
            baseDir: './build'
        }
    });
});

gulp.task("default", ['images', 'html', 'js', 'fonts', 'css'], function () {
    gulp.watch(html.watch, ['html']);
    gulp.watch(images.in, ['images']);
    gulp.watch(css.watch, ['css']);
    gulp.watch(js.in, ['js']);
    gulp.watch(fonts.in, ['fonts']);
});