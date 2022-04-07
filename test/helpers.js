const increaseTimestamp = (time) => {
    const id = new Date().getTime();

    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [time],
                id: id,
            },
            (err, _) => {
                if (err) return reject(err);

                web3.currentProvider.send(
                    {
                        jsonrpc: "2.0",
                        method: "evm_mine",
                        id: id + 1,
                    },
                    (err, res) => {
                        return err ? reject(err) : resolve(res);
                    }
                );
            }
        );
    });
};

const takeSnapshot = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_snapshot",
                id: new Date().getTime(),
            },
            (err, snapshotId) => {
                if (err) {
                    return reject(err);
                }
                return resolve(snapshotId);
            }
        );
    });
};

const revertToSnapshot = (id) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_revert",
                params: [id],
                id: new Date().getTime(),
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

module.exports = { increaseTimestamp, takeSnapshot, revertToSnapshot };
