const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstrumentSchema = new Schema(
    {
        name: { type: String, required: true},
        description: {type: String, required: true},
        brand: { type: Schema.Types.ObjectId, ref: 'Brand' , required: true},
        type: { type: Schema.Types.ObjectId, ref: 'Type', required: true },
        price: {type: String, required: true},
        imgURL: {type: String, required: false}
    }
)
InstrumentSchema
.virtual('url')
.get(function(){
    return '/catalog/instrument/' + this._id;
});

module.exports = mongoose.model('Instrument', InstrumentSchema);