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
router.get('/instrument/:id/delete', instrument_controller.delete_instrument_get);
router.post('/instrument/:id/delete', instrument_controller.delete_instrument_post);
router.get('/instrument/:id/update', instrument_controller.update_instrument_get);
router.post('/instrument/:id/update', instrument_controller.update_instrument_post);
router.get('/instrument/:id', instrument_controller.instrument_details)

router.get('/brands', brand_controller.brand_list);
router.get('/brand/create', brand_controller.create_brand_get);
router.post('/brand/create', brand_controller.create_brand_post);
router.get('/brand/:id/delete', brand_controller.delete_brand_get);
router.post('/brand/:id/delete', brand_controller.delete_brand_post);

router.get('/brand/:id/update', brand_controller.update_brand_get);
router.post('/brand/:id/update', brand_controller.update_brand_post);
router.get('/brand/:id', brand_controller.brand_details);

router.get('/types', type_controller.type_list)
router.get('/type/create', type_controller.create_type_get)
router.post('/type/create', type_controller.create_type_post)
router.get('/type/:id/delete', type_controller.delete_type_get)
router.post('/type/:id/delete', type_controller.delete_type_post)
router.get('/type/:id/update', type_controller.update_type_get)
router.post('/type/:id/update', type_controller.update_type_post)
router.get('/type/:id', type_controller.type_details)

module.exports = router;