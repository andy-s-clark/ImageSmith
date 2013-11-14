
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

	var gm = require('gm');
	var im = gm.subClass({ imageMagick: true });

	im('/Users/g_lawson/Pictures/bender.jpg')
	.resize(100, 100)
	.autoOrient()
	.write(mediaDir + '/test.jpg', function (err) {
		if (!err) console.log(' hooray! ');
	});


};

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.upload = function(request, response){
	response.render('upload', { title: 'Upload Image(s)', scripts:['dropzone.js']});
};