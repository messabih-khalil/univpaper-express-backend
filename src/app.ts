// src/app.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';

const app = express();
const port = 3000;

app.set('trust proxy', true);

// Create a rate limiter
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 300, // limit each IP to 300 requests per windowMs
    message: 'Rate limit exceeded , (try after a while)',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(
    cors({
        origin: ['https://www.univpaper.xyz/', 'https://www.univpaper.xyz/'],
    })
);

app.options('*', cors());

app.use(limiter);

// SQLite database setup
const db = new sqlite3.Database('data.db');

// Routes
app.get('/specialities', (req: Request, res: Response) => {
    db.all('SELECT * FROM specialities', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ data: 'Internal Server Error' });
        }
        res.json(rows);
    });
});

// Route to get branches by speciality_id using route parameter
app.get('/branches/:speciality_id', (req: Request, res: Response) => {
    const { speciality_id } = req.params;

    // SQLite query with parameterized speciality_id
    const query = 'SELECT id, title FROM branches WHERE speciality_id = ?';

    db.all(query, [speciality_id], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ data: 'Internal Server Error' });
        }

        if (rows.length === 0) {
            // No record found with the specified ID
            return res.status(404).json({ data: 'Page not found' });
        }

        res.json(rows);
    });
});

app.get('/documents/:branch_id', (req: Request, res: Response) => {
    const { branch_id } = req.params;

    // SQLite query with parameterized branch_id
    const query = 'SELECT title, pdf_url FROM documents WHERE branch_id = ?';

    db.all(query, [branch_id], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ data: 'Internal Server Error' });
        }

        if (rows.length === 0) {
            // No record found with the specified ID
            return res.status(404).json({ data: 'Page not found' });
        }

        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running ${port}`);

    // process.on('unhandledRejection', (reason, p) => {
    //     console.error('Unhandled Rejection at:', p, 'reason:', reason);
    //     // You may want to restart the server here
    //     process.exit(1);
    // });

    // process.on('uncaughtException', (err) => {
    //     console.error('Uncaught Exception:', err);
    //     // You may want to restart the server here
    //     process.exit(1);
    // });
});
