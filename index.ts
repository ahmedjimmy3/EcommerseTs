import express from 'express'
import dotenv from 'dotenv'
import initiateApp from './src/initiate-app'

dotenv.config()

const app = express()

initiateApp(app)