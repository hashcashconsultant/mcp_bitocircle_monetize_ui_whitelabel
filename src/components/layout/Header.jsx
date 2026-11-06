'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import LockIcon from '@mui/icons-material/Lock';
import { checkCurrentCreatorEligibility } from '../../components/utils/library';
import CustomSnackbar from '../../components/utils/CustomSnackbar';
import WHITELABEL, { communityUrl } from '@/config/whitelabel';


export default function Header({ onMobileMenuToggle }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [canMonetize, setCanMonetize] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [requiredFollowers, setRequiredFollowers] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pathname = usePathname();

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchMonetizationEligibility = async () => {
    setLoading(true);
    try {
      const { isEligible, requiredFollowers } = await checkCurrentCreatorEligibility();
      setCanMonetize(isEligible);

      if (!isEligible) {
        setOpenDialog(true);
        setRequiredFollowers(requiredFollowers);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
      setCanMonetize(false);
      showSnackbar(
        'Failed to fetch monetization eligibility. Please try again later.',
        'warning'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonetizationEligibility();
  }, []);

  useEffect(() => {
    fetchMonetizationEligibility();
  }, [pathname]);

  const handleWithdrawClick = () => {
    window.open(communityUrl(WHITELABEL.communityLinks.wallet), '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: 'calc(100% - 260px)' },
          ml: { xs: 0, md: '260px' },
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid #2a2a2a',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: '56px', sm: '64px' } }}>
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Title */}
          <Typography
            variant={isSmallMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              flex: 1,
            }}
          >
            Dashboard Overview
          </Typography>

          {/* Withdraw Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleWithdrawClick}
              sx={{
                px: { xs: 1.5, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                backgroundColor: '#2563eb',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#4b5563',
                  color: '#9ca3af',
                },
              }}
            >
              {isSmallMobile ? 'B$ Withdraw Funds' : 'B$ Withdraw Funds'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Monetization Requirement Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            backgroundColor: '#1f1f1f',
            borderRadius: isSmallMobile ? 0 : '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            m: isSmallMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontSize: { xs: '18px', sm: '22px' },
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>Monetization Not Available</Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: '#9ca3af',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            pb: 3,
            px: { xs: 2, sm: 3 },
            overflowY: 'auto',
          }}
        >
          {/* Main Message */}
          <Box
            sx={{
              backgroundColor: '#262626',
              borderRadius: '12px',
              p: { xs: 2, sm: 3 },
              mb: 3,
              border: '1px solid #ef4444',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 600,
                mb: 2,
                textAlign: 'center',
              }}
            >
              You need to meet the eligibility requirements to use monetization features
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#ffffff' }} />
              </Box>
            </Box>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: { xs: '13px', sm: '14px' },
                textAlign: 'center',
              }}
            >
              Your account doesn't meet the minimum requirements for monetization yet
            </Typography>
          </Box>

          {/* Requirements Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 600,
                mb: 2,
              }}
            >
              Monetization Requirements:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                `Have at least ${requiredFollowers} followers`,
                'Complete your profile information',
                'Verify your account',
                'Agree to monetization terms',
                'Meet community guidelines',
              ].map((requirement, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: { xs: 1.25, sm: 1.5 },
                    backgroundColor: '#262626',
                    borderRadius: '8px',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 20, sm: 24 },
                      height: { xs: 20, sm: 24 },
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: { xs: '10px', sm: '12px' },
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      color: '#e5e7eb',
                      fontSize: { xs: '13px', sm: '14px' },
                    }}
                  >
                    {requirement}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              backgroundColor: '#262626',
              borderRadius: '8px',
              p: 2,
              border: '1px solid rgba(37, 99, 235, 0.3)',
            }}
          >
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: { xs: '12px', sm: '13px' },
                textAlign: 'center',
              }}
            >
              💡 Once you meet all requirements, you'll be able to withdraw funds and access all monetization features
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Button
            onClick={handleClose}
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textTransform: 'none',
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: '14px', sm: '15px' },
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
}