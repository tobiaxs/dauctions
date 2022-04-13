const AuctionFactoryContract = artifacts.require("AuctionFactory");

module.exports = function (deployer) {
    deployer.deploy(AuctionFactoryContract);
}
