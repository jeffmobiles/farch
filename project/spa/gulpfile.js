/**
 * Created by Administrator on 2016/4/19.
 */

var gulp = require("gulp");
var connect  = require("gulp-connect");
var gulpif = require("gulp-if");
var sprites = require("gulp-spritesmith");

var less = require("gulp-less");
/** ÑÇË÷Í¼Æ¬µ½sprite **/
var sourcemaps = require("gulp-sourcemaps");


gulp.task('less', function () {
    gulp.src(['./dev/style/basketball.less','./dev/style/common.less'])
        .pipe(less())
        .pipe(gulp.dest('./dev/style/'));
});
gulp.task('autoprefixer',function(){
    var postcss = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');
    return gulp.src('./dev/module/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer({browsers:['last 2 versions']})]))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dev/output"))
})
gulp.task("map",function(){
    gulp.src("./dev/module/**/*.js").pipe(sourcemaps.init()).pipe(sourcemaps.write("./dev/ouput")).pipe(gulp.dest("./dev/output"))
})
gulp.task("sprites",function(){
    var gupsrc = gulp.src(["./dev/image/*"]).pipe(sprites({
            imgName : "icon.png",
            cssName : "icon.css"
        }))
        .pipe(gulpif("*.png",gulp.dest("./dev/output/")))
    return gupsrc;
})
gulp.task("watch",function(){
    gulp.watch(['./dev/*.html'],['html']);
    gulp.watch(['./dev/*.js','./dev/**/*.js'],['html']);
})

gulp.task("connect",function(){
    connect.server({
        root : "dev" ,
        livereload : true
    })
})
gulp.task("spa-connect",function(){
    connect.server({
        root : "spa-dev",
        livereload : true
    })
})
gulp.task("html",function(){
    gulp.src("./dev/*.html").pipe(connect.reload());
})
gulp.task("spa-html",function(){
    gulp.src(["./spa-dev/*.html","./spa-dev/module/**/*.html"]).pipe(connect.reload());
})
gulp.task("reloadJS",function(){
    gulp.src(["./dev/*.js","./dev/**/*.js"]).pipe(connect.reload());
})
gulp.task("default",["connect","watch"]);

gulp.task("spa",["spa-connect","watch"])