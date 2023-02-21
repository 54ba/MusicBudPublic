"use strict";
require("dotenv").config();

const debug = require("debug");
const DEBUG = debug("dev");

const express = require("express");

const setUpMqtt = require("./mqtt/setUpMqtt");

const logger = require("./logger");

const path = require('path');

const app = express();

app.use(express.json());

const swaggerUi = require("swagger-ui-express"),
    YAML = require('yamljs'),
    swaggerDocument = YAML.load('./docs.yaml');



//setting headers for CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//assigning routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(require("./routes"));

const port = normalizePort(process.env.PORT || "3000");

process.on("uncaughtException", (error) => {
    DEBUG(`uncaught exception: ${error.message}`);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    DEBUG(err);
    DEBUG("Unhandled Rejection:", {
        name: err.name,
        message: err.message || err,
    });
    process.exit(1);
});

const server = app.listen(port, function() {
    let host = server.address().address;
    let port = server.address().port;
    logger.info(`app listening at http://${host}:${port}`);
});

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}



// expermintal -------------------------------

// const neode = require('neode')
//     .fromEnv()
//     .withDirectory(path.join(__dirname, 'models/neode/'));


// console.log('before');

// const cypher = "match (auth_user{ display_name: \"mahmwood\" })-[:LIKES]->(artist:ARTIST) with auth_user, collect(artist) as artists return auth_user,artists;"
// neode.cypher(cypher).then(
//   queryResult => { 

//     let user = neode.hydrateFirst(queryResult,'auth_user');
//     let artists = neode.hydrate(queryResult,'artists');
//     console.log(typeof artists);


//   }).reject(
//     queryResult => {console.log(queryResult)}
//   );

// neode.cypher(cypher).then(res => {
//     console.log(res);
// }).catch(error => {
//     console.log(error);
// });
// let user = neode.hydrateFirst(result, 'auth_user');
// let artists = neode.hydrate(result, 'artists');
// console.log(typeof artists);

// -------------------------------





// setUpMqtt(server);

// let mqtt = require('mqtt');
// let client  = mqtt.connect('mqtt://localhost');
// client.on('connect', function () {
//   console.log('client connected');
//   client.subscribe('channel/presence', function (err) {
//   if (!err) {
//     console.log('client subscribed to chat');

//     client.publish('channel/presence', 'Hello mqtt');
//       console.log('client published to chat');

//         }
//   });
// });

// client.on('message', function (topic, message) {
//    // message is Buffer
//    console.log('client got message',message.toString())
//    //   client.end();
// });