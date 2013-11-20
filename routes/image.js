/*
 * GET images listing.
 */
exports.list = function(request, response) {
	var fs = require('fs'),
		mediaPath = request.app.get('media'),
		bucket = request.param('bucket'),
		id = request.param('id');

	mediaPath = mediaPath + '/' + bucket + '/' + id + '/orig';

	fs.readdir(mediaPath, function(err, list) {
		if (err) {
			response.send(404, err);
		} else {
			var files = {};

			if (list) {
				for (var i = 0; i < list.length; i++) {
					var file = list[i];
					var stat = fs.statSync(mediaPath + '/' + file);
					var path = '/media/' + bucket + '/' + id + '/' + file;

					if (stat.isFile()) {

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

			response.json({
				bucket: bucket,
				id: id,
				files: files
			});
		}
	});
};


/**
 * GET image
 */
exports.get = function(request, response) {
	var gm = require('gm'),
		im = gm.subClass({
			imageMagick: true
		}),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		mime = require('mime'),
		mediaPath = request.app.get('media'),
		cachePath = request.app.get('cache'),
		bucket = request.param('bucket'),
		id = request.param('id'),
		image = request.param('image'),
		width = request.param('width'),
		height = request.param('height');

	// tries to get dimensions from the query string if they arn't provided in the path
	if (!width) {
		width = request.query.w;
	};

	if (!height) {
		height = request.query.h;
	};

	// Sanitize inputs
	width = parseInt(width);
	height = parseInt(height);
	var flatPath = cachePath + '/' + bucket + '/' + id + '/flat/' + image;

	fs.readFile(flatPath, function(err, data) {
		if (err) {
			response.send(404, 'The file "' + flatPath + '" does not exist');
		} else {
			var resizePath = cachePath + '/' + bucket + '/' + id + '/resized/',
				resizedFile = resizePath + (width ? width : '') + 'x' + (height ? height : '') + '_' + image;
			if (width || height) {
				// check if we have the requested size...
				fs.readFile(resizedFile, function(err, data) {
					if (err) {
						// try to create new size

						// ensure the path exists
						mkdirp(resizePath, function(err) {
							if (err && err.code != 'EEXIST') {
								console.log(err);
								response.send(500, 'Error creating folder');
							}
						});

						var img = im(flatPath).strip();
						if (width && height) {
							img = img.resize(width, height, '^')
								.crop(width, height)
								.gravity('Center');
						} else {
							img = img.resize((width ? width : '') + (height ? 'x' + height : ''));
						}
						img.write(resizedFile, function(err) {
							if (err) {
								console.log('image.get.resizeImage: ' + err);
								response.send(500, 'Could not create resized file');
							} else {
								try {
									data = fs.readFileSync(resizedFile);
									response.header('Content-Type', mime.lookup(resizedFile));
									response.send(data);
								} catch (e) {
									response.send(500, 'Could not read resized file');
								};
							};
						});
					} else {
						response.header('Content-Type', mime.lookup(resizedFile));
						response.send(data);
					};
				});
			} else {
				// we have what we need
				response.header('Content-Type', mime.lookup(origFile));
				response.send(data);
			};
		};
	});
};

exports.index = function(request, response) {
	response.render('index', {
		title: 'What would you like to do with images?:'
	});
};

exports.drop = function(request, response) {
	response.render('drop', {
		title: 'Upload Image(s)',
		scripts: ['zepto.min.js', 'dropzone.js', 'upload.js'],
		styles: ['upload.css']
	});
};

exports.manage = function(request, response) {
	var dataLayer = {
		bucket: request.params.bucket,
		id: request.params.id
	};

	response.render('manage', {
		title: 'Manage ' + request.params.bucket + "/" + request.params.id,
		scripts: ['dropzone.js', "zepto.min.js", "manage.js"],
		styles: ['upload.css'],
		dataLayer: dataLayer
	});
}


/**
 * Handle upload
 */
exports.upload = function(request, response) {
	var gm = require('gm'),
		im = gm.subClass({
			imageMagick: true
		}),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		bucket = request.params.bucket ? request.params.bucket : request.body.bucket,
		id = request.params.id ? request.params.id : request.body.id,
		mediaPath = request.app.get('media'),
		cachePath = request.app.get('cache'),
		filename = request.files.file.name,
		origPath = mediaPath + '/' + bucket + '/' + id + '/orig',
		flatPath = cachePath + '/' + bucket + '/' + id + '/flat',
		origFile;

	// Make sure filename is unique. LATER do this async.
	var tmp = filename,
		i = 0;
	while (fs.existsSync(origPath + '/' + tmp)) {
		i++;
		tmp = i + filename;
		if (i == 1000) break; // Allow a duplicate after too many attempts
	}
	filename = tmp;

	mkdirp(origPath, function(err) {
		if (err && err.code != 'EEXIST') {
			console.log(err);
			response.send(500, 'Error creating folder');
		} else {
			fs.readFile(request.files.file.path, function(err, data) {
				if (err) {
					console.log('Error reading upload');
					response.send(500, 'Error reading upload');
				} else {
					fs.writeFile(origPath + '/' + filename, data, function(err) {
						if (err) {
							response.send(500, 'Error writing file');
							console.log(500, 'Error writing file');
						} else {
							makeFlat(filename, origPath, cachePath + '/' + bucket + '/' + id, function(err) {
								if (err) {
									console.log(err);
									response.json(500, err);
								} else {
									response.json({
										file: cachePath + '/' + filename
									});
								}
							});

						}
					});
				}
			});
		}
	});
}


/**
 * Read flattened version of image
 * Create from original if needed
 */
var checkPath = function(filename, origPath, flatPath, callback) {
	var fs = require('fs');
	return (
		createDir(mediaDir) &&
		createDir(mediaDir + '/' + bucket) &&
		createDir(mediaDir + '/' + bucket + '/' + id) &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/orig') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/flat') &&
		createDir(mediaDir + '/' + bucket + '/' + id + '/resized'));
};

var createDir = function(path) {
	var fs = require('fs');

	try {
		fs.mkdirSync(path);
	} catch (e) {
		if (e.code != 'EEXIST') {
			console.log(e);
			return false;
		};
	};
	return true;
};

var makeFlat = function(filename, sourcePath, destPath, callback) {
	var gm = require('gm'),
		im = gm.subClass({
			imageMagick: true
		}),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		origFile = sourcePath + '/' + filename,
		flatFile = destPath + '/flat/' + filename;

	mkdirp(destPath, function(err) {
		if (err && err.code != 'EEXIST') {
			callback(err);
		} else {
			fs.readFile(origFile, function(err, data) {
				if (err) {
					callback(err);
				} else {
					im(origFile)
						.strip()
						.write(flatFile, function(err) {
							if (err) {
								console.log('image.upload: ' + err);
								callback(err);
							} else {
								callback();
							};
						});
				}
			});
		}
	});
}