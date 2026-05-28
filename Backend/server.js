const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ytDlp = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

app.use('/downloads', express.static(downloadsDir));

app.post('/api/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const metadata = await ytDlp(url, { dumpSingleJson: true, noWarnings: true, preferFreeFormats: true });
        const formatDuration = (s) => {
            if (!s) return 'Unknown';
            return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
        };
        res.json({
            title: metadata.title || 'Untitled Video',
            thumbnail: metadata.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500',
            duration: formatDuration(metadata.duration),
            originalUrl: url
        });
    } catch (error) {
        res.status(400).json({ error: 'Could not analyze video. Verify link and try again.' });
    }
});

app.post('/api/download', async (req, res) => {
    const { url, quality } = req.body;
    if (!url || !quality) return res.status(400).json({ error: 'Missing parameters' });

    try {
        const timestamp = Date.now();
        const outputFilename = `video_${timestamp}.%(ext)s`;
        let formatSelection = 'bestvideo[height<=720]+bestaudio/best'; 
        if (quality === '360p') formatSelection = 'worstvideo[height>=360]+bestaudio/best';
        else if (quality === 'audio') formatSelection = 'bestaudio/best';

        await ytDlp(url, { output: path.join(downloadsDir, outputFilename), format: formatSelection, noWarnings: true });
        const files = fs.readdirSync(downloadsDir);
        const actualFile = files.find(f => f.startsWith(`video_${timestamp}`));

        if (!actualFile) throw new Error('File download failed on server.');
        res.json({ success: true, downloadUrl: `${req.protocol}://${req.get('host')}/downloads/${actualFile}` });
    } catch (error) {
        res.status(500).json({ error: 'Server failed to process your media download.' });
    }
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
