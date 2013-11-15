var bucket = window.dataLayer.bucket,
	id = window.dataLayer.id;

function displayImages()
{
	var basePath = '/images/'+bucket+'/'+id;
	/* empty the div */
	$("#existing-files").empty();

	/* get the image data */
	$.getJSON(basePath+'.json', function(data){
		/* add thumbnail of each file */
		$.each(data.files, function(index, item){
			var thumbnail = $('<div />', {
				class: "thumbnail"
			}),
				fileName = basePath+'/'+item.filename,
				baseUrl = window.location.protocol + "://" + window.location.host;

			thumbnail.append($('<img width="75" height="75"/>', {
				src: fileName+'?w=75&h=75'
			}));

			thumbnail.append($('<input />', {type: "text", size: 30, value: baseUrl+fileName}));

			thumbnail.append($('<span />', {class: "file-size", text:(item.stats.size/1024).toFixed(2) + "KB"}));

			thumbnail.appendTo("#existing-files");
		});
	})
}

displayImages();

/* configure the dropZone */
Dropzone.options.imgDropzone = {
	init: function () {
		this.on('success', function (file) {
			/*if (!(bucket.value && id.value)) {
				this.removeFile(file);
			};*/
			/* refresh */
			displayImages();
		});
		this.on('sending', function (file, xhr, formData) {
			console.log('sending');
		});
	}
};