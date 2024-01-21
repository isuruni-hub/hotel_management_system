const {logEvents} = require('./logger');

// overwrite default express error handling middleware
const error = (err, req, res, next) => {
    logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorLog.log');

    const status = res.statusCode ? res.statusCode : 500;

    res.status(status).json({message: err.message});
}

module.exports = error;

