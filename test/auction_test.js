const AuctionContract = artifacts.require("Auction");

contract("Auction", (accounts) => {
	const name = "Pu Erh Tea";
	const description = "A good red tea";
	const imageUrl = "https://www.google.com/pu-erh-tea.jpg";
	const endDate = Math.floor(Date.now() / 1000) + 6000;
	const owner = accounts[0];

	beforeEach(async () => {
		// Contract has no migration, so it has to be deployed manually
		auction = await AuctionContract.new(
			name,
			description,
			imageUrl,
			endDate,
			{ from: owner }
		);
	});

	describe("initialization", () => {
		it("gets the auction name", async () => {
			const actual = await auction.name();
			assert.equal(actual, name, "names should match");
		});

		it("gets the auction description", async () => {
			const actual = await auction.description();
			assert.equal(actual, description, "descriptions should match");
		});

		it("gets the auction image url", async () => {
			const actual = await auction.imageUrl();
			assert.equal(actual, imageUrl, "urls should match");
		});

		it("gets the auction end date", async () => {
			const actual = await auction.endDate();
			assert.equal(actual, endDate, "dates should match");
		});

		it("gets the auction owner", async () => {
			const actual = await auction.owner();
			assert.equal(actual, owner, "owners should match");
		});
	});

	async function addBids(auction, count) {
		for (let i = 1; i < count + 1; i++) {
			const value = web3.utils.toWei(i.toString());
			const bidder = accounts[i];
			await auction.placeBid(value, { from: bidder });
		}
	}

	describe("getting bids", () => {
		it("gets an empty list when there are no bids", async () => {
			const actual = await auction.getBids(0, 25);
			assert.equal(actual.length, 0, "bids list should be empty");
		});

		it("gets a list of bids", async () => {
			await addBids(auction, 3);
			const actual = await auction.getBids(0, 25);
			assert.equal(actual.length, 3, "bids list should have 3 items");
		});

		it("gets a paginated list of bids", async () => {
			await addBids(auction, 3);
			const actualFirstPage = await auction.getBids(0, 2);
			assert.equal(
				actualFirstPage.length,
				2,
				"bids first page should have 2 items"
			);
			const actualSecondPage = await auction.getBids(1, 2);
			assert.equal(
				actualSecondPage.length,
				1,
				"bids second page should have 1 item"
			);
		});

		it("does not fail from over-paginating", async () => {
			const actual = await auction.getBids(15, 3);
			assert.equal(actual.length, 0, "bids list should be empty");
		});
	});

	describe("placing bids", () => {
		const bidder = accounts[1];
		const value = web3.utils.toWei("0.123");

		it("adds a bid to the list", async () => {
			await auction.placeBid(value, { from: bidder });

			const actual = await auction.getBids(0, 25);
			assert.equal(actual.length, 1, "bids list should have one item");
			assert.equal(actual[0].bidder, bidder, "bidder should match");
			assert.equal(actual[0].value, value, "value should match");
		});

		it("emits a BidPlaced event", async () => {
			const tx = await auction.placeBid(value, { from: bidder });

			const expectedEvent = "BidPlaced";
			const actualEvent = tx.logs[0].event;
			assert.equal(actualEvent, expectedEvent, "events should match");
		});

		it("does not allow to bid without value", async () => {
			try {
				await auction.placeBid(0, { from: bidder });
				assert.fail("error was not raised");
			} catch (err) {
				const expected = "Bid must be greater than 0";
				assert.ok(err.message.includes(expected), err.message);
			}
		});

		it("does not allow to bid ended auction", async () => {
			const endDate = Math.floor(Date.now() / 1000) - 6000;
			const endedAuction = await AuctionContract.new(
				name,
				description,
				imageUrl,
				endDate,
				{ from: owner }
			);

			try {
				await endedAuction.placeBid(value, { from: bidder });
				assert.fail("error was not raised");
			} catch (err) {
				const expected = "Auction has ended";
				assert.ok(err.message.includes(expected), err.message);
			}
		});

		it("does not allow a bid from the owner", async () => {
			try {
				await auction.placeBid(value, { from: owner });
				assert.fail("error was not raised");
			} catch (err) {
				const expected = "Owners cannot bid on their own auction";
				assert.ok(err.message.includes(expected), err.message);
			}
		});

		it("does not allow to bid with a lower value", async () => {
			await auction.placeBid(value, { from: bidder });

			try {
				const lowerValue = web3.utils.toWei("0.001");
				await auction.placeBid(lowerValue, { from: bidder });
				assert.fail("error was not raised");
			} catch (err) {
				const expected = "Bid must be greater than last bid";
				assert.ok(err.message.includes(expected), err.message);
			}
		});

		it("does not allow a bid from the same bidder twice", async () => {
			await auction.placeBid(value, { from: bidder });

			try {
				const higherValue = value + 1000;
				await auction.placeBid(higherValue, { from: bidder });
				assert.fail("error was not raised");
			} catch (err) {
				const expected = "Bidder cannot place two bids in a row";
				assert.ok(err.message.includes(expected), err.message);
			}
		});

		it("allows to bid with a higher value", async () => {
			await auction.placeBid(value, { from: bidder });

			const anotherBidder = accounts[2];
			const higherValue = value + 1000;
			await auction.placeBid(higherValue, { from: anotherBidder });

			const actual = await auction.getBids(0, 25);
			assert.equal(actual.length, 2, "bids list should have two items");
			assert.equal(
				actual[1].bidder,
				anotherBidder,
				"bidder should match"
			);
			assert.equal(actual[1].value, higherValue, "value should match");
		});
	});

	describe("last bid", () => {
		it("returns an empty object when there are no bids", async () => {
			const actual = await auction.lastBid();
			assert.equal(actual.bidder, 0, "bidder should be empty");
			assert.equal(actual.value, 0, "value should be empty");
		});

		it("returns the last bid", async () => {
			await addBids(auction, 2);
			const actual = await auction.lastBid();
			assert.equal(actual.bidder, accounts[2], "bidder should match");
			assert.equal(
				actual.value,
				web3.utils.toWei("2"),
				"value should match"
			);
		});
	});
});
