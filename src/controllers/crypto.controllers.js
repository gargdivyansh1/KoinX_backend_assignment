import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Crypto } from "../models/crypto.model.js";
import { asynchandler } from '../utils/asynchandler.js'
import axios from 'axios'


const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
//const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&amp;vs_currencies=usd&amp;include_market_cap=true&amp;include_24hr_vol=true&amp;include_24hr_change=true'

const COINS = ['bitcoin','ethereum','matic-network'];
const CURRENCY = 'usd';

const fetchCryptoData = async () => {
    try {
        // here we will fetch the api 
        // using axios for making the connection to third party api
        const response = await axios.get(COINGECKO_API_URL, {
            params: {
                ids: COINS.join(','),
                vs_currencies: CURRENCY,
                include_market_cap: 'true',
                include_24hr_vol: 'true',
                include_24hr_change: 'true',
            }
        })

        //console.log(COINS.join(', '))
        //console.log(response)

        // now checking for the response 
        if (response.status === 200) {

            const data = response.data;
            console.log("Fetched data:" , data)

            for (const [coin, details] of Object.entries(data)) {
                try {
                    await Crypto.create({
                        coinName: coin,
                        priceUsd: details[CURRENCY],
                        marketCapUsd: details[`${CURRENCY}_market_cap`],
                        change24h: details[`${CURRENCY}_24h_change`],
                        fetchedAt: new Date(),
                    });
                    //console.log(`Coin: ${coin}`, details);
                    console.log(`Data for ${coin} added at ${new Date().toISOString()}`);
                } catch (error) {
                    //console.log(`Coin: ${coin}`, details);
                    console.error(`Error adding data for ${coin}:`, error.message);
                }
            }
        } else {
            console.error(`Failed to fetch data. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
    }

}

const getStates = asynchandler( async (req,res) => {
    const coin = req.query.coin

    if (!coin) {
        throw new ApiError(400, "Missing coin query parameter");
    }

   if (!COINS.map(c => c.toLowerCase()).includes(coin.toLowerCase())) {
        throw new ApiError(404, "The coin is different from the data");
    }

    const latestEntry = await Crypto.findOne(
        {
            coinName: coin
        }
    ).sort(
        {
            fetchedAt: -1
        }
    )

    if(latestEntry){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,
                {
                    price: latestEntry.priceUsd,
                    marketCap: latestEntry.marketCapUsd,
                    "24hChange": latestEntry.change24h
                },
                "The data is found !!"
            )
        )
    } else {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "No data found !!"
            )
        )
    }
})

const deviation = asynchandler(async (req,res) => {

    const coin = req.query.coin
    
    if(!COINS.includes(coin)){
        throw new ApiError(
            404 , "The data is not found or Invalid coin name"
        )
    }

    const entries = await Crypto.find({
        coinName: coin
    }).sort(
        {fetchedAt: -1}
    ).limit(10)

    // calculation of the standard deviation
    if (entries.length > 0) {
        const prices = entries.map(entry => entry.priceUsd);
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const standardDeviation = Math.sqrt(variance);
        res.json({ deviation: standardDeviation.toFixed(2) });
      } else {
        res.status(404).json({ error: 'Not enough data available for deviation calculation.' });
      }
})


export {
    fetchCryptoData,
    getStates,
    deviation


}