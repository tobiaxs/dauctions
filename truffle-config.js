const path = require("path");

module.exports = {
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        develop: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
        },
    },

    mocha: {},

    compilers: {
        solc: {
            version: "0.8.13",
        },
    },
};
