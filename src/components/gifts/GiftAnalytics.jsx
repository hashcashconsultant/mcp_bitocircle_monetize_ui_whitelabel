'use client';

import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, ButtonGroup, CircularProgress } from '@mui/material';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

export default function GiftAnalytics({ isActive }) {
  const [period, setPeriod] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchAnalytics();
    }
  }, [isActive, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('childUserId');

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiClient.get(`${API_BASE_URL}/getAnalytics`, {
        params: {
          userId: userId,
          period: period
        }
      });

      setAnalytics(response.data?.data || null);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load analytics',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `B$ ${amount?.toLocaleString() || 0}`;
  };

  const formatPercentage = (percent) => {
    if (!percent || percent === 0) return null;
    const isPositive = percent > 0;
    return {
      text: `${isPositive ? '↑' : '↓'} ${Math.abs(percent).toFixed(1)}% from last period`,
      color: isPositive ? '#10b981' : '#ef4444'
    };
  };

  const getPeriodLabel = (periodValue) => {
    const labels = {
      '7d': '7 Days',
      '30d': '30 Days',
      '3m': '3 Months',
      'all': 'All Time'
    };
    return labels[periodValue] || periodValue;
  };

  // Get badge color based on badge level
  const getBadgeColor = (badgeLevel) => {
    const level = badgeLevel?.toLowerCase() || '';
    if (level.includes('diamond')) return '#3b82f6';
    if (level.includes('gold')) return '#fbbf24';
    if (level.includes('silver')) return '#9ca3af';
    if (level.includes('bronze')) return '#cd7f32';
    return '#3b82f6';
  };

  // Calculate max count for gift distribution bars
  const getMaxGiftCount = () => {
    if (!analytics?.giftTypeDistribution?.length) return 1;
    return Math.max(...analytics.giftTypeDistribution.map(g => g.totalGifts));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  if (!analytics) {
    return (
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
          No analytics data available
        </Typography>
      </Card>
    );
  }

  const summary = analytics.summary || {};
  const giftTypes = analytics.giftTypeDistribution || [];
  const badgeProgress = analytics.badgeProgression || [];
  const maxGiftCount = getMaxGiftCount();

  return (
    <>
      <Box>
        {/* Header with Period Filters */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Gifts & Badges Analytics
          </Typography>
          <ButtonGroup>
            {['7d', '30d', '3m', 'all'].map((value) => (
              <Button
                key={value}
                onClick={() => setPeriod(value)}
                sx={{
                  backgroundColor: period === value ? '#2563eb' : 'transparent',
                  color: period === value ? '#ffffff' : '#9ca3af',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.75,
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: period === value ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                {getPeriodLabel(value)}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, mb: 2 }}>
              TOTAL REVENUE
            </Typography>
            <Typography sx={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, mb: 1 }}>
              {formatCurrency(summary.totalRevenue)}
            </Typography>
            {formatPercentage(summary.revenueChangePercent) && (
              <Typography
                sx={{
                  color: formatPercentage(summary.revenueChangePercent).color,
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {formatPercentage(summary.revenueChangePercent).text}
              </Typography>
            )}
          </Card>

          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, mb: 2 }}>
              TOTAL GIFTS RECEIVED
            </Typography>
            <Typography sx={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, mb: 1 }}>
              {summary.totalGifts || 0}
            </Typography>
            {formatPercentage(summary.giftsChangePercent) && (
              <Typography
                sx={{
                  color: formatPercentage(summary.giftsChangePercent).color,
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {formatPercentage(summary.giftsChangePercent).text}
              </Typography>
            )}
          </Card>

          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, mb: 2 }}>
              NEW BADGE HOLDERS
            </Typography>
            <Typography sx={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, mb: 1 }}>
              {summary.newBadgeHolders || 0}
            </Typography>
            {formatPercentage(summary.badgesChangePercent) && (
              <Typography
                sx={{
                  color: formatPercentage(summary.badgesChangePercent).color,
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {formatPercentage(summary.badgesChangePercent).text}
              </Typography>
            )}
          </Card>

          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, mb: 2 }}>
              AVERAGE GIFT VALUE
            </Typography>
            <Typography sx={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, mb: 1 }}>
              {formatCurrency(summary.averageGiftValue)}
            </Typography>
            {formatPercentage(summary.avgChangePercent) && (
              <Typography
                sx={{
                  color: formatPercentage(summary.avgChangePercent).color,
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {formatPercentage(summary.avgChangePercent).text}
              </Typography>
            )}
          </Card>
        </Box>

        {/* Charts Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* Gift Type Distribution */}
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 700,
                mb: 3,
              }}
            >
              Gift Type Distribution
            </Typography>

            {giftTypes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#9ca3af', fontSize: '14px' }}>
                  No gift data available for this period
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {giftTypes.map((gift, index) => {
                  // Generate color based on index
                  const colors = ['#3b82f6', '#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
                  const color = colors[index % colors.length];

                  return (
                    <Box key={gift.giftId}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '2px',
                              backgroundColor: color,
                            }}
                          />
                          <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                            {gift.giftName} ({formatCurrency(gift.priceAmount)})
                          </Typography>
                        </Box>
                        <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                          {gift.totalGifts} gift{gift.totalGifts !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: '#1f1f1f',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${(gift.totalGifts / maxGiftCount) * 100}%`,
                            backgroundColor: color,
                            borderRadius: '4px',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>

          {/* Badge Progression */}
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 700,
                mb: 3,
              }}
            >
              Badge Progression This Period
            </Typography>

            {badgeProgress.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#9ca3af', fontSize: '14px' }}>
                  No badge data available for this period
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 3,
                }}
              >
                {badgeProgress.map((badge) => {
                  const color = getBadgeColor(badge.badgeLevel);

                  return (
                    <Box
                      key={badge.badgeId}
                      sx={{
                        backgroundColor: '#1f1f1f',
                        borderRadius: '12px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        component="img"
                        src={badge.badgeEmoji}
                        alt={badge.badgeLevel}
                        sx={{
                          width: 64,
                          height: 64,
                          mb: 2,
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          // Fallback: hide broken image and show placeholder
                          e.target.style.display = 'none';
                        }}
                      />
                      <Typography
                        sx={{
                          color: color,
                          fontSize: '24px',
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        +{badge.newCount}
                      </Typography>
                      <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                        New {badge.badgeLevel.replace(' Badge', '')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Box>
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