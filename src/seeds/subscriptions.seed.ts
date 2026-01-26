import { Subscription } from 'src/subscription/models/Subscription.model';

export const SUBSCRIPTIONS: Partial<Subscription>[] = [
  {
    name: 'Basic',
    range: 'MONTHLY',
    amount: 0,
    description: 'Basic monthly plan with limited access',
    userId: 'SYSTEM',
  },
  {
    name: 'Scholar',
    range: 'MONTHLY',
    amount: 2000,
    description: 'Scholar monthly plan for students',
    userId: 'SYSTEM',
  },
  {
    name: 'Champion',
    range: 'MONTHLY',
    amount: 3000,
    description: 'Champion monthly plan with full access',
    userId: 'SYSTEM',
  },
];
