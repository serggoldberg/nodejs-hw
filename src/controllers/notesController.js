import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes (контроллер)
export const getAllNotes = async (req, res) => {
  const { page, perPage, tag, search } = req.query;
  const skip = (page - 1) * perPage;
  const noteQuery = Note.find({ userId: req.user._id }); //запрос для получения заметок конкретного пользователя

  //фильтрация
  if (tag) {
    noteQuery.where('tag').equals(tag);
  }
  if (search) {
    noteQuery.where({ $text: { $search: search } });
  }

  //получаем заметки с учетом пагинации и общее количество заметок одновременно
  const [totalNotes, notes] = await Promise.all([
    noteQuery.clone().countDocuments(), //3sek
    noteQuery.skip(skip).limit(perPage), //2sek
  ]); //3Sek

  /* // получаем заметки с учетом пагинации
  const notes = await Note.find().skip(skip).limit(perPage);
  // общее количество заметок
  const totalNotes = await Note.find().countDocuments(); */

  // общее количество страниц
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
};

// GET /notes/:noteId (контроллер)
export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOne({ _id: noteId, userId: req.user._id });

  if (!note) {
    /* return res.status(404).json({ message: 'Note not found' }); */
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// POST /notes BODY(контроллер)
export const createNote = async (req, res) => {
  //console.log(req.body);
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(note);
};

// DELETE /notes/:noteId (контроллер)
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
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
      userId: req.user._id,
    },
    req.body,
    { returnDocument: 'after' },
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
