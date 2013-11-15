
/*
 * GET images listing.
 */
exports.list = function (request, response) {
	var fs = require('fs');
	var mediaDir = request.app.get('media');

	var bucket = request.param('bucket');
	var id = request.param('id');

	mediaDir = mediaDir + '/' + bucket + '/' + id + '/orig';

	fs.readdir(mediaDir, function (err, list) {
		if (err) {
			response.send(404, err);
		} else {
			var files = {};

			if (list) {
				for(var i = 0; i < list.length; i++) {
					var file = list[i];
					var stat = fs.statSync(mediaDir + '/' + file);
					var path = '/media/' + bucket + '/' + id + '/' + file;

					if (stat.isFile() ) {

						files[file] = {
							filename: file,
							stats: {
								size: stat.size,
								atime: stat.atime,
								mtime: stat.mtime,
								ctime: stat.ctime
							}
						};
					}
				};
			};

			response.json({ bucket: bucket, id: id, files: files });
		}
	});
};

/**
 * GET image
 * TODO sanitize inputs! (ex. rw)
 */
exports.get = function(request, response) {
	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });
	var fs = require('fs');
	var mime = require('mime');

	var mediaDir = request.app.get('media'),
		bucket = request.param('bucket'),
		id = request.param('id'),
		image = request.param('image'),
		width = request.param('width'),
		height = request.param('height');

	if (!(width && height)) {
		width = request.query.w;
		height = request.query.h;
	};

	var flatPath = mediaDir + '/' + bucket + '/' + id + '/flat/' + image;

	fs.readFile(flatPath, function(err, data) {
		if (err) {
			response.send(404, 'The file "'+ flatPath +'" has yet to be created');
		}
		else {
			if (width && height) {
				// check if we have the requested size...
				var filePath = mediaDir + '/' + bucket + '/' + id + '/resized/' + width + 'x' + height + '_' + image;

				fs.readFile(filePath, function(err, data) {
					if (err) {
						// try to create new size
						var path = mediaDir + '/' + bucket + '/' + id;

						im(flatPath)
							.strip()
							.resize(width, height, '^')
							.gravity('Center')
							.crop(width, height)
							.write(filePath, function (err) {
								if (err) {
									console.log('image.get.resizeImage: ' + err);
									response.send(500, 'Could not create resized file');
								}
								else {
									try {
										data = fs.readFileSync(filePath);
										response.header('Content-Type', mime.lookup(filePath));
										response.send(data);
									}
									catch (e) {
										response.send(500, 'Could not read resized file');
									};
								};
							});
					}
					else {
						response.header('Content-Type', mime.lookup(filePath));
						response.send(data);
					};
				});
			}
			else {
				// we have what we need -
				response.header('Content-Type', mime.lookup(flatPath));
				response.send(data);
			};
		};
	});
};

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.drop = function(request, response){
	response.render('drop', { title: 'Upload Image(s)', scripts:['zepto.min.js', 'dropzone.js', 'upload.js'], styles: ['upload.css']});
};

exports.manage = function(request, response){
	var dataLayer = { bucket: request.params.bucket, id: request.params.id };

	response.render('manage', {
		title: 'Manage ' + request.params.bucket + "/" + request.params.id,
		scripts:['dropzone.js', "zepto.min.js", "manage.js"],
		styles: ['upload.css'],
		dataLayer: dataLayer
	});
}

exports.upload = function(request, response){
	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });
	var fs = require('fs');
	var bucket = request.params.bucket ? request.params.bucket : request.body.bucket;
	var id = request.params.id ? request.params.id : request.body.id;

	fs.readFile(request.files.file.path, function (err, data) {
		if (err) {
			response.send(500, 'Error reading file');
		}
		else {
			var mediaDir = request.app.get('media');

			if (checkPath(mediaDir, bucket, id)) {
				var origFile = mediaDir + '/' + bucket + '/' + id + '/orig/' + request.files.file.name;
				var flatFile = mediaDir + '/' + bucket + '/' + id + '/flat/' + request.files.file.name;

				fs.writeFile(origFile, data, function (err) {
					if (err) {
						response.send(500, 'Error writing file: ' + origFile);
					}
					else {
						im(origFile)
							.strip()
							.write(flatFile, function (err) {
								if (err) {
									console.log('image.upload: ' + err);
									return false;
								}
								else {
									console.log('image.upload: success');
									response.json({ file: flatFile });
								};
							});
					};
				});
			}
			else {
				response.send(500, 'Error with file path');
			};
		};
	});
};

var checkPath = function (mediaDir, bucket, id) {
	var fs = require('fs');

	return (
		createDir(mediaDir) &&
		createDir(mediaDir + '/' + bucket) &&
		createDir(mediaDir + '/' + bucket + '/' + id) &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/orig') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/flat') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/resized'));
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



