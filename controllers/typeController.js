const Instrument = require('../models/instrument')
const Brand = require('../models/brand')
const Type = require('../models/type')
const async = require('async');
const brand = require('../models/brand');
const { body, validationResult } = require('express-validator');
const req = require('express/lib/request');

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
        res.render('type_details', {title: 'Similar Types', list:result, url: req.params.id})
    })
}
exports.create_type_get = function(req,res,nex) {
    res.render('type_create', {title: 'Create Type'})
}
exports.create_type_post=[
    body('name','Empty Name').trim().isLength({ min: 1 }).escape(),
    body('description', 'Empty Description').trim().isLength({ min: 1 }).escape(),
    (req,res,next)=>{
        const errors = validationResult(req);
        const type = new Type ({
            name: req.body.name,
            description: req.body.description
        })
        if(errors.isEmpty()){
            type.save(function(err){
                if(err){return next(err)}
                res.redirect(type.url)
            }) 
        } else {console.log('errors', errors)}
    }
    
]

exports.delete_type_get = function(req,res,next){
    res.send('!!! DELETE TYPE FUNCTIONALITY NOT YET IMPLEMENTED !!!')
}