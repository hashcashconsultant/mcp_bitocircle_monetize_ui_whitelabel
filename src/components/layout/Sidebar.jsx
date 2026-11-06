'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Badge,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DRAWER_WIDTH, menuSections } from '@/components/utils/constants';
import LiveBadge from '@/components/common/LiveBadge';
import WHITELABEL, { communityUrl } from '@/config/whitelabel';

// Icon mapping function
const getIcon = (iconName, color) => {
  const iconProps = { sx: { color: color || 'inherit' } };

  switch (iconName) {
    case 'Home':
      return <HomeIcon {...iconProps} />;
    case 'MonetizationOn':
      return <MonetizationOnIcon {...iconProps} />;
    case 'Handshake':
      return <HandshakeIcon {...iconProps} />;
    case 'CardGiftcard':
      return <CardGiftcardIcon {...iconProps} />;
    case 'Storefront':
      return <StorefrontIcon {...iconProps} />;
    case 'Star':
      return <StarIcon {...iconProps} />;
    case 'BarChart':
      return <BarChartIcon {...iconProps} />;
    case 'Payment':
      return <PaymentIcon {...iconProps} />;
    case 'Settings':
      return <SettingsIcon {...iconProps} />;
    default:
      return <HomeIcon {...iconProps} />;
  }
};

// Drawer content component (shared between mobile and desktop)
function DrawerContent({ onClose, isMobile }) {
  const pathname = usePathname();
  const basePath = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : '';

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Logo and Close Button - Aligned with Header */}
      <Box
        sx={{
          minHeight: { xs: '56px', sm: '64px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          px: 3,
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <Box
          component="a"
          href={communityUrl(WHITELABEL.communityLinks.feeds)}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
            transition: 'opacity 0.2s',
          }}
        >
          <img
            src={WHITELABEL.logo}
            alt={`${WHITELABEL.brandName} Logo`}
            style={{
              maxWidth: isMobile ? '140px' : '160px',
              height: 'auto',
              maxHeight: '40px',
            }}
          />
        </Box>
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              color: '#9ca3af',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Menu Sections */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {menuSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3, mt: section.title === 'MAIN' ? 3 : 0 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1,
                display: 'block',
                color: '#6b7280',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
              }}
            >
              {section.title}
            </Typography>
            <List sx={{ px: 2 }}>
              {section.items.map((item) => {
                const isStaticHtml = typeof item.path === 'string' && item.path.endsWith('.html');
                const isExternalUrl = item.external === true || (typeof item.path === 'string' && (item.path.startsWith('http://') || item.path.startsWith('https://')));
                const href = isStaticHtml ? `${basePath}${item.path}` : item.path;
                const isActive = !isStaticHtml && !isExternalUrl && pathname === item.path;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={isStaticHtml || isExternalUrl ? 'a' : Link}
                      href={href}
                      target={isStaticHtml || isExternalUrl ? '_blank' : undefined}
                      rel={isStaticHtml || isExternalUrl ? 'noopener noreferrer' : undefined}
                      onClick={handleItemClick}
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#2563eb' : 'transparent',
                        '&:hover': {
                          backgroundColor: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#fff' : 'inherit' }}>
                        {getIcon(item.icon, item.iconColor)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                      {isExternalUrl && (
                        <OpenInNewIcon sx={{ fontSize: '1rem', ml: 1, color: isActive ? '#fff' : 'inherit' }} />
                      )}
                      {item.badge && (
                        item.isLive ? (
                          <LiveBadge />
                        ) : (
                          <Badge
                            badgeContent={item.badge}
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.7rem',
                                height: '18px',
                                minWidth: '18px',
                              },
                            }}
                          />
                        )
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </>
  );
}

export default function Sidebar({ mobileOpen, onMobileToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#0a0a0a',
              borderRight: '1px solid #2a2a2a',
            },
          }}
        >
          <DrawerContent onClose={onMobileToggle} isMobile={true} />
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#0a0a0a',
              borderRight: '1px solid #2a2a2a',
            },
          }}
        >
          <DrawerContent isMobile={false} />
        </Drawer>
      )}
    </>
  );
}