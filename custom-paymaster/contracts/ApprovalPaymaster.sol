// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20 Approval-Based Paymaster
/// @author Matter Labs (modified by user)
/// @notice This paymaster contract uses an approval-based flow where users pay for transaction fees using an ERC20 token.
///         It pulls a fixed amount of tokens from the user and covers the required gas fees in ETH.
/// @dev The paymaster must be funded with ETH beforehand to cover transaction fees to the bootloader.
contract ApprovalPaymaster is IPaymaster, Ownable {
    uint256 public constant PRICE_FOR_PAYING_FEES = 1; // The fixed ERC20 amount charged per transaction
    address public allowedToken;

    /// @notice Emitted when a user transaction is successfully validated and paid for by the paymaster.
    /// @param user The address of the user sending the transaction.
    /// @param token The ERC20 token used to pay for the fee.
    /// @param amount The amount of tokens charged to the user.
    /// @param requiredETH The amount of ETH paid to the bootloader.
    /// @param gasLimit The gas limit of the transaction.
    /// @param maxFeePerGas The max fee per gas for the transaction.
    event PaymasterTransactionValidated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 requiredETH,
        uint256 gasLimit,
        uint256 maxFeePerGas
    );

    /// @notice Emitted after the transaction completes execution.
    /// @param user The address of the user who sent the original transaction.
    /// @param success Whether the user transaction succeeded.
    /// @param refundedGas The amount of gas that was refunded (if any).
    event PaymasterTransactionCompleted(
        address indexed user,
        bool success,
        uint256 refundedGas
    );

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only the bootloader can call this function"
        );
        _;
    }

    constructor(address _erc20) {
        allowedToken = _erc20;
    }

    /// @notice Validate and pay for a user transaction using the approval-based flow.
    /// @dev The user must have approved the paymaster contract to spend at least PRICE_FOR_PAYING_FEES of the allowedToken.
    /// @param _transaction The transaction being processed.
    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        require(
            _transaction.paymasterInput.length >= 4,
            "Invalid paymaster input length"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        if (paymasterInputSelector == IPaymasterFlow.approvalBased.selector) {
            // Decode paymaster input for approval-based flow:
            (address token, uint256 amount /* bytes memory data */, ) = abi
                .decode(
                    _transaction.paymasterInput[4:],
                    (address, uint256, bytes)
                );

            require(token == allowedToken, "Invalid token used for fees");

            address userAddress = address(uint160(_transaction.from));
            uint256 providedAllowance = IERC20(token).allowance(
                userAddress,
                address(this)
            );
            require(
                providedAllowance >= PRICE_FOR_PAYING_FEES,
                "User allowance too low"
            );

            // Calculate required ETH for the transaction
            uint256 requiredETH = _transaction.gasLimit *
                _transaction.maxFeePerGas;

            // Attempt to transfer tokens from the user to the paymaster
            try
                IERC20(token).transferFrom(userAddress, address(this), amount)
            {} catch (bytes memory revertReason) {
                // Provide a more readable revert message if transfer fails
                if (revertReason.length <= 4) {
                    revert("Token transferFrom failed");
                } else {
                    assembly {
                        revert(add(0x20, revertReason), mload(revertReason))
                    }
                }
            }

            // Transfer the required ETH fee to the bootloader
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(success, "Failed to transfer ETH to the bootloader");

            // Emit an event for indexing this validation step
            emit PaymasterTransactionValidated(
                userAddress,
                token,
                amount,
                requiredETH,
                _transaction.gasLimit,
                _transaction.maxFeePerGas
            );
        } else {
            revert("Unsupported paymaster flow");
        }
    }

    /// @notice Called after the transaction is executed. Useful for refunds or cleanup logic.
    /// @dev In this example, we don't implement any specific logic here, but we emit an event for indexing.
    function postTransaction(
        bytes calldata,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable onlyBootloader {
        bool success = (_txResult == ExecutionResult.Success);
        address userAddress = address(uint160(_transaction.from));
        emit PaymasterTransactionCompleted(
            userAddress,
            success,
            _maxRefundedGas
        );
    }

    /// @notice Withdraw all ETH from the paymaster to the owner.
    /// @param _to The address to receive the withdrawn ETH.
    function withdraw(address _to) external onlyOwner {
        require(_to != address(0), "Invalid withdraw address");
        (bool success, ) = payable(_to).call{value: address(this).balance}("");
        require(success, "Failed to withdraw ETH");
    }

    receive() external payable {}
}
