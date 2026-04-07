import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes (контроллер)
export const getAllNotes = async (req, res) => {
  const notes = await Note.find();

  res.status(200).json(notes);
};

// GET /notes/:noteId (контроллер)
export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    /* return res.status(404).json({ message: 'Note not found' }); */
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// POST /notes BODY(контроллер)
export const createNote = async (req, res) => {
  //console.log(req.body);
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

// DELETE /notes/:noteId (контроллер)
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
  });
  //console.log(note);
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// PATCH /notes/:noteId (контроллер)
export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  //console.log(noteId, req.body);

  const note = await Note.findOneAndUpdate(
    /* query, updateBody, options */
    {
      _id: noteId,
    },
    req.body,
    { returnDocument: 'after' },
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
