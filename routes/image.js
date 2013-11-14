
/*
 * GET images listing.
 */

exports.list = function (req, res) {
	var fs = require('fs');
	var mediaDir = req.app.get('media');

	var bucket = req.param('bucket');
	var id = req.param('id');

	mediaDir = mediaDir + '/' + bucket + '/' + id;

	fs.readdir(mediaDir, function (err, list) {
		var files = [];
		var rx = new RegExp(/\.(gif|jpg|jpeg|tiff|png)$/);

		if (list) {
			for(var i = 0; i < list.length; i++) {
				var file = list[i];
				var stat = fs.statSync(mediaDir + '/' + file);
				var path = '/media/' + bucket + '/' + id + '/' + file;

				if (stat.isFile() && rx.test(file)) files.push(path);
			};
		};

		res.render('image_list', { title: 'Media List:', bucket: bucket, id: id, files: files, error: err });
	});
};

/*
 * POST new image
 */

exports.post = function(req, res) {
	var fs = require('fs');
	var mediaDir = req.app.get('media');

	var bucket = req.param('bucket');
	var id = req.param('id');

	mediaDir = mediaDir + '/' + bucket + '/' + id;

	resizeImage('/Users/g_lawson/Pictures/bender.jpg', 100, 100, mediaDir + '/test.jpg');

	res.send(mediaDir + '/test.jpg');
};

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.upload = function(request, response){
	response.render('upload', { title: 'Upload Here'});
};

var checkPath = function (bucket, id) {



};

var resizeImage = function (imagePath, width, height, resultPath) {
	// base resizing command: -strip -resize [w]x[h]^ -gravity center -crop [w]x[h]+0+0

	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });

	im(imagePath)
		.strip()
		.resize(width, height, '^')
		.gravity('Center')
		.crop(width, height)
		.write(resultPath, function (err) {
			if (err) {
				console.log('image.resizeImage: ' + err);
				return false;
			};
		});
};


