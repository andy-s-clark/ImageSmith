
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var image = require('./routes/image');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('media', path.join(__dirname, 'media'));
app.set('cache', path.join(__dirname, 'cache'));

// bodyparser for file upload lots of discussion on weather or not this is safe
app.use(express.bodyParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'media')));
app.use(express.static(path.join(__dirname, 'public')));
/* expose dropzone */
app.use('/dropzone', express.static(__dirname + '/node_modules/dropzone/lib'));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/* routing */
app.get('/', routes.index);
// "\*" in REGEX is a hack for "." being automatically escaped by express
app.get('/images/:bucket([^\*]+)\.json', image.list);
app.get('/images/:bucket([^\*]+)/:image([^\*]+\.[a-zA-Z0-9]+)', image.get);
// LATER app.get('/images/:bucket/:id/:width/:height/:image', image.get);

app.get('/images/:bucket([^\*]+)', image.manage);
app.post('/images/:bucket([^\*]+)', image.upload);

// app.get('/images/upload', image.drop);
// app.post('/images/upload', image.upload);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
