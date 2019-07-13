'use strict';

var _ = require('lodash');
var Image = require('./image.model');
var fs = require('fs');
var uuid = require('uuid'); // https://github.com/defunctzombie/node-uuid
var multiparty = require('multiparty'); // https://github.com/andrewrk/node-multiparty

var gm = require('gm');


// Get list of images
exports.index = function (req, res) {
    return res.send(200);
};

// Get a single image
exports.show = function (req, res) {
    Image.findById(req.params.id, function (err, image) {
        if (err) { return handleError(res, err); }
        if (!image) { return res.send(404); }



        res.writeHead(200, { 'Content-Type': image.type || 'image/jpeg' });// result.type });
        return res.end(image.data, 'binary');

    });
};

// Creates a new image in the DB.
exports.create = function (req, res) {
    Image.create(req.body, function (err, image) {
        if (err) { return handleError(res, err); }
        return res.json(201, image);
    });
};

// Updates an existing image in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    Image.findById(req.params.id, function (err, image) {
        if (err) { return handleError(res, err); }
        if (!image) { return res.send(404); }
        var updated = _.merge(image, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, image);
        });
    });
};

// Deletes a image from the DB.
exports.destroy = function (req, res) {
    Image.findById(req.params.id, function (err, image) {
        if (err) { return handleError(res, err); }
        if (!image) { return res.send(404); }
        image.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};


exports.upload = function (req, res) {

    console.log("uploaded");

    var form = new multiparty.Form();

    //console.log("step 1");

    form.parse(req, function (err, fields, files) {

      //  console.log("step 2");

        //if (!(files && files.length)) handleError(res, {});

        if (files === undefined || files.length === 0)
            return res.json(200, {});

        var file = files.file[0];


        var file = files.file[0];

        var createImage =  function(file){

          var _img = {};
          console.log(file);
          console.log("step 3");

          _img.data = fs.readFileSync(file.path);
          _img.name = uuid.v1();
          _img.type = file.headers['content-type'];

          Image.create(_img, function (err, resp) {
              if (err) { return handleError(res, err); }
              console.log(resp._id);
              return res.json(200, resp._id);
          });
        };

        var resize = function(file, w, h, x, y, size) {

          if( file.headers['content-type'] == "image/png" ) {
            gm(file.path)
              .autoOrient()
              .gravity('Center')
              .resize(w, h, '^')
              .crop(w, h, x, y)
              .quality(80)
              .compress('Lossless')
              .write(file.path + "_" + size + '.png', function (err) {
                if (err) console.log(err);
                file.headers['content-type'] = "image/png";
                file.path = file.path + "_" + size + '.png';
                createImage(file);
              });
          } else {
            gm(file.path)
              .autoOrient()
              .gravity('Center')
              .resize(w, h, '^')
              .crop(w, h, x, y)
              .quality(80)
              .compress('JPEG')
              .write(file.path + "_" + size + '.jpg', function (err) {
                if (err) console.log(err);
                file.headers['content-type'] = "image/jpg";
                file.path = file.path + "_" + size + '.jpg';
                createImage(file);
              });
          }
        };

        if(fields.width){
          resize(file, fields.width, fields.heigth, 0, 0, 'Large');
        }else{
          createImage(file);
        }

    });

};

function handleError(res, err) {
    return res.send(500, err);
}
