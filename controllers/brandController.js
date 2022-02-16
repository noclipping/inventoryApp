const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const brand = require('../models/brand');

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