import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import swaggerUi from "swagger-ui-express";
import helmet from 'helmet';
import swaggerSpec from './utils/swagger.js';

import todoRoute from "./routes/todoRoute.js";
import usersRoute from "./routes/usersRoute.js";

import { errorHandler } from './middleware/errorMiddleware.js';
import { sanitizeInput } from './middleware/sanitizeMiddleware.js';

const app = express();
dotenv.config()

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

app.use(express.json()); // Built-in body-parser for parsing JSON
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(cookieParser()); // Enable cookie parsing


const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: false,
};

const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT

app.use(cors(corsOptions))
app.use(cookieParser())

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
                imgSrc: ["'self'", "data:", "cdn.jsdelivr.net"],
                connectSrc: [
                    "'self'",
                    process.env.INTERNET_SERVER,
                ],
            },
        },
    })
);

app.set('trust proxy', true);

app.use(sanitizeInput);

app.use("/service/todo", todoRoute)
app.use("/service/user", usersRoute)

// api documentation endpoint
app.use("/todolist/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Todo List Management API",
}))

// Serve frontend
if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
        res.redirect(process.env.CLIENT_URL);
    });
} else {
    app.get('/', (req, res) => res.send('Backend is running.'));
}

app.use(errorHandler)

mongoose.set("strictQuery", true)

// Start the server
mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));

