import {
  OwnershipTransferred as OwnershipTransferredEvent,
  PaymasterTransactionCompleted as PaymasterTransactionCompletedEvent,
  PaymasterTransactionValidated as PaymasterTransactionValidatedEvent
} from "../generated/ApprovalPaymaster/ApprovalPaymaster"
import {
  OwnershipTransferred,
  PaymasterTransactionCompleted,
  PaymasterTransactionValidated
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaymasterTransactionCompleted(
  event: PaymasterTransactionCompletedEvent
): void {
  let entity = new PaymasterTransactionCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.success = event.params.success
  entity.refundedGas = event.params.refundedGas

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaymasterTransactionValidated(
  event: PaymasterTransactionValidatedEvent
): void {
  let entity = new PaymasterTransactionValidated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.requiredETH = event.params.requiredETH
  entity.gasLimit = event.params.gasLimit
  entity.maxFeePerGas = event.params.maxFeePerGas

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
