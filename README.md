ImageSmith
==========

Node Image Engine

##Pre-Reqs:
1. node
1. npm
1. imageMagick
1. https://toolbelt.heroku.com/ _(optional)_

##Setup:

`npm install`

##To run:
`foreman start`
-or-
`node app.js`

##Usage

### Get image
* http://host/images/bucket/id/img1.jpg _(flat)_
* http://host/images/bucket/id/img1.jpg?rw=300&rh=200 _(resized)_

##Media Storage
* {media}/{bucket}/{id}/orig/img1.jpg
* {media}/{bucket}/{id}/flat/img1.jpg
* {media}/{bucket}/{id}/img1_w300_h200.jpg
