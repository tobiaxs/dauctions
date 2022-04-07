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
    bool public paid = false;

    struct Bid {
        address bidder;
        uint256 value;
        uint256 date;
    }
    Bid[] private _bids;

    event BidPlaced(Bid bid);
    event Payment(uint256 amount);
    event Withdrawal(uint256 amount);

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

    function getLastBid() public view returns (Bid memory bid) {
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

        Bid memory bid = Bid({
            bidder: msg.sender,
            value: value,
            date: block.timestamp
        });

        if (_bids.length == 0) {
            // First bid
            _bids.push(bid);
        } else {
            Bid memory lastBid = getLastBid();
            require(value > lastBid.value, "Bid must be greater than last bid");
            require(
                msg.sender != lastBid.bidder,
                "Bidder cannot place two bids in a row"
            );
            _bids.push(bid);
        }

        emit BidPlaced(bid);
    }

    function pay() public payable {
        require(endDate < block.timestamp, "Auction has not ended");
        require(paid == false, "Auction has already been paid");

        Bid memory lastBid = getLastBid();
        require(msg.sender == lastBid.bidder, "Only the last bidder can pay");
        require(
            msg.value >= lastBid.value,
            "Bidder cannot pay less than the last bid"
        );

        paid = true;

        emit Payment(msg.value);
    }

    function withdraw() public onlyOwner {
        require(endDate < block.timestamp, "Auction has not ended");
        require(paid == true, "Auction has not been paid");

        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);

        emit Withdrawal(balance);
    }

    fallback() external payable {}

    receive() external payable {}
}
