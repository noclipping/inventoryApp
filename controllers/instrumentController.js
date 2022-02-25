const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const { body, validationResult } = require('express-validator')
const  currency  = require('currency.js');
const s3Funcs = require('../s3')


exports.index = function(req, res){
    async.parallel({
        instrument_count: function(cb){
            Instrument.countDocuments({}, cb)
        },
        brand_count: function(cb){
            Brand.countDocuments({}, cb)
        },
        type_count: function(cb){
            Type.countDocuments({},cb)
        }
    }, function(err,results){
        s3Funcs.getImage('1d7487784133590e9ac58c2e68e0665f').then(
            (img)=>{
                let image = 'data:image/jpeg;base64,' + s3Funcs.encode(img.Body)
                res.render('index', {title: 'Inventory App', results, image})
            }
        )
        if (err) { return next(err); }
    })
}

exports.instrument_list = function(req,res){
    Instrument.find({})
    .exec(function(err,results){
        if (err) { return next(err); }
        res.render('instrument_list',{title:'Instruments' , results});
    })
    
}



exports.instrument_details = function(req,res){
    Instrument.findById(req.params.id)
    .populate('type')
    .populate('brand')
    .exec(function(err,results){
        if (err) { return next(err); }
        res.render('instrument_details', {title:results.name, price: currency(results.price), results})
    })
}
exports.instrument_create_get = function(req,res){
    async.parallel({
        types: function(cb){
            Type.find({},cb)
        },
        brands: function(cb){
            Brand.find({},cb)
        }
    }, function(err,results){
        res.render('instrument_create', {types:results.types, brands:results.brands, title: 'Create Instrument'})
    })
}


    // this goes in the post request below if i can get it to work

exports.instrument_create_post = [
    async (req,res,next)=>{
        console.log('file',req.file)
        if(req.file.size > 5000000) {
            console.log('file size too large!')
            res.send('file size too large!')
            next();
        } else {
            const uploadResult = await s3Funcs.uploadFile(req.file)
            console.log(uploadResult)
            next();
        }
    },

    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('brand').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
    .isAlphanumeric().withMessage('Description has non-alphanumeric characters.'),
    body('price').isFloat({max: 2000000}).withMessage('Price is too high.'),
    body('type', 'Empty Type'),
    body('image', 'Empty image'),

    (req,res,next)=>{
        const errors = validationResult(req);
        const instrument = new Instrument(
            {
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brand,
                type: req.body.type,
                price: req.body.price
            }
        )
        if(errors.isEmpty()){
            instrument.save(function(err){
                if(err){return next(err)}
                res.redirect(instrument.url)
            })
        } else {
            async.parallel({
                types: function(cb){
                    Type.find({},cb)
                },
                brands: function(cb){
                    Brand.find({},cb)
                }
            }, function(err,results){
                res.render('instrument_create', {types:results.types, brands:results.brands, title: 'Create Instrument', error:errors, instrument:instrument})
            })
        }
    }
]

exports.delete_instrument_get = function(req,res){
    res.render('instrument_delete', {title: 'Delete Instrument'})
}

exports.delete_instrument_post = function(req,res){
    Instrument.deleteOne({_id: req.params.id}, function(err,results){
        res.redirect('/catalog/instruments')
    })
}

exports.update_instrument_get = function(req,res){
    Instrument.findById(req.params.id, function(err, results){
        async.parallel({
            instrument: function(cb){
                Instrument.findById(req.params.id,cb)
            },
            types: function(cb){
                Type.find({},cb)
            },
            brands: function(cb){
                Brand.find({},cb)
            }
        }, function(errors,results){
            res.render('instrument_update', {types:results.types, brands:results.brands, title: 'Create Instrument', error:errors, instrument:results.instrument})
        })
    })
}

exports.update_instrument_post = [
    (req,res,next)=>{
        next();
    },

    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('brand').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
    .isAlphanumeric().withMessage('Description has non-alphanumeric characters.'),
    body('price').isFloat({max: 2000000}).withMessage('Price is too high.'),
    body('type', 'Empty Type'),
    (req,res,next)=>{
        const errors = validationResult(req);
        const instrument = new Instrument(
            {
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brand,
                type: req.body.type,
                price: req.body.price
            }
        )
        if(errors.isEmpty()){
            // instrument.save(function(err){
            //     if(err){return next(err)}
            //     res.redirect(instrument.url)
            // })
            
            Instrument.updateOne(
                {_id: req.params.id},
                {
                    name: req.body.name,
                    description: req.body.description,
                    brand: req.body.brand,
                    type: req.body.type,
                    price: req.body.price
                },
                function(err, docs){
                    if(err){console.log('err', err)}
                    else{
                        console.log("Updated Docs: ", docs)
                        res.redirect('/catalog/instruments')
                    }
                }

            )
            console.log('success' )
        } else {
            async.parallel({
                types: function(cb){
                    Type.find({},cb)
                },
                brands: function(cb){
                    Brand.find({},cb)
                }
            }, function(err,results){
                res.render('instrument_create', {types:results.types, brands:results.brands, title: 'Create Instrument', error:errors, instrument:instrument})
            })
        }
    }
]