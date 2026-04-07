import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '../controllers/notesController.js';

const router = Router();

/* GET /notes (маршрут) */
router.get('/notes', getAllNotes);

/* GET /notes/:noteId (маршрут)*/
router.get('/notes/:noteId', getNoteById);

/* POST /notes BODY(маршрут)*/
router.post('/notes', createNote);

/* DELETE /notes/:noteId (маршрут)*/
router.delete('/notes/:noteId', deleteNote);

/* PATCH /notes/:noteId (маршрут)*/
router.patch('/notes/:noteId', updateNote);

export default router;
