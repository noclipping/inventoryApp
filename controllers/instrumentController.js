const Instrument = require('../models/instrument');
const Brand = require('../models/brand');
const Type = require('../models/type');
const async = require('async');
const { body, validationResult } = require('express-validator');
const currency = require('currency.js');
const s3Funcs = require('../s3');
const fs = require('fs');
const util = require('util');
const { localsName } = require('ejs');
const unlinkFile = util.promisify(fs.unlink);
const helpers = require('../helperFunctions');
exports.index = function (req, res) {
    async.parallel(
        {
            instrument_count: function (cb) {
                Instrument.countDocuments({}, cb);
            },
            brand_count: function (cb) {
                Brand.countDocuments({}, cb);
            },
            type_count: function (cb) {
                Type.countDocuments({}, cb);
            },
        },

        function (err, results) {
            res.render('index', {
                title: 'Inventory App',
                results,
                image: '',
            });
            if (err) {
                return next(err);
            }
        }
    );
};

exports.instrument_list = function (req, res) {
    Instrument.find({}).exec(function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('instrument_list', { title: 'Instruments', results });
    });
};

exports.instrument_details = function (req, res) {
    Instrument.findById(req.params.id)
        .populate('type')
        .populate('brand')
        .exec(async function (err, results) {
            if (err) {
                return next(err);
            }
            let image = '';
            console.log(results.imgURL);
            if (results.imgURL) {
                await s3Funcs
                    .getImage(results.imgURL)
                    .then((img) => {
                        image =
                            'data:image/jpeg;base64,' +
                            s3Funcs.encode(img.Body);
                    })
                    .catch((err) => {
                        console.log('err');
                        image = '';
                    });
            }
            res.render('instrument_details', {
                title: results.name,
                price: currency(results.price),
                results,
                image,
            });
        });
};
exports.instrument_create_get = function (req, res) {
    async.parallel(
        {
            types: function (cb) {
                Type.find({}, cb);
            },
            brands: function (cb) {
                Brand.find({}, cb);
            },
        },
        function (err, results) {
            res.render('instrument_create', {
                types: results.types,
                brands: results.brands,
                title: 'Create Instrument',
            });
        }
    );
};

exports.instrument_create_post = [
    body('name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Name must be specified.'),
    body('description')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Description must be specified.'),
    body('brand')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Description must be specified.')
        .isAlphanumeric()
        .withMessage('Description has non-alphanumeric characters.'),
    body('price').isFloat({ max: 2000000 }).withMessage('Price is too high.'),
    body('type', 'Empty Type'),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (req.file) {
            helpers.fileValidation(req.file, errors);
        }

        if (errors.isEmpty()) {
            let imgURL = '';
            if (req.file) {
                const uploadResult = await s3Funcs.uploadFile(req.file);
                await unlinkFile(req.file.path);
                imgURL = uploadResult.key;
                console.log('FILE NAME : ', uploadResult.key);
            }
            const instrument = new Instrument({
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brand,
                type: req.body.type,
                price: req.body.price,
                imgURL: imgURL,
            });
            instrument.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(instrument.url);
            });
        } else {
            // this if is required, otherwise file will stay in uploads
            if (req.file) {
                await unlinkFile(req.file.path);
            }
            async.parallel(
                {
                    types: function (cb) {
                        Type.find({}, cb);
                    },
                    brands: function (cb) {
                        Brand.find({}, cb);
                    },
                },
                function (err, results) {
                    const instrument = new Instrument({
                        name: req.body.name,
                        description: req.body.description,
                        brand: req.body.brand,
                        type: req.body.type,
                        price: req.body.price,
                    });
                    res.render('instrument_create', {
                        types: results.types,
                        brands: results.brands,
                        title: 'Create Instrument',
                        error: errors,
                        instrument: instrument,
                    });
                }
            );
        }
    },
];

exports.delete_instrument_get = function (req, res) {
    res.render('instrument_delete', { title: 'Delete Instrument' });
};

exports.delete_instrument_post = [
    async function (req, res, next) {
        Instrument.findById(req.params.id, async function (err, results) {
            if (results.imgURL) {
                const deleteResults = await s3Funcs.deleteImage(results.imgURL);
                console.log(deleteResults);
                next();
            } else {
                next();
            }
        });
    },
    function (req, res) {
        Instrument.deleteOne({ _id: req.params.id }, function (err, results) {
            res.redirect('/catalog/instruments');
        });
    },
];
exports.update_instrument_get = function (req, res) {
    Instrument.findById(req.params.id, function (err, results) {
        async.parallel(
            {
                instrument: function (cb) {
                    Instrument.findById(req.params.id, cb);
                },
                types: function (cb) {
                    Type.find({}, cb);
                },
                brands: function (cb) {
                    Brand.find({}, cb);
                },
            },
            function (errors, results) {
                res.render('instrument_update', {
                    types: results.types,
                    brands: results.brands,
                    title: 'Create Instrument',
                    error: errors,
                    instrument: results.instrument,
                });
            }
        );
    });
};

exports.update_instrument_post = [
    body('name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Name must be specified.'),
    body('description')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Description must be specified.'),
    body('brand')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Description must be specified.')
        .isAlphanumeric()
        .withMessage('Description has non-alphanumeric characters.'),
    body('price').isFloat({ max: 2000000 }).withMessage('Price is too high.'),
    body('type', 'Empty Type'),
    async (req, res, next) => {
        const errors = validationResult(req);
        // if there is a file, validate it
        if (req.file) {
            helpers.fileValidation(req.file, errors);
        }

        const instrument = new Instrument({
            name: req.body.name,
            description: req.body.description,
            brand: req.body.brand,
            type: req.body.type,
            price: req.body.price,
        });

        if (errors.isEmpty()) {
            // if there is an image
            let imageExists = false;
            let imgURL = '';
            if (req.file) {
                try {
                    const uploadResult = await s3Funcs.uploadFile(req.file);
                    imgURL = uploadResult.key;
                } catch (err) {
                    alert(err);
                }
                try {
                    await unlinkFile(req.file.path);
                } catch (err) {
                    alert(err);
                }
                imageExists = true;
            }
            // below is the error occurence, i do believe so at least...
            // the s3func delete image has no URI! I am trying to delete
            // an image that does not exist, because there is no image
            // to begin with!!! ... i.e. create new instrument,
            // try and update instrument by adding a photo with the update btn,
            // for some reason i have image exists = true when there isnt
            // already an image attached. yikes. fix!
            Instrument.findById(req.params.id, function (err, doc) {
                if (doc.imgURL) {
                    s3Funcs.deleteImage(doc.imgURL);
                }
            });
            Instrument.updateOne(
                { _id: req.params.id },
                {
                    name: req.body.name,
                    description: req.body.description,
                    brand: req.body.brand,
                    type: req.body.type,
                    price: req.body.price,
                    ...(imageExists && { imgURL: imgURL }), // if there was an image added to update (exists), then also update the img url
                },
                function (err, docs) {
                    if (err) {
                    } else {
                        console.log('Updated Docs: ', docs);
                        res.redirect(`/catalog/instrument/${req.params.id}`);
                    }
                }
            );
            console.log('success');
        } else {
            if (req.file) {
                await unlinkFile(req.file.path);
            }
            async.parallel(
                {
                    types: function (cb) {
                        Type.find({}, cb);
                    },
                    brands: function (cb) {
                        Brand.find({}, cb);
                    },
                },
                function (err, results) {
                    res.render('instrument_create', {
                        title: 'lol',
                        types: results.types,
                        brands: results.brands,
                        title: 'Create Instrument',
                        error: errors,
                        instrument: instrument,
                    });
                }
            );
        }
    },
];

exports.instrument_delete_image = function (req, res) {
    Instrument.updateOne(
        { _id: req.params.id },
        { imgURL: '' },
        function (err, doc) {
            if (doc.imgURL) {
                s3Funcs.deleteImage(doc.imgURL);
            }
            res.redirect(`/catalog/instrument/${req.params.id}`);
        }
    );
};
