/*
 * GET images listing.
 */
exports.list = function (request, response) {
	var fs = require('fs'),
		mediaPath = request.app.get('media'),
		bucket = request.param('bucket'),
		mediaPath = mediaPath + '/' + bucket;

	fs.readdir(mediaPath, function (err, list) {
		var files = {};
		if (list) {
			for(var i = 0; i < list.length; i++) {
				var file = list[i],
					stat = fs.statSync(mediaPath + '/' + file);

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
		response.json({ bucket: bucket, files: files });
	});
};


/**
 * GET image
 */
exports.get = function(request, response) {
	var gm = require('gm'),
		im = gm.subClass({ imageMagick: true }),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		mime = require('mime');

	var mediaPath = request.app.get('media'),
		cachePath = request.app.get('cache'),
		bucket = request.param('bucket'),
		image = request.param('image'),
		width = request.param('width'),
		height = request.param('height');
	if (! width) {
		width = request.query.w;
	};

	if (! height) {
		height = request.query.h;
	};

	// Sanitize inputs
	width = parseInt(width);
	height = parseInt(height);
	var origFile = mediaPath + '/' + bucket + '/' + image,
		resizedPath = cachePath + '/' + bucket;

	readFlat(image, mediaPath + '/' + bucket, cachePath + '/' + bucket, function(err, data) {
		if (err) {
			response.send(404, 'The file "' +  origFile  + '" does not exist');
		} else {
			var resizedFile = resizedPath + '/' + ( width ? width : '') + 'x' + ( height ? height : '') + '_' + image;
			if (width || height) {
				// check if we have the requested size...
				fs.readFile(resizedFile, function(err, data) {
					if (err) {
						mkdirp(resizedPath, function(err) {
							if(err && err.code != 'EEXIST') {
								response.send(500, 'Could not create folder: ' + resizedPath);
							} else {
								// try to create new size
								var img = im(origFile).strip();
								if ( width && height ) {
									img = img.resize(width, height, '^')
										.crop(width, height)
										.gravity('Center');
								} else {
									img = img.resize( ( width ? width : '' )  + ( height ? 'x' + height : '' ) ) ;
								}
								img.write(resizedFile, function (err) {
									if (err) {
										console.log('image.get.resizeImage: ' + err);
										response.send(500, 'Could not create resized file:'+resizedFile);
									} else {
										try {
											data = fs.readFileSync(resizedFile); // LATER async
											response.header('Content-Type', mime.lookup(resizedFile));
											response.send(data);
										}
										catch (e) {
											response.send(500, 'Could not read resized file');
										};
									};
								});
							}
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

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.drop = function(request, response){
	response.render('drop', { title: 'Upload Image(s)', scripts:['zepto.min.js', 'dropzone.js', 'upload.js'], styles: ['upload.css']});
};

exports.manage = function(request, response) {
	response.render('manage', {
		title: 'Manage ' + request.params.bucket,
		scripts:['dropzone.js', "zepto.min.js", "manage.js"],
		styles: ['upload.css'],
		dataLayer: { bucket: request.params.bucket }
	});
}


/**
 * Handle upload
 * @TODO Handle duplicate filenames (either replace and delete resized or increment name)
 */
exports.upload = function(request, response) {
	var gm = require('gm'),
		im = gm.subClass({ imageMagick: true }),
		fs = require('fs'),
		async = require('async'),
		mkdirp = require('mkdirp');

	var bucket = request.params.bucket ? request.params.bucket : request.body.bucket,
		mediaPath = request.app.get('media'),
		cachePath = request.app.get('cache'),
		filename = request.files.file.name,
		origPath = mediaPath + '/' + bucket,
		flatPath = cachePath + '/' + bucket,
		origFile = origPath + '/' + filename;

	mkdirp(origPath, function(err) {
		if (err && err.code != 'EEXIST') {
			console.log(err);
			response.send(500, 'Error creating folder');
		} else {
			// LATER Use async to handle multiple files ( file[] )
			fs.readFile(request.files.file.path, function(err, data) {
				if(err) {
					response.send(500, 'Error reading upload');
				} else {
					fs.writeFile(origFile, data, function(err) {
						if (err) {
							response.send(500, 'Error writing file');
						} else {
							makeFlat(filename, origPath, cachePath+'/'+bucket, function(err) {
								if (err) {
									response.json(500, err);
								} else {
									response.json({ file:  cachePath+ '/' + filename });
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
var readFlat = function(filename, origPath, flatPath, callback) {
	var fs = require('fs');
	fs.readFile(flatPath+'/'+filename, function(err, data) {
		if(err) {
			makeFlat(filename, origPath, flatPath, function(err){
				if(err) {
					callback(err);
				} else {
					fs.readFile(flatPath+'/'+filename, function(err, data) {
						callback(err, data);
					});
				}
			});
		} else {
			callback(err, data);
		}
	});
}


/**
 * Make flattened version of image
 */
var makeFlat = function(filename, sourcePath, destPath, callback) {
	var gm = require('gm'),
		im = gm.subClass({ imageMagick: true }),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		origFile = sourcePath+'/'+filename,
		flatFile = destPath+'/'+filename;

	mkdirp(destPath, function(err) {
		if (err && err.code != 'EEXIST') {
			callback(err);
		} else {
			fs.readFile(origFile, function(err, data) {
				if(err) {
					callback(err);
				} else {
					im(origFile)
					.strip()
					.write(flatFile, function (err) {
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
