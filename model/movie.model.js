// MODEL
import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
    {
        title: String,
        rate: Number
    }
);

export const Movie = mongoose.model("Movie", movieSchema);