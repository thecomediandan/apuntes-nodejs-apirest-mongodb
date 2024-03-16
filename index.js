/**
 * Primero preparamos el package.json:
 * consideramos los comandos en el objeto script con las siguientes linea
 *  "start": "node index.js",
 *  "dev": "node index.js"
 * Se activan con 'npm run dev' o start, para ejecutarlos dependiendo del entorno.
 * Con dev utilizaremos las dependencias de desarrollo con start no pero es el oficial
 * 
 * Con 'type': 'modules', en el objeto principal habilitamos las importaciones/exportaciones con ECS6
 * 
 * Podremos instalar dependencias de desarrollo de esta manera 'npm i nodemon --save-dev'
 * dependencias globales 'npm i dotenv', 'npm i env-var'
 */

//Importacion antigua
// const {name, lastname, contact} = require('./example-exports.js')
// const {email, tel} = contact
// console.log(name('Daniel'))
// console.log(lastname('Danish'))
// console.log(email)
// console.log(name(tel))

//Importacion actual
import {name, lastname, contact} from './example-exports.js'
const {email, tel} = contact

console.log(name('Daniel'))
console.log(lastname('Danish'))
console.log(email)
console.log(name(tel))

// File System
import fs from 'node:fs'
let date = new Date()
const fileRead = fs.readFileSync('./file-read.txt', 'utf-8')
fs.writeFileSync('./file-write.txt', fileRead + `\n[Modificado: ${date}]`)
console.log(fileRead)

// Variables de entorno
/**
 * Para crear variables de entorno locales crear un archivo .env
 * npm i dotenv
 * npm i env-var
 * 
 * En Windows:
 * $env:MIVARIABLE = "mi_valor"
 * se ve con: Get-ChildItem Env: o Get-ChildItem Env: | Format-Table.
 * 
 * En Linux:
 * export MIVARIABLE="mi_valor"
 * se ve con: echo $MIVARIABLE.
 */
import config1 from 'dotenv' // Hace que el archivo .env se introduzca al process, solamente para desarrollo
import config2 from 'env-var' // Puede interactuar con el process, uso para produccion para acceder a las variables de entorno
config1.config()
console.log(process.env.PORT) // Si estuvieras en un servidor tomaria las variables de entorno del sistema
console.log(config2.get('USER').required().asString())
console.log(config2.get('PSW').required().asString())
console.log(config2.get('PORT').required().asInt())

// Servidorcito con json-server
// npm i json-server
// Para esto se uso el archivo db.json
// Se configuro el Script a "start": "json-server --watch db.json"
// Se inicia con npm start
/**
 * Podemos probar las distintas metodos HTTP con Postman
 * GET: Obtiene los datos del end-point
 * POST: Prepara nuevos recursos para ser enviados (body-raw-json)
 * PUT: Reemplaza un recurso en su totalidad ([url]/:id, params-path params-id=la_id, body-raw-json)
 * PATCH: Reemplaza un recurso parcialmente ([url]/:id, params-path params-id=la_id, body-raw-json)
 * DELETE: Elimina un recurso en su totalidad ([url]/:id, params-path params-id=la_id)
 */

// Web server
import express from 'express'
import path from 'node:path'
const funcionMain = () => {
    let port = config2.get('PORT').default(3000).asInt();

    const app = express()

    app.use(express.static('public'))

    app.get('*', (req, res) => {
        res.send(path.join(__dirname + '/public/index.html'))
    })

    app.listen(port, () => {
        console.log(`Escuchando en el puerto ${port}`)
    })
}

//funcion anónima autoconvocada
(async () => {
    funcionMain()
})()

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// API REST con MongoDB
/**
 * Herramientas necesarias:
 * Librerias:
 * mongoose
 * express
 * dotenv
 * env-var
 * body-parser
 * Software:
 * Docker
 */

// MODEL
import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
    {
        title: String,
        rate: Number
    }
)

// ROUTES
import expressRoute from 'express'
const router = expressRoute.Router()
const Movie = mongoose.model('Movie', movieSchema)

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
// APP MONGODB
// despues de configurar el docker-compose.yml levantamos la imagen y las variables de entorno en
// el archivo .env, usando las librerias dotenv y env-var para usarlas en local
//la inforamcion de configuracion de la imagen la cuenta la pagina de docker hub
// docker compose up -d // -d para pasar el proceso al servicio y no a la terminal

import expressMongo from 'express'
import bodyParser from 'body-parser'

const portMongo = config2.get('MONGO_PORT').default(3001).asInt()

const appMongo = expressMongo()
appMongo.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME })
const db = mongoose.connection

appMongo.use('/movies', router)

appMongo.listen(portMongo, () => console.log(`Se esta escuchando el puerto de MongoDB ${portMongo}`))

// * Para el despliegue en Railway es necesario crear variables de entorno para el repositorio de MONGO_URL y MONGO_DB_NAME y linkearlas con las de MONGODB del servidor.
