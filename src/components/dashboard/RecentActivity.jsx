'use client';

import { Box, Card, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/dashboard';

// Helper to format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '+$0.00';
  const num = Number(value);

  // Always show positive sign for amounts
  const sign = num >= 0 ? '+' : '-';
  const absNum = Math.abs(num);

  if (absNum < 0.01) {
    return `${sign}$ ${absNum.toFixed(8)}`;
  }

  return `${sign}$ ${absNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
};

// Map transaction types to emojis and display titles
const getActivityInfo = (txnType) => {
  switch (txnType) {
    case 'AD_REVENUE':
      return { icon: '💰', title: 'Ad revenue earned' };
    case 'GIFT_REVENUE':
      return { icon: '🎁', title: 'Gift revenue received' };
    case 'BADGE_REVENUE':
      return { icon: '⭐', title: 'Badge revenue earned' };
    case 'FAN_SUBSCRIPTION_REVENUE':
      return { icon: '🤩', title: 'Fan subscription revenue' };
    case 'COLLAB_REVENUE':
      return { icon: '🤝', title: 'Collaboration revenue' };
    case 'MERCHANDISE_REVENUE':
      return { icon: '🛍️', title: 'Merchandise revenue' };
    case 'SUBSCRIPTION':
      return { icon: '⭐', title: 'New Gold subscriber' };
    case 'SUPER_GIFT':
      return { icon: '🎁', title: 'Received Super Gift' };
    case 'COLLABORATION':
      return { icon: '🤝', title: 'New collaboration started' };
    case 'DONATION':
      return { icon: '❤️', title: 'Donation received' };
    case 'TIP':
      return { icon: '💎', title: 'Tip received' };
    default:
      return { icon: '💸', title: 'Transaction' };
  }
};

export default function RecentActivity({ onError }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    // Show scrollbar only when there are more than 5 items
    setShowScrollbar(activities.length > 5);
  }, [activities]);

  const fetchRecentActivity = async () => {
    setLoading(true);
    const creatorId = localStorage.getItem('childUserId');

    if (!creatorId) {
      if (onError) onError('User ID not found. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/recentTxnHistory/${creatorId}`);

      if (response.data && response.data.success) {
        const transactions = response.data.data;

        // Transform API data to match component structure
        const formattedActivities = transactions.map((txn, index) => {
          const activityInfo = getActivityInfo(txn.txnType);
          return {
            id: index + 1,
            icon: activityInfo.icon,
            title: activityInfo.title,
            amount: formatCurrency(txn.amount),
            time: txn.timeAgo || 'Just now',
          };
        });

        if (formattedActivities.length > 0) {
          setActivities(formattedActivities);
        } else {
          if (onError) onError('No recent transactions found', 'info');
        }
      } else {
        if (onError) onError(response.data?.message || 'Failed to fetch recent activity', 'error');
      }
    } catch (error) {
      console.error('Recent Activity Fetch Error:', error);
      if (onError) onError('Error connecting to activity service', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: '#2d2d2d',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent card overflow
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          Recent Activity
        </Typography>
      </Box>

      {/* Activity List */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflowY: showScrollbar ? 'auto' : 'hidden', // Show scrollbar only when needed
          overflowX: 'hidden',
          pr: showScrollbar ? 1 : 0, // Add padding for scrollbar only when shown
          minHeight: 0, // Important for flex child to respect overflow
          position: 'relative',
          ...(showScrollbar && {
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            },
          }),
        }}
      >
        {activities.map((activity) => (
          <Box
            key={activity.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#1f1f1f',
              transition: 'all 0.2s',
              cursor: 'pointer',
              flexShrink: 0, // Prevent activity items from shrinking
              '&:hover': {
                backgroundColor: '#2a2a2a',
                transform: 'translateX(4px)',
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                fontSize: '24px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                flexShrink: 0,
              }}
            >
              {activity.icon}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activity.title}
              </Typography>
              <Typography
                sx={{
                  color: '#6b7280',
                  fontSize: '12px',
                }}
              >
                {activity.time}
              </Typography>
            </Box>

            {/* Amount */}
            <Typography
              sx={{
                color: activity.amount.startsWith('+') ? '#10b981' : '#ef4444',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {activity.amount}
            </Typography>
          </Box>
        ))}

        {/* Loading state */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              Loading recent activity...
            </Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && activities.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              No recent activity found
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}