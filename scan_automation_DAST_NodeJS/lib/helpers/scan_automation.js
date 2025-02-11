const fs = require('fs');
const axios = require('axios');
const yaml = require('js-yaml');
const winston = require('winston');
const readline = require('readline');

// Configure Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => 
            `${timestamp} - ${level.toUpperCase()} - ${message}`
        )
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '../../log/scan_automation.log' })
    ]
});

// Load Configuration
const settings = yaml.load(fs.readFileSync('../../config/settings.yml', 'utf8'));
const apiKey = settings.connection?.api_key || null;
const region = settings.connection?.region || 'us';

async function getApiKey() {
    if (!apiKey) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise(resolve => {
            rl.question('Please enter your InsightAppSec API key: ', (key) => {
                rl.close();
                resolve(key);
            });
        });
    }
    return apiKey;
}

async function createScan() {
    const key = await getApiKey();
    const url = `https://${region}.api.insight.rapid7.com/ias/v1/scans`;

    try {
        const response = await axios.post(url, { /* scan details */ }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': key
            }
        });
        logger.info(`Scan initiated: ${response.data.id}`);
    } catch (error) {
        logger.error(`Error creating scan: ${error.message}`);
    }
}

module.exports = { createScan };