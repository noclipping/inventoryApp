const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const { body, validationResult } = require('express-validator')

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
        res.render('instrument_details', {title:results.name, results})
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

    // body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
    // .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    // body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
    // .isAlphanumeric().withMessage('Description has non-alphanumeric characters.'),
    // body('brand').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
    // .isAlphanumeric().withMessage('Description has non-alphanumeric characters.'),
    // body('price').isFloat({max: 2000000}).withMessage('Price is too high.'),
    // this goes in the post request below if i can get it to work

exports.instrument_create_post = [
    (req,res,next)=>{
        console.log(req.body)
        next();
    },

    body('name','Empty Name'),
    body('description','Empty Description'),
    body('brand','Empty Brand'),
    body('type', 'Empty Type'),
    body('price','Empty Price'),
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
            console.log('y1')
            instrument.save(function(err){
                if(err){return next(err)}
                res.redirect(instrument.url)
            })
        } else {console.log(errors+'=======')}
    }
]