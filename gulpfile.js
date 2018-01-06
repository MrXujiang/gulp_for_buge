var gulp = require('gulp'),
    //压缩js文件
    uglify = require('gulp-uglify'),
    //重命名文件
    rename = require('gulp-rename'),
    //压缩css文件
    cssnano = require('gulp-cssnano'),
	// 自动前缀
	prefix = require('gulp-autoprefixer'),
    //less文件
    less = require('gulp-less'),
	// 忽略错误，继续监听
	plumber = require('gulp-plumber'),
    //压缩html
    htmlmin = require('gulp-htmlmin'),
    //压缩图片
    imagemin = require('gulp-imagemin'),
	//插入文件指纹（MD5）
	rev = require('gulp-rev-append'),
    //合并文件
    concat = require('gulp-concat'),
    //项目清理
    clean = require('gulp-clean'),
	// 动态更新代码
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	// 监听变化的文件
	watchPath = require('gulp-watch-path'),
	// 编译js
	babel = require('gulp-babel'),
	// 忽略js错误，继续执行gulp
	combiner = require('stream-combiner2'),
	// gulp异常捕获插件
	gutil = require('gulp-util'),
	// 生成雪碧图
	spritesmith = require('gulp.spritesmith'),
	// 生成zip
	zip = require('gulp-zip'),
	// 同步任务
	step = require('gulp-sequence');
	
//压缩编译js
gulp.task('convertJS', function(){
  return gulp.src('src/js/*.js')
    // 编译js
//  .pipe(babel({
//  	presets: ['es2015']
//  }))
    // 这会输出一个压缩过的并且重命名为 foo.min.js 的文件
    .pipe(uglify())
//  .pipe(rename({ extname: '.min.js' }))
	.pipe(rev())
    .pipe(gulp.dest('dist/js/'));
});

// 合并并压缩css
gulp.task('convertCSS', function(){
  return gulp.src(['src/css/**/*.css'])
// 忽略错误检查
	.pipe(plumber())
// 文件合并为一个文件app.css
//  .pipe(concat('app.css'))
	.pipe(cssnano())
    .pipe(prefix())
//  .pipe(rename({ suffix: '.min' }))
	.pipe(rev())
    .pipe(gulp.dest('dist/css/'));
});

// 编译less
gulp.task('convertLess', function(){
  return gulp.src('src/css/less/*.less')
// 忽略错误检测,必须放在less前面
	.pipe(plumber())
    .pipe(less())
	.pipe(gulp.dest('src/css/'))
	.pipe(cssnano())
    .pipe(prefix())
//  .pipe(rename({ suffix: '.min' }))
	.pipe(rev())
    .pipe(gulp.dest('dist/css/'))
// 文件变化时实时刷新浏览器
    .pipe(reload({
        stream: true
    }));
});

// 合并并压缩html
gulp.task('convertHTML', function(){
  return gulp.src('src/*.html')
	.pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
    }))
	.pipe(rev())
    .pipe(gulp.dest('dist/'));
});

//压缩图片
gulp.task('convertIMG', function(){
  return  gulp.src(['src/img/**/*'])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));
});

// 生成雪碧图
gulp.task('sprite',function(){
	return gulp.src('src/img/icon/**.jpg')
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css'
	}))
	.pipe(gulp.dest('dist/css'));
})

//引入其他资源
gulp.task('moveLib', function(){
  gulp.src('src/css/lib/*')
    .pipe(gulp.dest('dist/css/lib/'));
  gulp.src('src/js/lib/*')
    .pipe(gulp.dest('dist/js/lib/'));
  gulp.src('src/css/fonts/*')
    .pipe(gulp.dest('dist/css/fonts/'));
});
//目标目录清理
gulp.task('clean', function() {
  gulp.src(['dist'], {read: false})
    .pipe(clean());
});
// 设置监听路径
var src = {
	less: 'src/css/less/*.less',
	html: 'src/*.html',
	css: ['src/css/**/*.css'],
	js: ['src/js/**/*.js'],
	img: ['src/img/**/*']
};
// js错误处理
var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
};
// 自动更新
gulp.task('server', function () {
	browserSync.init({
	    files:['**'],
	    server:{
	        baseDir:'./src', // 设置服务器的根目录
	        index:'index.html' // 指定默认打开的文件
	    },
	    port:8050  // 指定访问服务器的端口号
	});
	gulp.watch(src.less,function(event){
		var paths = watchPath(event, 'src/css/', 'dist/css/');
		gulp.src(paths.srcPath)
		.pipe(plumber())
	    .pipe(less())
		.pipe(gulp.dest('src/css/'))
		.pipe(cssnano())
	    .pipe(prefix())
	//  .pipe(rename({ suffix: '.min' }))
	    .pipe(gulp.dest('dist/css/'))
	// 文件变化时实时刷新浏览器
	    .pipe(reload({
	        stream: true
	    }));
	});
	gulp.watch(src.css,function(event){
		var paths = watchPath(event, 'src/css/', 'dist/css/'),
		    distDir = paths.distDir;
		gulp.src(paths.srcPath)
		.pipe(plumber())
		.pipe(cssnano())
	    .pipe(prefix())
	    .pipe(gulp.dest(distDir));
	}).on('change',reload);
	gulp.watch(src.html,function(event){
		var paths = watchPath(event, 'src/', 'dist/');
		gulp.src(paths.srcPath)
		.pipe(htmlmin({
	        collapseWhitespace: true,
	        removeComments: true
	    }))
	    .pipe(gulp.dest('dist/'));
	}).on('change',reload);
	gulp.watch(src.js,function(event){
		var paths = watchPath(event, 'src/js/', 'dist/js/'),
		distDir = paths.distDir;
		var combined = combiner.obj([
			gulp.src(paths.srcPath),
			// 编译js
		//  .pipe(babel({
		//  	presets: ['es2015']
		//  }))
	    // 这会输出一个压缩过的并且重命名为 foo.min.js 的文件
	    	uglify(),
	//  .pipe(rename({ extname: '.min.js' }))
	        gulp.dest(distDir)
		]);
		combined.on('error',handleError);
		
	}).on('change',reload);
	gulp.watch(src.img,function(event){
		var paths = watchPath(event, 'src/img/', 'dist/img/'),
		distDir = paths.distDir;
		gulp.src(paths.srcPath)
		.pipe(imagemin())
    	.pipe(gulp.dest(distDir));
	}).on('change',reload);
})

/* zip 压缩包 */
gulp.task('zip', function() {

    function checkTime(i) {
        if (i < 10) { i = '0' + i; }
        return i;
    }

    var d = new Date();
    var year = d.getFullYear();
    var month = checkTime(d.getMonth() + 1);
    var day = checkTime(d.getDate());
    var hour = checkTime(d.getHours());
    var minute = checkTime(d.getMinutes());

    var time = String(year) + String(month) + String(day) + String(hour) + String(minute);
    var build = 'build-' + time + '.zip';
    
    return gulp
        .src(['dist/**/*'])
        .pipe(zip(build))
        .pipe(gulp.dest('zip'));
});


gulp.task('build', ['convertJS', 'convertCSS', 'convertHTML', 'convertIMG','moveLib']);
// 实时刷新监听
gulp.task('run',step('build','server'));

// ***使用方法:
// 1.自动更新页面  gulp server
// 2.打包压缩   gulp build
// 3.生成zip gulp zip
// ***功能: 
// 1.压缩js/css/图片
// 2.合并文件
// 3.重命名文件
// 4.编译ES6语法
// 5.自动添加css前缀
// 6.自动刷新页面
// 7.生成雪碧图
// 8.删除目录或文件
// 9.编译less
// 10.生成压缩文件
// ***注意
// 不使用babel编译时gulp-minJs不支持es6压缩，会报错
// require.js系统不能用babel编译
// 若对文件改变后浏览器没有实时更新,此时手动刷新即可(该问题是浏览器缓存造成的)
// 无法同步对文件的删除操作
