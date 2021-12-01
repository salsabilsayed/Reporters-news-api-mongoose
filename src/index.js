const express = require('express');
const app = express();
require('dotenv').config()
const port = process.env.PORT;
const reporterRouter = require('./routers/reporter');
const newsRouter = require('./routers/news');

const cors = require('cors');

require('./db/mongoose');
app.use(cors());
app.use(express.json());

app.use(reporterRouter);
app.use(newsRouter);


app.listen(port,()=>{
    console.log('server is running!');
})