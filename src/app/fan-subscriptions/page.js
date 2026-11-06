'use client';

import FanSubscriptionsPage from '@/components/fan-subscriptions/FanSubscriptions'

export const dynamic = 'force-dynamic'

export default function BitoHub() {
  console.log('🔵 CLIENT COMPONENT PAGE RENDERING');

  return <FanSubscriptionsPage />
}