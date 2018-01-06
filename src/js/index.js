require.config({
	paths: {
		"jquery": "lib/jquery-3.2.1",
		"unslider": "lib/unslider.min"
	},
	urlArgs: "_=" + new Date().getTime(),
	shim: {
		"unslider": {
			deps: ["jquery"],
			exports: "unslider"
		}
	}
});

require(["jquery","unslider"],function($,unslider){
	$(document).ready(function(e) {
		// 首页轮播图
	    var unslider = $('#banner').unslider({
			dots: true
		}),
		data = unslider.data('unslider');
		$('.unslider-arrow').click(function() {
	        var fn = this.className.split(' ')[1];
	        data[fn]();
	        // zhehsi
	   });
	});
})
console.log(111333);
