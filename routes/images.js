
/*
 * GET home page.
 */

exports.index = function(request, response){
	response.render('index', { title: 'What would you like to do with images?:' });
};

exports.upload = function(request, response){
	response.render('upload', { title: 'Upload Here'});
};