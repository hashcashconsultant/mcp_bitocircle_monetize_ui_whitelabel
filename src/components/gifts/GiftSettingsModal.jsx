'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Switch,
  Checkbox,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

export default function GiftSettingsModal({ open, onClose }) {
  const [enableGifts, setEnableGifts] = useState(true);
  const [giftNotifications, setGiftNotifications] = useState(false);
  const [selectedGifts, setSelectedGifts] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [availableGifts, setAvailableGifts] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Show snackbar helper
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Get user ID from localStorage
  const getUserId = () => {
    const userId = localStorage.getItem('childUserId');
    if (!userId) {
      showSnackbar('User ID not found. Please log in again.', 'warning');
      return null;
    }
    return userId;
  };

  // Get gift icon based on code
  const getGiftIcon = (giftCode) => {
    const icons = {
      HEART: '❤️',
      STAR: '⭐',
      PARTY: '🎉',
      TARGET: '🎯',
      FIRE: '🔥',
      ROCKET: '🚀',
      DIAMOND: '💎',
      CROWN: '👑',
    };
    return icons[giftCode] || '🎁';
  };

  // Get badge icon based on code
  const getBadgeIcon = (badgeCode) => {
    const icons = {
      DIAMOND: '💎',
      GOLD: '🏆',
      SILVER: '🥈',
      BRONZE: '🥉',
    };
    return icons[badgeCode] || '🏅';
  };

  // Get badge color based on code
  const getBadgeColor = (badgeCode) => {
    const colors = {
      DIAMOND: '#3b82f6',
      GOLD: '#fbbf24',
      SILVER: '#9ca3af',
      BRONZE: '#cd7f32',
    };
    return colors[badgeCode] || '#6b7280';
  };

  // Fetch all badges
  const fetchAllBadges = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getAllBadges`);

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message || 'Failed to load badges', 'error');
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load badges',
        'error'
      );
      return [];
    }
  };

  // Fetch all gifts
  const fetchAllGifts = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/getAllGifts`);

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message || 'Failed to load gifts', 'error');
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching gifts:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load gifts',
        'error'
      );
      return [];
    }
  };

  // Fetch gift settings
  const fetchGiftSettings = async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      // Fetch all three APIs in parallel
      const [settingsResponse, allBadges, allGifts] = await Promise.all([
        apiClient.get(`${API_BASE_URL}/getGiftSettings/${userId}`),
        fetchAllBadges(),
        fetchAllGifts(),
      ]);

      const success = settingsResponse?.data?.success;
      if (!success) {
        showSnackbar(settingsResponse.data.message || 'Failed to load gift settings', 'error');
        return;
      }

      const data = settingsResponse.data.data;

      // Set toggle states
      setEnableGifts(data.enableGifts === 1);
      setGiftNotifications(data.enableNotifications === 1);

      // Set all available gifts and badges (from catalog APIs)
      setAvailableGifts(allGifts);
      setAvailableBadges(allBadges);

      // Set selected gifts and badges (from settings API)
      // giftId comes as a list from the service (e.g. [1]) since 3 Feb; accept a single id too.
      const selectedGiftIds = (data.availableGifts || []).flatMap((gift) => (Array.isArray(gift.giftId) ? gift.giftId : [gift.giftId]));
      const selectedBadgeIds = (data.availableBadges || []).map((badge) => badge.badgeId);

      setSelectedGifts(selectedGiftIds);
      setSelectedBadges(selectedBadgeIds);
    } catch (error) {
      console.error('Error fetching gift settings:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load gift settings',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save gift settings
  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      const payload = {
        userId: parseInt(userId),
        enableGifts: enableGifts ? 1 : 0,
        enableNotifications: giftNotifications ? 1 : 0,
        giftIds: selectedGifts.join(','),
        badgeIds: selectedBadges.join(','),
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/saveGiftSettings`,
        payload
      );

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message || 'Failed to save gift settings', 'error');
        return;
      }

      showSnackbar('Gift settings saved successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error saving gift settings:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to save gift settings',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle gift selection
  const handleGiftToggle = (giftId) => {
    setSelectedGifts((prev) =>
      prev.includes(giftId) ? prev.filter((id) => id !== giftId) : [...prev, giftId]
    );
  };

  // Toggle badge selection
  const handleBadgeToggle = (badgeId) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]
    );
  };

  // Load settings when modal opens
  useEffect(() => {
    if (open) {
      fetchGiftSettings();
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#2d2d2d',
            borderRadius: '16px',
            maxHeight: '85vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#1f1f1f',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Gift Settings
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Gift Options */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Gift Options
            </Typography>

            {/* Enable Gifts Toggle */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
              }}
            >
              <Typography sx={{ color: '#e5e7eb', fontSize: '14px' }}>
                Enable Gifts
              </Typography>
              <Switch
                checked={enableGifts}
                onChange={(e) => setEnableGifts(e.target.checked)}
                disabled={isLoading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2563eb',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#2563eb',
                  },
                }}
              />
            </Box>

            {/* Gift Notifications Toggle */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
              }}
            >
              <Typography sx={{ color: '#e5e7eb', fontSize: '14px' }}>
                Gift Notifications
              </Typography>
              <Switch
                checked={giftNotifications}
                onChange={(e) => setGiftNotifications(e.target.checked)}
                disabled={isLoading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2563eb',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#2563eb',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Available Gifts */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Available Gifts
            </Typography>

            {isLoading ? (
              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                Loading gifts...
              </Typography>
            ) : availableGifts.length === 0 ? (
              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                No gifts available
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 2,
                }}
              >
                {availableGifts.map((gift) => (
                  <Box
                    key={gift.giftId}
                    sx={{
                      position: 'relative',
                      backgroundColor: '#1f1f1f',
                      borderRadius: '12px',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: selectedGifts.includes(gift.giftId)
                        ? '2px solid #2563eb'
                        : '2px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                    onClick={() => handleGiftToggle(gift.giftId)}
                  >
                    <Checkbox
                      checked={selectedGifts.includes(gift.giftId)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        padding: 0,
                        color: '#6b7280',
                        '&.Mui-checked': {
                          color: '#2563eb',
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '32px', mb: 1 }}>
                      {gift.giftCode ? getGiftIcon(gift.giftName.toUpperCase()) : '🎁'}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'center',
                        mb: 0.5,
                        wordBreak: 'break-word',
                        lineHeight: 1.2,
                      }}
                    >
                      {gift?.giftName}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {gift.priceAmount} {gift.priceCurrency}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Available Badges */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Available Badges
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                p: 2,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(37, 99, 235, 0.3)',
              }}
            >
              <InfoIcon sx={{ color: '#2563eb', fontSize: '20px' }} />
              <Typography sx={{ color: '#60a5fa', fontSize: '13px' }}>
                Fans can purchase these badges to permanently display on their profile
              </Typography>
            </Box>

            {isLoading ? (
              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                Loading badges...
              </Typography>
            ) : availableBadges.length === 0 ? (
              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                No badges available
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                }}
              >
                {availableBadges.map((badge) => (
                  <Box
                    key={badge.badgeId}
                    sx={{
                      position: 'relative',
                      backgroundColor: '#1f1f1f',
                      borderRadius: '12px',
                      p: 2.5,
                      cursor: 'pointer',
                      border: selectedBadges.includes(badge.badgeId)
                        ? '2px solid #2563eb'
                        : '2px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                    onClick={() => handleBadgeToggle(badge.badgeId)}
                  >
                    <Checkbox
                      checked={selectedBadges.includes(badge.badgeId)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        padding: 0,
                        color: '#6b7280',
                        '&.Mui-checked': {
                          color: '#2563eb',
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography sx={{ fontSize: '32px' }}>
                        {getBadgeIcon(badge.badgeCode)}
                      </Typography>
                      <Box>
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: 600,
                            mb: 0.25,
                          }}
                        >
                          {badge.badgeName}
                        </Typography>
                        <Typography
                          sx={{
                            color: getBadgeColor(badge.badgeCode),
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {badge.priceAmount} {badge.priceCurrency}
                          {badge.isLifetime === 'Y' && ' (Lifetime)'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(37, 99, 235, 0.5)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#9ca3af',
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
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