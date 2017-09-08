// 依赖 PhantomJS & CasperJS
// var logger = require('./logger').logger;

var casper = require('casper').create({
	verbose: true,
    logLevel: 'error',
    waitTimeout: 15000,
	pageSettings: {
    	// 冒充浏览器
    	// 'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		// 'acceptEncoding':'gzip, deflate, sdch',
		// 'acceptLanguage':'zh-CN,zh;q=0.8',
		// 'cacheControl':'max-age=0',
		// 'connection':'keep-alive',
		// 'cookie':'PHPSESSID=me7a4utrj7mjb9p2nt57r6od01; smidV2=20170801202524ef35e44e1799b7ab0e370238d0b5ebf119368191ac20b7830; _dys_lastPageCode=page_studio_normal,page_studio_normal; acf_did=F331F62A26872BDD257E9E8035A3AE93; Hm_lvt_e99aee90ec1b2106afe7ec3b199020a7=1500345830,1500432187,1500950328,1501040999; Hm_lpvt_e99aee90ec1b2106afe7ec3b199020a7=1501593203; _dys_refer_action_code=show_title_rank',
		// 'host':'www.douyu.com',
		// 'upgradeInsecure-Requests':1,
		'userAgent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
	},
    // 浏览器窗口大小
    viewportSize: {
        width: 320,
        height: 568
    },
    exitOnError: false,
    silentErrors: true,
    onError: function (e) {
        console.log(e);
    },
    clientScripts: [
		// "lib/jQuery-2.1.4.min.js"
    ]
});

phantom.outputEncoding="gbk";

var __clientutils__ = require('clientutils').create();
var __utils__ = require('utils');

// var url = 'https://union-click.jd.com/jdc?d=GpEvtJ';
var url = casper.cli.get(0);    // 通过命令行来接受参数

casper.start(url, function() {
	if (this.exists('img#spec-img')) {
		var imgUrl = this.getElementsAttribute('img#spec-img', 'src');
        if(imgUrl.indexOf('http') == -1) {
            var protocal = url.split(':')[0];
            this.echo('=====' + protocal + ':' + imgUrl + '=====');
        }else {
            this.echo('=====' + imgUrl + '=====');
        }
    }else {
    	this.echo('failed: img#spec-img not exists');
    }
});

casper.then(function() {
    // this.echo('-------------');
    // this.echo('First Page: ' + this.getTitle());
});

casper.run();