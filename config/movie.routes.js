import expressRoute from 'express'
import { Movie } from '../model/movie.model.js'

export const router = expressRoute.Router()

// Middleware
const getMovie = async (req, res, next) => {
    let movie;
    const {id} = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ message: "ERROR 404: Not Found, ID no valid" })
    }

    try {
        movie = await Movie.findById(id)
    } catch (error) {
        return res.status(404).json({ message: "ERROR 404: Not Found" })
    }
    res.movie = movie
    next()
}

// GET ALL
router.get('/', async (req, res) => {
    try {
        const movie = await Movie.find()
        if (movie.length == 0) {
            return res.status(204).json({ message: "ERROR 204: No Content" })
        }
        res.json(movie)
    } catch (error) {
        res.status(500).json({ message: "ERROR 500: Internal Server Error" })
    }
})

// POST
router.post('/', async (req, res) => {
    const {title, rate} = req?.body
    if (!title || !rate) {
        return res.status(400).json({ message: "ERROR 400: Bad Request" })
    }

    const modelMovie = new Movie(
        {
            title,
            rate
        }
    )

    try {
        const newMovie = await modelMovie.save()
        res.status(201).json(newMovie)
    } catch (error) {
        res.status(400).json({ message: "ERROR 400: Bad Request" })
    }
})

// GET FOR ID
router.get('/:id', getMovie, async (req, res) => {
    res.json(res.movie)
})

// PUT FOR ID
router.put('/:id', getMovie, async(req, res) => {
    try {
        let movie = res.movie
        movie.title = req.body.title || movie.title
        movie.rate = req.body.rate || movie.rate

        const updateMovie = await movie.save()
        res.json(updateMovie)
    } catch (error) {
        res.status(400).json({ message: "ERROR 400: Bad Request" })
    }
})

// PATCH FOR ID
router.patch('/:id', getMovie, async(req, res) => {
    if (!req.body.title && !req.body.rate) {
        return res.status(400).json({ message: "ERROR 400: Bad Request" })
    }

    try {
        let movie = res.movie
        movie.title = req.body.title || movie.title
        movie.rate = req.body.rate || movie.rate

        const updateMovie = await movie.save()
        res.json(updateMovie)
    } catch (error) {
        res.status(400).json({ message: "ERROR 400: Bad Request" })
    }
})

// DELETE FOR ID
router.delete('/:id', getMovie, async (req, res) => {
    try {
        const movie = res.movie
        await movie.deleteOne({
            _id: movie._id
        })
        res.json(movie)
    } catch (error) {
        res.status(500).json({ message: "ERROR 500: Internal Server Error" })
    }
})