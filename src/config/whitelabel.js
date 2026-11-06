/**
 * WHITE-LABEL CONTROL PANEL — set your brand in ONE place.
 *
 * This Creator Dashboard (Monetize) runs next to your white-label community app, on the same domain
 * under /monetize (for example https://circle.paybito.com/monetize). It reads the sign-in from that
 * app (cookies paybito_launch_platform_token / paybito_launch_platform_uuid and localStorage
 * childUserId, uuid, collab_brand_id), so a member who is signed in on your community is signed in here too.
 *
 * THE GOLDEN RULE: change the look, not the wiring. Brand values below are free to change. The service
 * addresses at the end must stay as they are: the services keep your creators on your own platform
 * because the browser sends your domain with every call.
 *
 * NOTE: this snapshot ships with the sample brand "Circle". Replace every brand value with your own.
 */

export const WHITELABEL = {
  // --- Identity -------------------------------------------------------------
  brandName: 'Circle',
  productName: 'Circle Creator Dashboard',
  description: 'Monetization dashboard for Circle creators.',

  // --- Your community app ---------------------------------------------------
  // The domain your community app runs on. This dashboard is served from the same domain.
  siteUrl: 'https://circle.paybito.com',
  // The path this dashboard is served from. Keep it in sync with basePath in next.config.mjs.
  basePath: '/monetize',
  // Pages of your community app (and sibling apps on the same domain) this dashboard links to.
  communityLinks: {
    home: '/',
    feeds: '/feeds',
    wallet: '/bitodollar-wallet',
    merchandise: '/merchandise',
    // A member's public profile: profile(userId)
    profile: (userId) => `/public/${userId}/0`,
  },

  // --- Sign-in ---------------------------------------------------------------
  // Members sign in on your community app; this page of it is opened when nobody is signed in.
  signInPath: '/login',
  // Cookie domain used when clearing the sign-in cookies after a 401. Leave undefined to use the
  // current host; set it (for example '.example.com') only if your community app sets them that way.
  cookieDomain: undefined,

  // --- Look -----------------------------------------------------------------
  // Logo and icons live in public/ (bitoHubTextLogo.png, favicon-32x32.png). Replace those files
  // with your own (same names), or point these paths at new files in public/.
  logo: '/monetize/bitoHubTextLogo.png',
  favicon: '/monetize/favicon-32x32.png',
  fonts: {
    // No web font is loaded by this app; system fallbacks apply. Add a font loader if you change it.
    body: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  // Mapped onto the MUI theme palette (src/components/theme/theme.js).
  colors: {
    primary: { main: '#0d9488', light: '#2dd4bf', dark: '#0f766e', contrastText: '#ffffff' },
    secondary: { main: '#f97066', light: '#fda29b', dark: '#e04f45', contrastText: '#ffffff' },
    background: { default: '#0b1211', paper: '#121b1a' },
    text: { primary: '#f2f5f4', secondary: '#9aa8a5' },
  },

  // --- Services (do not change) ---------------------------------------------
  services: {
    monetize: 'https://institutional-bo.paybito.com:8443/MonetizeService',
    brokerAdminApi: 'https://institutional-bo.paybito.com:8443/BrokerAdminApi',
  },
};

/** A page of the community app this dashboard sits next to (same domain, so a plain path). */
export const communityUrl = (path = '/') => path;

/** The community app's sign-in page. */
export const signInUrl = () => communityUrl(WHITELABEL.signInPath);

export default WHITELABEL;
