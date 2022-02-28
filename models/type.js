const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
    name: { type: String, maxlength: 40, minlength: 3 },
});

TypeSchema.virtual('url').get(function () {
    return '/catalog/type/' + this._id;
});

module.exports = mongoose.model('Type', TypeSchema);
