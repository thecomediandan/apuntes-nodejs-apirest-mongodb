// despues de configurar el docker-compose.yml levantamos la imagen y las variables de entorno en
// el archivo .env, usando las librerias dotenv y env-var para usarlas en local
//la inforamcion de configuracion de la imagen la cuenta la pagina de docker hub
// docker compose up -d // -d para pasar el proceso al servicio y no a la terminal
import dotenv from 'dotenv'
import envVar from 'env-var'
import expressMongo from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import { router } from './../config/movie.routes.js'

dotenv.config()

const portMongo = envVar.get('PORT').required().asInt()

const appMongo = expressMongo()
appMongo.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME })
const db = mongoose.connection

appMongo.use('/movies', router)

appMongo.listen(portMongo, () => console.log(`Se esta escuchando el puerto de MongoDB ${portMongo}`))