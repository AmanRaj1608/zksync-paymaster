import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  PaymasterTransactionCompleted,
  PaymasterTransactionValidated
} from "../generated/ApprovalPaymaster/ApprovalPaymaster"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPaymasterTransactionCompletedEvent(
  user: Address,
  success: boolean,
  refundedGas: BigInt
): PaymasterTransactionCompleted {
  let paymasterTransactionCompletedEvent =
    changetype<PaymasterTransactionCompleted>(newMockEvent())

  paymasterTransactionCompletedEvent.parameters = new Array()

  paymasterTransactionCompletedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  paymasterTransactionCompletedEvent.parameters.push(
    new ethereum.EventParam("success", ethereum.Value.fromBoolean(success))
  )
  paymasterTransactionCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "refundedGas",
      ethereum.Value.fromUnsignedBigInt(refundedGas)
    )
  )

  return paymasterTransactionCompletedEvent
}

export function createPaymasterTransactionValidatedEvent(
  user: Address,
  token: Address,
  amount: BigInt,
  requiredETH: BigInt,
  gasLimit: BigInt,
  maxFeePerGas: BigInt
): PaymasterTransactionValidated {
  let paymasterTransactionValidatedEvent =
    changetype<PaymasterTransactionValidated>(newMockEvent())

  paymasterTransactionValidatedEvent.parameters = new Array()

  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      "requiredETH",
      ethereum.Value.fromUnsignedBigInt(requiredETH)
    )
  )
  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      "gasLimit",
      ethereum.Value.fromUnsignedBigInt(gasLimit)
    )
  )
  paymasterTransactionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxFeePerGas",
      ethereum.Value.fromUnsignedBigInt(maxFeePerGas)
    )
  )

  return paymasterTransactionValidatedEvent
}
