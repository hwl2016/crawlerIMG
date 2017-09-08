var request = require('request');
var path = require('path');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var logger = require('../logger').logger;
const child_process = require("child_process");

const imgDir = path.join(__dirname, '../download/');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/img', function(req, res, next) {
	var url = req.query.url;

	child_process.exec(`casperjs crawler.js ${url}`, function(err, stdout, stderr) {
		if(err) {
			res.json({
				code: 500,
				msg: '图片抓取失败'
			});
			return
		}
		if(stdout) {
			var imgUrl = stdout.match(/=====(.*)=====/);
			res.json({
				code: 200,
				msg: 'success',
				imgUrl: imgUrl[1]
			});
		}
	});

});

router.post('/img', function(req, res, next) {
	var url = req.body.target;

	child_process.exec(`casperjs crawler.js ${url}`, function(err, stdout, stderr) {
		if(err) {
			logger.error(stderr);
			return
		}
		if(stderr) {
			logger.error(stderr);
		}
		if(stdout) {
			var imgUrl = stdout.match(/=====(.*)=====/);
			imgUrl = imgUrl[1];
			var ext = imgUrl.slice(imgUrl.lastIndexOf('.'));
			logger.info(`图片格式：${ext}`);
			ext = '.jpg';	//强制修改图片格式为jpg
			var imgName = md5(url) + ext;
			var imgLocalUrl = createDateDir() + imgName;
			// 下载图片
			request(imgUrl).pipe(fs.createWriteStream(imgLocalUrl));
			logger.info(`图片页面路径：${url}`);
			logger.info(`抓取图片成功，图片保存路径：${imgLocalUrl}`);
			// res.json({
			// 	code: 200,
			// 	msg: 'success',
			// 	data: {
			// 		imgOriginUrl: imgUrl,
			// 		imgLocalUrl: imgLocalUrl
			// 	}
			// });
		}else {
			// res.json({
			// 	code: 500,
			// 	msg: err
			// });
		}


	});

	res.json({
		code: 200,
		msg: 'success'
	});

});

router.post('/imgs', function(req, res, next) {
	var target = JSON.parse(req.body.target);
	var queue = [];

	for(let i = 0; i < target.length; i++) {
		let url = target[i];
		queue.push(function(callback) {
			child_process.exec(`casperjs crawler.js ${url}`, function(err, stdout, stderr) {
				if(err) {
					logger.error(err);
					callback(null, {
						err: err
					});
					return
				}

				if(stderr) {
					logger.error(stderr);
					callback(null, {
						stderr: stderr
					});
				}

				if(stdout) {
					console.log(`stdout: ${stdout}`);
					if(stdout.indexOf('failed') != -1) {	// 图片抓取失败
						logger.error(stdout);
						callback(null, {
							failed: stdout
						});
						return;
					}

					var imgUrl = stdout.match(/=====(.*)=====/);
					imgUrl = imgUrl[1];
					var ext = imgUrl.slice(imgUrl.lastIndexOf('.'));
					logger.info(`图片格式：${ext}`);
					ext = '.jpg';	//强制修改图片格式为jpg
					var imgName = md5(url) + ext;
					var imgLocalUrl = createDateDir() + imgName;
					// 下载图片
					request(imgUrl).pipe(fs.createWriteStream(imgLocalUrl));
					logger.info(`图片页面路径：${url}`);
					logger.info(`抓取图片成功，图片保存路径：${imgLocalUrl}`);

					callback(null, {
						imgOriginUrl: imgUrl,
						imgLocalUrl: imgLocalUrl
					})
				}
			});
		});
	}

	async.parallel(queue, (err, results) => {
		if(err) {
			res.json({
				code: 500,
				msg: err
			});
		}else {
			res.json({
				code: 200,
				msg: 'success',
				data: results
			});
		}
	});

});

router.post('/pictures', function(req, res, next) {
	var target = JSON.parse(req.body.target);

	for(let i = 0; i < target.length; i++) {
		let url = target[i];
		getImg(url);
	}

	res.json({
		code: 500,
		msg: err
	});

});

function getImg(url) {
	child_process.exec(`casperjs crawler.js ${url}`, function(err, stdout, stderr) {
		if(err) {
			logger.error(stderr);
		}
		if(stdout) {
			var imgUrl = stdout.match(/=====(.*)=====/);
			imgUrl = imgUrl[1];
			var ext = imgUrl.slice(imgUrl.lastIndexOf('.'));
			var imgName = md5(url) + ext;
			var imgNewName = createDateDir() + imgName;
			// 下载图片
			request(imgUrl).pipe(fs.createWriteStream(imgNewName));
			logger.info(`抓取图片成功，图片保存路径：${imgNewName}`);
		}
		if(stderr) {
			logger.error(stderr);
		}
	});
}

function md5(text) {
	return crypto.createHash('md5').update(text).digest('hex');
};

function createDateDir() {
	var logDirectory = imgDir + '/' + createDate();
	if(!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory)
	}
	return logDirectory + '\\';
}

function createDate() {
	var d = new Date();
	var yyyy = d.getFullYear();
	var MM = d.getMonth() + 1;
	var dd = d.getDate();
	MM = MM.toString().length == 1 ? '0' + MM : MM;
	dd = dd.toString().length == 1 ? '0' + dd : dd;
	return yyyy + MM + dd;
}

module.exports = router;
