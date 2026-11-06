'use client';

import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Avatar, CircularProgress } from '@mui/material';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

// Emoji mapping for gift codes
const giftEmojiMap = {
  'HEART': '❤️',
  'STAR': '⭐',
  'PARTY': '🎉',
  'TARGET': '🎯',
  'FIRE': '🔥',
  'ROCKET': '🚀',
  'DIAMOND': '💎',
  'CROWN': '👑',
};

// Emoji mapping for badge codes
const badgeEmojiMap = {
  'DIAMOND': '💎',
  'GOLD': '🏆',
  'SILVER': '🥈',
  'BRONZE': '🥉',
};

export default function RecentGifts({ onThankClick, isActive }) {
  const [recentGifts, setRecentGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchRecentGiftsAndBadges();
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchRecentGiftsAndBadges();
    }
  }, [isActive]);

  const fetchRecentGiftsAndBadges = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('childUserId');

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch recent gifts and badges
      const response = await apiClient.get(`${API_BASE_URL}/getRecentGiftsAndBadges?userId=${userId}`);

      const { gifts = [], badges = [] } = response.data?.data || {};

      console.log('API Response - Gifts:', gifts);
      console.log('API Response - Badges:', badges);

      // Process gifts data
      const processedGifts = gifts.map((gift) => ({
        id: `gift-${gift.txnId}`,
        icon: giftEmojiMap[gift.giftCode] || '🎁',
        username: gift.senderUsername,
        giftType: gift.giftName,
        amount: `B$ ${gift.priceAmount}`,
        type: 'gift',
        giftCode: gift.giftCode,
        priceAmount: gift.priceAmount,
        priceCurrency: gift.priceCurrency,
        isThanked: gift.isThanked,
        txnId: gift.txnId,
      }));

      // Process badges data
      const processedBadges = badges.map((badge) => ({
        id: `badge-${badge.availId}`,
        icon: badgeEmojiMap[badge.badgeCode] || '🏅',
        username: badge.username || 'Unknown User',
        giftType: badge.badgeName,
        badgeText: `${badge.badgeName} Supporter`,
        amount: `B$ ${badge.priceAmount}${badge.isLifetime === 'Y' ? ' (Lifetime)' : ''}`,
        achievedAt: badge.achievedAt,
        type: 'badge',
        badgeCode: badge.badgeCode,
        priceAmount: badge.priceAmount,
        priceCurrency: badge.priceCurrency,
        isLifetime: badge.isLifetime,
        availId: badge.availId,
        celebrateStatus: badge.celebrateStatus || badge.celebratedStatus || 'N', // Handle different possible field names
      }));

      console.log('Processed Gifts:', processedGifts);
      console.log('Processed Badges:', processedBadges);

      // Combine gifts and badges
      const combinedData = [...processedGifts, ...processedBadges];

      setRecentGifts(combinedData);

    } catch (error) {
      console.error('Error fetching gifts and badges:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load gifts and badges',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format achieved date
  const formatAchievedDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  return (
    <>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Recent Gifts and Badges
          </Typography>
          <Button
            onClick={fetchRecentGiftsAndBadges}
            sx={{
              color: '#9ca3af',
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                color: '#ffffff',
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Gift List */}
        {recentGifts.length === 0 ? (
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: '#9ca3af', fontSize: '16px' }}>
              No recent gifts or badges yet
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentGifts.map((gift) => {
              // Determine button state based on type
              const isGift = gift.type === 'gift';
              const isBadge = gift.type === 'badge';

              const isActionCompleted = isGift
                ? gift.isThanked === 'Y'
                : gift.celebrateStatus === 'Y';

              const buttonText = isGift
                ? (gift.isThanked === 'Y' ? 'Thanked' : 'Thank')
                : (gift.celebrateStatus === 'Y' ? 'Celebrated' : 'Celebrate');

              const buttonColor = isActionCompleted ? '#10b981' : '#2563eb';
              const buttonHoverColor = isActionCompleted ? '#059669' : '#1d4ed8';

              console.log(`Item ${gift.id}:`, {
                type: gift.type,
                isThanked: gift.isThanked,
                celebrateStatus: gift.celebrateStatus,
                isActionCompleted,
                buttonText
              });

              return (
                <Card
                  key={gift.id}
                  sx={{
                    backgroundColor: '#2d2d2d',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#353535',
                      border: isBadge ? '1px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon */}
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        fontSize: '28px',
                        backgroundColor: '#1f1f1f',
                      }}
                    >
                      {gift.icon}
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '16px',
                              fontWeight: 600,
                              mb: 0.5,
                            }}
                          >
                            {gift.username}
                          </Typography>
                          <Typography
                            sx={{
                              color: '#9ca3af',
                              fontSize: '14px',
                            }}
                          >
                            {isGift ? `sent ${gift.giftType}` : `achieved ${gift.giftType}`}
                            {gift.achievedAt && ` • ${formatAchievedDate(gift.achievedAt)}`}
                          </Typography>
                          {gift.badgeText && (
                            <Typography
                              sx={{
                                color: '#3b82f6',
                                fontSize: '13px',
                                mt: 0.5,
                              }}
                            >
                              {gift.badgeText}
                            </Typography>
                          )}
                        </Box>

                        {/* Amount and Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              sx={{
                                color: '#2563eb',
                                fontSize: '18px',
                                fontWeight: 700,
                              }}
                            >
                              {gift.amount}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            onClick={() => {
                              if (!isActionCompleted) {
                                onThankClick(gift);
                              }
                            }}
                            disabled={isActionCompleted}
                            sx={{
                              backgroundColor: buttonColor,
                              color: '#ffffff',
                              px: 3,
                              py: 0.75,
                              fontWeight: 600,
                              textTransform: 'none',
                              cursor: isActionCompleted ? 'not-allowed' : 'pointer',
                              opacity: isActionCompleted ? 0.8 : 1,
                              '&:hover': {
                                backgroundColor: isActionCompleted ? buttonColor : buttonHoverColor,
                              },
                              '&.Mui-disabled': {
                                backgroundColor: buttonColor,
                                color: '#ffffff',
                                opacity: 0.8,
                              },
                            }}
                          >
                            {buttonText}
                          </Button>
                        </Box>
                      </Box>

                      {/* Message - show for high-value gifts only (not badges) */}
                      {isGift && gift.priceAmount >= 100 && (
                        <Box
                          sx={{
                            backgroundColor: '#1f1f1f',
                            borderRadius: '8px',
                            p: 2,
                            mt: 2,
                            borderLeft: '3px solid #2563eb',
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#e5e7eb',
                              fontSize: '14px',
                              fontStyle: 'italic',
                            }}
                          >
                            "Premium gift - Thank you for your amazing support! 🚀"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
}