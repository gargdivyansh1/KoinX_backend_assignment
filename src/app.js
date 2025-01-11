import express from 'express'

import cron from 'node-cron'

const app = express()

// for accessing the json data 
app.use(express.json({ limit: "16kb" }))
// for accessing the url encoded data
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

import { fetchCryptoData } from './controllers/crypto.controllers.js'
// make background function 
function startBackgroundJob() {

    // Immediately fetch data when the program starts
    (async () => {
        console.log(`Fetching cryptocurrency data immediately at ${new Date().toISOString()}`);
        await fetchCryptoData();
    })();

    // then scheduling it for 2 hours 
    cron.schedule('0 */2 * * *', async () => {
        console.log(`Fetching cryptocurrency data at ${new Date().toISOString()}`);
        fetchCryptoData();
    });
}

import cryptoRoute from './routes/crypto.routes.js'

app.use("/api/v3", cryptoRoute)

// now call the function 
startBackgroundJob()

export { app }