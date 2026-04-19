import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { errors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

//(базовые/библиотечные) middleware
app.use(express.json());
app.use(cors());
app.use(logger);

//маршруты
app.use(notesRoutes);

// (кастомные) 404 notFoundHandler - middleware
app.use(notFoundHandler);

// (библиотечные celebrate) validation errors - middleware
app.use(errors());

// (кастомные) error errorHandler - middleware
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
