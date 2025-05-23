const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const app = express();
const upload = multer();

app.post('/parse', upload.single('pdf'), async (req, res) => {
    try {
        const data = await pdfParse(req.file.buffer);
        const text = data.text;
        const chunkSize = 1000, overlap = 200;
        let start = 0, chunks = [];
        while (start < text.length) {
            let end = Math.min(start + chunkSize, text.length);
            chunks.push({chunk_index: chunks.length, chunk_text: text.slice(start, end)});
            start += (chunkSize - overlap);
        }
        res.json(chunks);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`PDF-Chunker слушает порт ${PORT}`));