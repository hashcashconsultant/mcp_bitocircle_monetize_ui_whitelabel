import { Metadata } from 'next'

import AdRevenuePage from '@/components/ad-revenue/AdRevenue'
import WHITELABEL from '@/config/whitelabel'
export const dynamic = 'force-dynamic' // Force dynamic rendering


export const metadata  = {
  title: `${WHITELABEL.brandName} - Finance Hub`,
  description: `Track your earnings and ad revenue on ${WHITELABEL.brandName}`,
}

export default function BitoHub() {
  return (
    
    <AdRevenuePage />
    
  )
}