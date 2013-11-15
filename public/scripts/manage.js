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
			$('<img width="75" height="75" src="'+basePath+'/'+item+'">').appendTo("#existing-files");
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