// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../contracts/Auction.sol";

contract AuctionFactory {
    Auction[] private _auctions;

    struct AuctionObject {
        string name;
        string description;
        string imageUrl;
        uint256 endDate;
        uint256 lastBid;
    }

    event AuctionCreated(Auction auction);

    function createAuction(
        string memory name,
        string memory description,
        string memory imageUrl,
        uint256 endDate
    ) public {
        Auction auction = new Auction(name, description, imageUrl, endDate);
        _auctions.push(auction);

        emit AuctionCreated(auction);
    }

    function getAuctionsLength() public view returns (uint256) {
        return _auctions.length;
    }

    function getAuctions(uint256 page, uint256 pageSize)
        public
        view
        returns (AuctionObject[] memory auctions)
    {
        // Define start
        uint256 start = page * pageSize;
        if (start >= _auctions.length) {
            return auctions;
        }

        // Define end
        uint256 end = start + pageSize;
        uint256 length = getAuctionsLength();
        end = end > length ? length : end;

        // Define collection
        uint256 size = end - start;
        auctions = new AuctionObject[](size);

        // Build collection
        for (uint256 i = 0; i < size; i++) {
            Auction auction = _auctions[start + i];
            auctions[i] = AuctionObject({
                name: auction.name(),
                description: auction.description(),
                imageUrl: auction.imageUrl(),
                endDate: auction.endDate(),
                lastBid: auction.getLastBid().value
            });
        }
        return auctions;
    }
}
