import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import pino from 'pino-http';

const app = express();

//middleware
app.use(express.json());
app.use(cors());
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

/* GET /notes */
app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

/* GET /notes/:noteId */
app.get('/notes/:noteId', (req, res) => {
  res
    .status(200)
    .json({ message: `Retrieved note with ID: ${req.params.noteId}` });
});

//error test
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//error middleware
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(isProd);
  res
    .status(500)
    .json({
      message: isProd
        ? 'Something went wrong. Please try again later.'
        : err.stack,
    });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
