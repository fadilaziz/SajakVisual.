import express from 'express';
import routes from '../src/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const port = 3000;

// Konfigurasi CORS
const corsOptions = {
  origin: ['*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};

//Setup midleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../src/public')));

//EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/modules'));

//Routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
