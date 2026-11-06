import WHITELABEL from '@/config/whitelabel';

export const metadata = {
    title: `${WHITELABEL.brandName} - Analytics`,
    description: `Check your analytics and performance on ${WHITELABEL.brandName}`,
};

export default function AnalyticsLayout({ children }) {
    // Simple layout - just renders children
    return <>{children}</>;
}