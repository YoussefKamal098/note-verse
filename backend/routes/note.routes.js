const express = require('express');
const noteController = require('../controllers/note.controller');

const router = express.Router();

router.post('/', noteController.create.bind(noteController));
router.get('/all', noteController.findByQuery.bind(noteController));
router.get('/textSearch', noteController.findWithSearchText.bind(noteController));
router.get('/:noteId', noteController.findById.bind(noteController));
router.put('/:noteId', noteController.update.bind(noteController));
router.delete('/:noteId', noteController.deleteById.bind(noteController));

module.exports = router;
