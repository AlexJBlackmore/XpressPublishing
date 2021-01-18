const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
// Maybe should be inside if clause checking for dev mode?
app.use(errorhandler());
app.use('/api', apiRouter);






app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

module.exports = app;