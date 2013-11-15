
/*
 * GET images listing.
 */

exports.list = function (req, res) {
	var fs = require('fs');
	var mediaDir = req.app.get('media');

	var bucket = req.param('bucket');
	var id = req.param('id');

	mediaDir = mediaDir + '/' + bucket + '/' + id + '/orig';

	fs.readdir(mediaDir, function (err, list) {
		if ( err ) {
			res.send(404, err);
		} else {
			var files = [];

			if (list) {
				for(var i = 0; i < list.length; i++) {
					var file = list[i];
					var stat = fs.statSync(mediaDir + '/' + file);
					var path = '/media/' + bucket + '/' + id + '/' + file;

					if (stat.isFile() ) files.push(file);
				};
			};

			res.json( { bucket: bucket, id: id, files: files });
		}
	});
};

/**
 * GET image
 * @TODO sanitize inputs! (ex. rw)
 */
exports.get = function(req, res) {
	var fs = require('fs'),
		mediaDir = req.app.get('media'),
		mime = require('mime');

	var bucket = req.param('bucket'),
		id = req.param('id'),
		image = req.param('image'),
		rw = req.query.rw,
		rh = req.query.rh;

	var i = image.lastIndexOf('.');
	if ( i > 0 ) {
		var fileName = image.substr(0, i);
		var fileExt = image.substr(i + 1);
	} else {
		var fileName = image;
		var fileExt = '';
	}

	var subdir = 'flat';
	if ( rw ) {
		subdir = 'resized';
		fileName += '_w'+parseInt(rw);
	}
	if ( rh ) {
		subdir = 'resized';
		fileName += '_h'+parseInt(rh);
	}
	var path = mediaDir + '/' + bucket + '/' + id + '/' + subdir + '/' + fileName + (fileExt.length>0 ? '.' + fileExt : '');
	if ( fs.readFile(path, function(err, data) {
		if (err) {
			// TODO Create resized image
			res.send(404, 'The file "'+path+'" has yet to be created');
		} else {
			res.header('Content-Type', mime.lookup(path));
			res.send(data);
		}
	}));
}

/*
 * POST new image
 */
exports.post = function(req, res) {
	var fs = require('fs');
	var mediaDir = req.app.get('media');
	var bucket = req.param('bucket');
	var id = req.param('id');

	var check = checkPath(mediaDir, bucket, id);
	console.log('passed checkPath: ' + check);



	res.send('success');
};

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.upload = function(request, response){
	response.render('upload', { title: 'Upload Here'});
};

var checkPath = function (mediaDir, bucket, id) {
	var fs = require('fs');

	return (
		createDir(mediaDir + '/' + bucket) &&
		createDir(mediaDir + '/' + bucket + '/' + id) &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/orig') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/flat') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/resize'));
};

var createDir = function (path) {
	var fs = require('fs');

	try {
		fs.mkdirSync(path);
	}
	catch (e) {
		if (e.code != 'EEXIST') {
			console.log(e);
			return false;
		};
	};
	return true;
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


