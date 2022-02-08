const Instrument = require('../models/instrument')

exports.index = function(req, res, next){
    res.send('instruments')
}