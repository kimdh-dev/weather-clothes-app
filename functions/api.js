const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');

const app = express();
const router = express.Router();

const {OWM_API_KEY} = process.env

router.post('/location', async (req, res) => {
    const payload = req.body; // POST 방식
    const { name } = payload;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=1&appid=${OWM_API_KEY}`;

    try {
        const resp = await axios.get(url);
        res.status(200).json(resp.data);
    } catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

router.post('/weather', async (req, res) => {
    const payload = req.body; // POST 방식
    const { lat, lon } = payload;
    const url = `https://api.openweathermap.org/data/3.0/onecall?units=metric&lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;

    try {
        const resp = await axios.get(url);
        res.status(200).json(resp.data);
    } catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', router);

module.exports.handler = serverless(app);