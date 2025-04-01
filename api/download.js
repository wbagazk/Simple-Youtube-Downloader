const express = require('express');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

const download = async (url, format) => {
  try {
    const formDataInfo = new FormData();
    formDataInfo.append('url', url);

    const { data: info } = await axios.post('https://ytdown.siputzx.my.id/api/get-info', formDataInfo, {
      headers: { ...formDataInfo.getHeaders() }
    });

    const dl = new FormData();
    dl.append('id', info.id);
    dl.append('format', format);
    dl.append('info', JSON.stringify(info));

    const { data } = await axios.post('https://ytdown.siputzx.my.id/api/download', dl, {
      headers: { ...dl.getHeaders() }
    });

    if (!data.download_url) {
      throw new Error('Gagal mendapatkan link unduhan.');
    }

    return {
      id: info.id,
      title: info.title,
      type: info.type,
      album: info.album,
      artist: info.artist,
      description: info.description,
      duration: info.duration,
      upload_date: info.upload_date,
      like_count: info.like_count,
      view_count: info.view_count,
      tags: info.tags,
      thumbnail: info.thumbnail,
      download_url: info.download_url, 
    };

  } catch (error) {
    throw new Error(`Gagal mengambil data video: ${error.message}`);
  }
};

router.get('/download/:file', async (req, res) => {
    const file = req.params.file;
    const originalUrl = `https://ytdown.siputzx.my.id/download/${file}`;

    res.redirect(originalUrl);
});

router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({
            status: 400,
            creator: 'WBK',
            error: 'Masukkan URL YouTube!. Example: /api/download?url=https://youtu.be/'
        }, null, 2));
    }

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({
            status: 400,
            creator: 'WBK',
            error: 'URL tidak valid. Harus URL YouTube (youtube.com atau youtu.be).'
        }, null, 2));
    }

    try {
        const mp3Result = await download(url, 'mp3');
        const mp4Result = await download(url, 'mp4');

        const baseDownloadUrl = 'https://ytdown.wbagazk.my.id/download/';
        const downloadUrl = mp3Result.download_url.replace('https://ytdown.siputzx.my.id/download/', baseDownloadUrl);
        const downloadUrl = mp4Result.download_url.replace('https://ytdown.siputzx.my.id/download/', baseDownloadUrl);

        const resultYT = {
            title: mp4Result.title,
            album: mp4Result.album,
            artist: mp4Result.artist,
            description: mp4Result.description,
            duration: mp4Result.duration,
            upload_date: mp4Result.upload_date,
            like_count: mp4Result.like_count,
            view_count: mp4Result.view_count,
            tags: mp4Result.tags,
            thumbnail: mp4Result.thumbnail,
            url_youtube: url,
            download: {
                mp3: mp3Result.download_url,
                mp4: mp4Result.download_url
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            status: true,
            code: 200,
            creator: 'WBK',
            result: resultYT
        }, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify({
            status: false,
            code: 500,
            creator: 'WBK',
            message: error.message
        }, null, 2));
    }
});

module.exports = router;