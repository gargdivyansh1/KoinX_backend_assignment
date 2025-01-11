import mongoose from "mongoose";

const cryptoSchema = new mongoose.Schema(
    {
        coinName: {
            type : String,
            required: true,
        },
        priceUsd: {
            type: Number,
            required: true
        },
        marketCapUsd: {
            type: Number,
        },
        change24h: {
            type: Number,
        },
        fetchedAt: {
            type: Date,
            required: true
        }
    },{collection: 'cryptos'}
)

export const Crypto = mongoose.model("Crypto" , cryptoSchema)