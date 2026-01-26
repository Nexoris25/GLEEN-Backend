import { OmitType, PartialType } from '@nestjs/swagger';
import { Subscription } from '../models/Subscription.model';

// Exclude auto-generated and userId from creation payload
export class CreateSubscriptionDto extends OmitType(Subscription, ['id', 'userId'] as const) {}
// Partial update
export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}