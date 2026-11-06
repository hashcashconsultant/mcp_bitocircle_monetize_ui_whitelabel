import WHITELABEL from '@/config/whitelabel';

export const metadata = {
    title: `${WHITELABEL.brandName} - Payouts Center`,
    description: `Manage your payouts and earnings on ${WHITELABEL.brandName}`,
}

export default function PayoutLayout({ children }) {
    // Simple layout - just renders children
    return <>{children}</>;
}