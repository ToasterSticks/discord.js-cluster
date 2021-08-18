const { ClusterManager, Logger } = require("../src/index");
const path = require('path');

require('dotenv').config();

let manager = new ClusterManager(path.join(__dirname, 'main.js'), {
    logger: Logger
});

manager.spawn().then(() => {
    // ClusterManager has spawned all clusters
    setTimeout(() => process.exit(), 5 * 60 * 1000)
});