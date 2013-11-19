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

##Definitions
A _bucket_ is one or more directories deep. ex.
* products/123
* buildcom/email/2013

##Usage

### Get list of images
* http://host/images/bucket/id.json

### Get image
* http://host/images/bucket/img1.jpg _(flat)_
* http://host/images/bucket/img1.jpg?w=300&h=200 _(resized)_
* TODO http://host/images/bucket/img1.jpg?w=300 (no height specified)
* TODO http://host/images/bucket/img1.jpg?h=300 (no height specified)

##Media Storage
Media is stored separately from cached (flattened and resized) images. This allows handling existing files
and files uploaded outside of this system. This also makes it possible to store cached images on a cheaper
medium.

* {media}/{bucket}/img1.jpg
* {cache}/{bucket}/img1.jpg
* {cache}/{bucket}/300x200_img1.jpg
* {cache}/{bucket}/300x_img1.jpg
* {cache}/{bucket}/x200_img1.jpg