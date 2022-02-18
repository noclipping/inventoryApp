const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const brand = require('../models/brand');
const { body, validationResult } = require('express-validator')

exports.brand_list = function(req, res){
    Brand.find()
    .sort({name:'ascending'})
    .exec(function(err,results){
        if(err){
            return next(err);
        }
        res.render('brand_list', {title:'Brands', list:results})
    })
}
exports.brand_details = function(req,res,next){
    Brand.findById(req.params.id)
    .exec(function(err,result){
        if(err){next(err)}
        res.render('brand_details', {title: result.name, brand:result})
    })
}
exports.create_brand_get = function(req,res,next){
    res.render('brand_create',{title:"Brands"});
}
exports.create_brand_post = [
    body('name','Empty Name').trim().isLength({ min: 1 }).escape(),
    body('description', 'Empty Description').trim().isLength({ min: 1 }).escape(),
    (req,res,next)=>{
        const errors = validationResult(req);
        const brand = new Brand(
            {
                name:req.body.name,
                description: req.body.description
            }
        )
        if(errors.isEmpty()){
            brand.save(function(err){
                if(err){return next(err)}
                res.redirect(brand.url)
            }) 
        } else {console.log('errors', errors)}
    }
]
exports.delete_brand_get = function(req,res){
    res.send('!!! BRAND DELETE NOT IMPLEMENTED !!!')
}