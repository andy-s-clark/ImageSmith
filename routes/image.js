
/*
 * GET images listing.
 */
exports.list = function (request, response) {
	var fs = require('fs');
	var mediaDir = request.app.get('media');

	var bucket = request.param('bucket');

	mediaDir = mediaDir + '/' + bucket + '/orig';

	fs.readdir(mediaDir, function (err, list) {
		if (err) {
			response.send(404, err);
		} else {
			var files = {};

			if (list) {
				for(var i = 0; i < list.length; i++) {
					var file = list[i];
					var stat = fs.statSync(mediaDir + '/' + file);

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
		}
	});
};

/**
 * GET image
 */
exports.get = function(request, response) {
	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });
	var fs = require('fs');
	var mime = require('mime');

	var mediaDir = request.app.get('media'),
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
	var flatPath = mediaDir + '/' + bucket + '/flat/' + image;

	fs.readFile(flatPath, function(err, data) {
		if (err) {
			response.send(404, 'The file "'+ flatPath +'" has yet to be created');
		} else {
			var filePath = mediaDir + '/' + bucket + '/' + '/resized/' + ( width ? width : '') + 'x' + ( height ? height : '') + '_' + image;
			if (width || height) {
				// check if we have the requested size...
				fs.readFile(filePath, function(err, data) {
					if (err) {
						// try to create new size
						var path = mediaDir + '/' + bucket;
						var img = im(flatPath).strip();
						if ( width && height ) {
							img = img.resize(width, height, '^')
								.crop(width, height)
								.gravity('Center');
						} else {
							img = img.resize( ( width ? width : '' ) +( height ? 'x'+height : '' ) ) ;
						}
						img.write(filePath, function (err) {
							if (err) {
								console.log('image.get.resizeImage: ' + err);
								response.send(500, 'Could not create resized file');
							} else {
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
					} else {
						response.header('Content-Type', mime.lookup(filePath));
						response.send(data);
					};
				});
			} else {
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

exports.manage = function(request, response) {
	response.render('manage', {
		title: 'Manage ' + request.params.bucket,
		scripts:['dropzone.js', "zepto.min.js", "manage.js"],
		styles: ['upload.css'],
		dataLayer: { bucket: request.params.bucket }
	});
}

exports.upload = function(request, response){
	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });
	var fs = require('fs');
	var bucket = request.params.bucket ? request.params.bucket : request.body.bucket;
response.json(request.files.file.path);
	// fs.readFile(request.files.file.path, function (err, data) {
	// 	if (err) {
	// 		response.send(500, 'Error reading file');
	// 	}
	// 	else {
	// 		var mediaDir = request.app.get('media');

	// 		mkdirp(basePath + '/' + bucket, function(err) {
	// 			if(err) {
	// 				response.send(500, err);
	// 			} else {
	// 				var origFile = mediaDir + '/' + bucket + '/orig/' + request.files.file.name;
	// 				var flatFile = mediaDir + '/' + bucket + '/flat/' + request.files.file.name;

	// 				fs.writeFile(origFile, data, function (err) {
	// 					if (err) {
	// 						response.send(500, 'Error writing file: ' + origFile);
	// 					} else {
	// 						im(origFile)
	// 							.strip()
	// 							.write(flatFile, function (err) {
	// 								if (err) {
	// 									console.log('image.upload: ' + err);
	// 									return false;
	// 								} else {
	// 									console.log('image.upload: success');
	// 									response.json({ file: flatFile });
	// 								};
	// 							});
	// 					};
	// 				});
	// 			}
	// 		});
	// 	};
	// });
};
