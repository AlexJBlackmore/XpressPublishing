
// Import express and create api router
const express = require('express');
const apiRouter = express.Router();

// Import artists router and mount it
const artistsRouter = require('./artists');
apiRouter.use('/artists', artistsRouter);

// Import series router and mount it
const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);



module.exports = apiRouter;