//проверяем данные для маршрутов заметок
// если данные не проходят валидацию, то запрос не будет обработан и вернется ошибка 400 Bad Request
// (тоесть если параметры заданы больше или меньше чем нужно)

import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

//GET /notes валідація рядка запиту (QUERY)
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
    search: Joi.string().trim().allow(''),
  }),
};

//GET /notes/:noteId И DELETE /notes/:noteId валідація запиту (PARAMS)
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom((value, helpers) => {
      return isValidObjectId(value) ? value : helpers.message('Bad ID format');
    }),
  }),
};

//POST /notes валідація тіло запиту(BODY)
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
  }),
};

//PATCH /notes/:noteId валідація тіло запиту(BODY) та параметрів запиту(PARAMS)
export const updateNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS),
  }).min(1),
  ...noteIdSchema,
  /* или так
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom((value, helpers) => {
      return isValidObjectId(value) ? value : helpers.message('Bad ID format');
    }),
  }), */
};
