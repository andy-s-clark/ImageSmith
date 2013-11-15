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
### Get list of images
* http://host/images/bucket/id.json

### Get image
* http://host/images/bucket/id/img1.jpg _(flat)_
* http://host/images/bucket/id/img1.jpg?w=300&h=200 _(resized)_
* TODO http://host/images/bucket/id/img1.jpg?w=300 (no height specified)
* TODO http://host/images/bucket/id/img1.jpg?h=300 (no height specified)

##Media Storage
* {media}/{bucket}/{id}/orig/img1.jpg
* {media}/{bucket}/{id}/flat/img1.jpg
* {media}/{bucket}/{id}/300x200_img1.jpg
* {media}/{bucket}/{id}/300x_img1.jpg
* {media}/{bucket}/{id}/x200_img1.jpg
