const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, deleteItem } = require('../controllers/itemController');

router.post('/', createItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.delete('/:id', deleteItem);

module.exports = router;
