const serverless = require('serverless-http');
const app = require('../server/src/index');
const mongoose = require('mongoose');

// Helper to ensure DB connection is reused
let conn = null;

const handler = async (event, context) => {
    // Make sure to add context to the request for possible usage
    context.callbackWaitsForEmptyEventLoop = false;

    if (app.connectDB) {
        if (conn == null) {
            await app.connectDB();
            conn = mongoose.connection;
        }
    }

    const serverlessHandler = serverless(app);
    return serverlessHandler(event, context);
};

exports.handler = handler;
