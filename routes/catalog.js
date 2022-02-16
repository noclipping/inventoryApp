const express = require('express');
const router = express.Router();

const instrument_controller = require('../controllers/instrumentController')
const brand_controller = require('../controllers/brandController')
const type_controller = require('../controllers/typeController')
// GET for index
router.get('/', instrument_controller.index);
router.get('/instruments', instrument_controller.instrument_list)
router.get('/instrument/create', instrument_controller.instrument_create_get)
router.post('/instrument/create', instrument_controller.instrument_create_post)
router.get('/instrument/:id', instrument_controller.instrument_details)
router.get('/brands', brand_controller.brand_list);
router.get('/brand/:id', brand_controller.brand_details)

router.get('/types', type_controller.type_list)
router.get('/type/:id', type_controller.type_details)
module.exports = router;