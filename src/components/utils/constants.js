import WHITELABEL, { communityUrl } from '@/config/whitelabel';
export const DRAWER_WIDTH = 260;

export const MAX_OFFER_PLACE_LIMIT = 6;

export const menuSections = [
  {
    title: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'Home',
        path: '/',
      },
    ],
  },
  {
    title: 'REVENUE STREAMS',
    items: [
      {
        id: 'ad-revenue',
        label: 'Ad Revenue',
        icon: 'MonetizationOn',
        iconColor: '#fbbf24',
        path: '/ad-revenue',
        //badge: 'LIVE',
        //isLive: true,
      },
      {
        id: 'collaborations',
        label: 'Collaborations',
        icon: 'Handshake',
        iconColor: '#fbbf24',
        path: '/collaborations',
        
      },
      {
        id: 'gifts-badges',
        label: 'Gifts & Badges',
        icon: 'CardGiftcard',
        iconColor: '#fb923c',
        path: '/gifts-badges',
      },
      {
        id: 'merchandise',
        label: 'Merchandise',
        icon: 'Storefront',
        iconColor: '#a78bfa',
        path: communityUrl(WHITELABEL.communityLinks.merchandise),
        // Another app on the same domain, not a page of this dashboard (opened as a plain link).
        external: true,
      },
      {
        id: 'fan-subscriptions',
        label: 'Fan Subscriptions',
        icon: 'Star',
        iconColor: '#fbbf24',
        path: '/fan-subscriptions',
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'BarChart',
        iconColor: '#60a5fa',
        path: '/analytics',
      },
      {
        id: 'payouts',
        label: 'Payouts',
        icon: 'Payment',
        iconColor: '#fbbf24',
        path: '/payouts',
      },
      // {
      //   id: 'settings',
      //   label: 'Settings',
      //   icon: 'Settings',
      //   iconColor: '#9ca3af',
      //   path: '/settings',
      // },
    ],
  },
];