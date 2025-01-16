const express = require('express');
const notesController = require('../controllers/note.controller');

const router = express.Router();

router.post('/', notesController.create.bind(notesController));
router.get('/my_notes', notesController.findMyNotes.bind(notesController));
router.get('/me_note/:noteId', notesController.findMyNoteById.bind(notesController));
router.put('/my_note/:noteId', notesController.updateMyNote.bind(notesController));
router.delete('/my_note/:noteId', notesController.deleteMyNoteById.bind(notesController));

module.exports = router;
