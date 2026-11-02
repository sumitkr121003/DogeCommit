// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestDOGE
 * @notice Standard ERC-20 token used ONLY for local unit testing.
 *         Matches the exact 18-decimal DOGE token on DogeOS Chikyū Testnet.
 */
contract TestDOGE is ERC20 {
    constructor() ERC20("Dogecoin", "DOGE") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
