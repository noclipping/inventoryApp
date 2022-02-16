const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const brand = require('../models/brand');

exports.type_list = function(req, res){
    Type.find()
    .sort({name:'ascending'})
    .exec(function(err,results){
        if(err){
            return next(err);
        }
        res.render('type_list', {title:'Types', list:results})
    })
}

exports.type_details = function(req,res,next){
    Instrument.find({type:req.params.id})
    .exec(function(err,result){
        if(err){next(err)}
        res.render('type_details', {title: 'Similar Types', list:result})
    })
}