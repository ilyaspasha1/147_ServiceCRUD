import express from 'express';
import pg from 'pg';

const app = express();
const port = 3000;
const { Pool } = pg;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// PostgreSQL Pool Connection
// PostgreSQL Pool Config
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'student',
    password: '12345',
    port: 5432,
});

// GET ALL
app.get('/biodata', (req, res) => {
    pool.query('SELECT * FROM biodata ORDER BY id ASC')
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// POST (Tambah Data)
app.post('/biodata', (req, res) => {
    const { class: studentClass, name } = req.body;
    pool.query(
        'INSERT INTO biodata (class, name) VALUES ($1, $2) RETURNING *',
        [studentClass, name]
    )
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// PUT (Update Data)
app.put('/biodata/:id', (req, res) => {
    const { id } = req.params;
    const { class: studentClass, name } = req.body;
    pool.query(
        'UPDATE biodata SET class = $1, name = $2 WHERE id = $3 RETURNING *',
        [studentClass, name, id]
    )
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Data tidak ditemukan" });
            }
            res.json({
                message: "Data berhasil diupdate",
                data: result.rows[0]
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// DELETE (Hapus Data)
app.delete('/biodata/:id', (req, res) => {
    const { id } = req.params;
    pool.query(
        'DELETE FROM biodata WHERE id = $1 RETURNING *',
        [id]
    )
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Data tidak ditemukan" });
            }
            res.json({
                message: "Data berhasil dihapus",
                data: result.rows[0]
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});