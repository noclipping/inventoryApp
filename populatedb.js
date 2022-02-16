#! /usr/bin/env node
console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var sgDesc = "The SG™ Special returns to the classic design that made it relevant, played, and loved -- shaping sound across generations and genres of music. This early 60s style SG Special has the vibe and sound heard on countless classic rock recordings. The comfortable, SlimTaper™ mahogany neck and bound rosewood fingerboard are well known for fast, effortless playing. The two P-90 pickups are noted for their fat snarl when driven and their smooth sweetness when played clean. The SG Special is equipped with the 3-way toggle switch and has hand-wired controls with Orange Drop® capacitors. A hardshell case is included."
var jCustomDesc = "Ibanez j.custom guitars are manufactured by an elite group of highly skilled luthiers trained in producing instruments of uncompromised quality. The j.custom designation represents every advance in design and technology Ibanez has developed over the decades: the best woods, neck, fret treatments, in-demand pickup, and top-quality hardware. Each is masterfully crafted to the highest standards to ensure unparalleled sound, maximum playability and exquisite beauty."
var yamahaCFDesc = "Our Flagship CF Series is the culmination of nearly two decades of research and development to create the world’s finest concert grand piano. The CF is the rare union of clarity of tone and power that pianists crave. Each piano is crafted entirely by hand for a precise response that brings depth, nuance and an endless range of colors to the player’s tonal palette. It is simply a superb instrument."
var async = require('async')

var Brand = require('./models/brand')
var Instrument = require('./models/instrument')
var Type = require('./models/type')


var mongoose = require('mongoose');
const { locals } = require('./app');
var mongoDB = userArgs[0];
var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var types = [];
var brands = [];
var instruments = [];


// instrument

function instrumentCreate(name, description, brand, type, price, cb){
    var instrument = new Instrument({name, description, brand, type, price})
    console.log(instrument.name)
    instrument.save(function (err) {
        console.log('1')
            if(err){
                console.log('2')
                cb(err,null)
                return
            }
            console.log('3')
            instruments.push(instrument)
            console.log('4')
            cb(null, instrument)
            console.log('5')
        }
    )
}

// type 

function typeCreate(name, cb) {
  
    var type = new Type({ name });     
    type.save(function (err) {
                if (err) {
                    cb(err, null);
                    return;
                }
                types.push(type)
                cb(null, type); 
            }  
        );
}

function brandCreate(name, description, cb){
    var brand = new Brand({name, description});
    brand.save(function(err){
            if(err){
                cb(err,null)
                return
            }
            brands.push(brand)
            cb(null, brand)
        }
    )
}



function createTypes(cb) {
    async.series([
            function(callback) {
            typeCreate("Guitar", callback); // types[0]
            },
            function(callback) {
            typeCreate("Piano", callback); // types[1]
            },
            function(callback) {
            typeCreate("Violin", callback); // types[2]
            }
        ],
        cb);
}

var stentorBrandDesc = "Stentor is the leading manufacturer of high quality student violins and orchestral stringed instruments worldwide. Stentor violins, violas, cellos and double basses are recommended by music teachers and music services for their quality."
const gibsonBrandDesc = "Gibson Brands, Inc. is an American manufacturer of guitars, other musical instruments, and professional audio equipment from Kalamazoo, Michigan, and now based in Nashville, Tennessee. The company was formerly known as Gibson Guitar Corporation and renamed Gibson Brands, Inc. on June 11, 2013."
const  yamahaBrandDesc = "Yamaha Corporation is a Japanese multinational corporation and conglomerate with a very wide range of products and services. It is one of the constituents of Nikkei 225 and is the world's largest piano manufacturing company."
const ibanezBrandDesc = "Ibanez (アイバニーズ, Aibanīzu) is a Japanese guitar brand owned by Hoshino Gakki.[1] Based in Nagoya, Aichi, Japan, Hoshino Gakki were one of the first Japanese musical instrument companies to gain a significant foothold in import guitar sales in the United States and Europe, as well as the first brand of guitars to mass-produce the seven-string guitar and eight-string guitar."
function createBrands(cb){
    async.series([
        function(callback){
            brandCreate("Gibson", gibsonBrandDesc, callback) // brands[0]
        },
        
        function(callback){
            brandCreate("Yamaha", yamahaBrandDesc, callback)
        },
        
        function(callback){
            brandCreate("Stentor", stentorBrandDesc, callback)
        },
        function(callback){
            brandCreate("Ibanez", ibanezBrandDesc, callback) // 3
        },
    ], cb)
}
var amatiDesc = "A beautiful violin modelled on an original violin of 1694 by Nicola Amati. It is made fom selected and figured European tonewoods and is finished with a hand applied traditional varnish which brings out the appearance of the wood. This superb handcrafted instrument features the deeper arching of Amati style. It is finished in a warm golden base colour with traditional hand applied shellac varnish. It has Pirastro strings and is individually workshop fitted."

function createInstruments(cb){
    async.series(
        [
            function(callback){
                instrumentCreate('SG Special',sgDesc,brands[0],types[0],1599,callback) // instruments[0]
            },
            function(callback){
                instrumentCreate('RG8570ZL',jCustomDesc,brands[3],types[0],2199, callback)
            },
            function(callback){
                instrumentCreate('CFX', yamahaCFDesc, brands[1], types[1], 14000, callback)
            },
            function(callback){
                instrumentCreate('Amati', amatiDesc, brands[2], types[2], 300, callback) // 3
            }
        ], cb
    )
}




async.series([
    createTypes,
    createBrands,
    createInstruments
],

function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        if(locals.results){ 
           console.log(results)
         }
    }
    // All done, disconnect from database
    mongoose.connection.close();
});

