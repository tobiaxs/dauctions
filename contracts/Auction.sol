// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Auction is Ownable {
    using SafeMath for uint256;

    string public name;
    string public description;
    string public imageUrl;
    uint256 public endDate;

    struct Bid {
        address bidder;
        uint256 value;
        uint256 date;
    }
    Bid[] private _bids;

    event BidPlaced(Bid bid);

    constructor(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _endDate
    ) {
        name = _name;
        description = _description;
        imageUrl = _imageUrl;
        endDate = _endDate;
    }

    function getBids(uint256 page, uint256 pageSize)
        public
        view
        returns (Bid[] memory bids)
    {
        // Define start
        uint256 start = page * pageSize;
        if (start >= _bids.length) {
            return bids;
        }

        // Define end
        uint256 end = start + pageSize;
        end = end > _bids.length ? _bids.length : end;

        // Define collection
        uint256 size = end - start;
        bids = new Bid[](size);

        // Build collection
        for (uint256 i = 0; i < size; i++) {
            bids[i] = _bids[start + i];
        }
        return bids;
    }

    function lastBid() public view returns (Bid memory bid) {
        if (_bids.length == 0) {
            return bid;
        }
        bid = _bids[_bids.length - 1];
        return bid;
    }

    function placeBid(uint256 value) public {
        require(value > 0, "Bid must be greater than 0");
        require(endDate > block.timestamp, "Auction has ended");
        require(
            msg.sender != owner(),
            "Owners cannot bid on their own auction"
        );

        if (_bids.length == 0) {
            // First bid
            Bid memory bid = Bid({
                bidder: msg.sender,
                value: value,
                date: block.timestamp
            });
            _bids.push(bid);
            emit BidPlaced(bid);
        } else {
            Bid memory _lastBid = lastBid();
            require(
                value > _lastBid.value,
                "Bid must be greater than last bid"
            );
            require(
                msg.sender != _lastBid.bidder,
                "Bidder cannot place two bids in a row"
            );
            Bid memory bid = Bid({
                bidder: msg.sender,
                value: value,
                date: block.timestamp
            });
            _bids.push(bid);
            emit BidPlaced(bid);
        }
    }

    fallback() external payable {}

    receive() external payable {}
}
