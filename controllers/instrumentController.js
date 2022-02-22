const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const { body, validationResult } = require('express-validator')
const  currency  = require('currency.js');
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
        if (err) { return next(err); }
        res.render('index', {title: 'Instrument Inventory App', results})
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
    (req,res,next)=>{
        console.log(req.body)
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