

Dropzone.options.imgDropzone = {
	url: 'upload',
	init: function () {
		this.on('addedfile', function (file) {
			var form = $('#imgDropzone');
			var bucket = $('#bucket');

			if (!(bucket.val()) {

			//} else {
				this.removeFile(file);
			};
		});
		this.on('sending', function (file, xhr, formData) {
			var bucket = $('#bucket');
			console.log('foo');
			console.log(bucket);
			console.log(formData);

			formData.append('bucket', bucket.val());
			console.log('sending');
		});
	}
};

$(function() {


	//

/*
	var imgDropzone = new Dropzone('form#imgDropzone');

	imgDropzone.on('addedfile', function(file) {
		if (bucket.val()) {
			//imgDropzone = { url: url() };
			console.log('test');
			imgDropzone.processQueue();
		} else {
			imgDropzone.removeFile(file);
		};
	});
*/

/*
	Dropzone.options.imgDropzone = {
		init: function () {
			console.log('test--');
			this.on('addedfile', function(file) {
				console.log('test');
				if (bucket.val()) {

					var url = '/image/upload/' + bucket.val();
					form.attr('action', url);

					console.log(url);
				} else {
					this.removeFile(file);
				};
			});
		}
	};
*/
});