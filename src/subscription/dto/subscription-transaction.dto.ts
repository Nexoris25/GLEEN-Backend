import { OmitType, PartialType } from '@nestjs/swagger';
import { SubscriptionTransaction } from '../models/subscription-transaction.model';

// Exclude auto-generated fields
export class CreateSubscriptionTransactionDto extends OmitType(
  SubscriptionTransaction,
  ['id', 'userId', 'reference', 'status'] as const,
) {}

export class UpdateSubscriptionTransactionDto extends PartialType(
  CreateSubscriptionTransactionDto,
) {}
