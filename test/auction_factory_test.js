const AuctionFactory = artifacts.require("AuctionFactory");

contract("AuctionFactory", (accounts) => {
    const name = "Ceylon Tea";
    const description = "A good black tea";
    const imageUrl = "https://www.google.com/ceylon-tea.jpg";
    const endDate = Math.floor(Date.now() / 1000) + 6000;
    const owner = accounts[0];

    it("has been deployed", async () => {
        auctionFactory = await AuctionFactory.deployed();
        assert(auctionFactory, "auction factory was not deployed");
    });

    beforeEach(async () => {
        auctionFactory = await AuctionFactory.deployed();
    });

    describe("creating auction", () => {
        it("increases number of auctions", async () => {
            await auctionFactory.createAuction(
                name,
                description,
                imageUrl,
                endDate,
                {
                    from: owner,
                }
            );

            const numberOfAuctions = await auctionFactory.getAuctionsLength();
            assert.equal(numberOfAuctions, 1, "number of auctions is not 1");
        });

        it("emits AuctionCreated event", async () => {
            const { logs } = await auctionFactory.createAuction(
                name,
                description,
                imageUrl,
                endDate,
                {
                    from: owner,
                }
            );

            assert.equal(
                logs[0].event,
                "AuctionCreated",
                "event name is not AuctionCreated"
            );
        });
    });

    describe("getting auctions", () => {
        const createAuctions = async (count) => {
            for (let i = 0; i < count; i++) {
                await auctionFactory.createAuction(
                    name,
                    description,
                    imageUrl,
                    endDate,
                    {
                        from: owner,
                    }
                );
            }
        };

        beforeEach(async () => {
            auctionFactory = await AuctionFactory.new();
        });

        it("returns empty list if there are no auctions", async () => {
            const auctions = await auctionFactory.getAuctions(0, 25);
            assert.equal(auctions.length, 0, "auctions list is not empty");
        });

        it("returns auctions list", async () => {
            await createAuctions(3);

            const auctions = await auctionFactory.getAuctions(0, 25);
            assert.equal(
                auctions.length,
                3,
                "auctions list is not 3 items long"
            );
        });

        it("paginates auctions list", async () => {
            await createAuctions(3);

            const firstPage = await auctionFactory.getAuctions(0, 2);
            assert.equal(firstPage.length, 2, "firstPage is not 2 items long");

            const secondPage = await auctionFactory.getAuctions(1, 2);
            assert.equal(secondPage.length, 1, "secondPage is not 1 item long");
        });

        it("returns auctions list with correct data", async () => {
            await createAuctions(2);

            const auctions = await auctionFactory.getAuctions(0, 25);
            const auction = auctions[0];
            assert.equal(auction.name, name, "auction name is not correct");
            assert.equal(
                auction.description,
                description,
                "auction description is not correct"
            );
            assert.equal(
                auction.imageUrl,
                imageUrl,
                "auction imageUrl is not correct"
            );
            assert.equal(
                auction.endDate,
                endDate,
                "auction endDate is not correct"
            );
            assert.equal(auction.lastBid, 0, "auction lastBid is not correct");
        });
    });
});
