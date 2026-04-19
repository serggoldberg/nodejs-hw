import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '../controllers/notesController.js';
import {
  createNoteSchema,
  getAllNotesSchema,
  noteIdSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

/* GET /notes (маршрут) */
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

/* GET /notes/:noteId (маршрут)*/
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

/* POST /notes BODY(маршрут)*/
router.post('/notes', celebrate(createNoteSchema), createNote);

/* DELETE /notes/:noteId (маршрут)*/
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

/* PATCH /notes/:noteId (маршрут)*/
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
