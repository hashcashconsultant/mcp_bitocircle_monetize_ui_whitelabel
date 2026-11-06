'use client';

import { Box, Card, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/dashboard';

// Helper to format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'B$ 0.00';
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return 'B$ 0.00';

  if (Math.abs(num) < 0.01) {
    return `B$ ${num.toFixed(8)}`;
  }

  return `B$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
};

// Helper to format large numbers
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  const num = Number(value);

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toLocaleString();
};

export default function StatsOverview({ onError }) {
  const [stats, setStats] = useState([
    {
      title: 'TOTAL EARNINGS',
      value: 'B$ 0.00',
      change: '0%',
      isPositive: true,
      icon: '💰',
    },
    {
      title: 'ACTIVE SUBSCRIBERS',
      value: '0',
      change: '0%',
      isPositive: true,
      icon: '⭐',
    },
    {
      title: 'TOTAL VIEWS',
      value: '0',
      change: '0%',
      isPositive: true,
      icon: '👁️',
    },
    {
      title: 'ENGAGEMENT RATE',
      value: '0%',
      change: '0%',
      isPositive: false,
      icon: '💬',
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    setLoading(true);
    const creatorId = localStorage.getItem('childUserId');

    if (!creatorId) {
      if (onError) onError('User ID not found. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/overview/${creatorId}`);

      if (response.data && response.data.success) {
        const data = response.data.data;

        setStats([
          {
            title: 'TOTAL EARNINGS',
            value: formatCurrency(data.totalEarnings),
            change: `${data.totalEarningGrowth >= 0 ? '+' : ''}${data.totalEarningGrowth?.toFixed(1) || 0}%`,
            isPositive: data.totalEarningGrowth >= 0,
            icon: '💰',
          },
          {
            title: 'ACTIVE SUBSCRIBERS',
            value: formatNumber(data.activeSubscribers),
            change: `${data.activeSubscribersGrowth >= 0 ? '+' : ''}${data.activeSubscribersGrowth?.toFixed(1) || 0}%`,
            isPositive: data.activeSubscribersGrowth >= 0,
            icon: '⭐',
          },
          {
            title: 'TOTAL VIEWS',
            value: formatNumber(data.totalViews),
            change: `${data.viewGrowth >= 0 ? '+' : ''}${data.viewGrowth?.toFixed(1) || 0}%`,
            isPositive: data.viewGrowth >= 0,
            icon: '👁️',
          },
          {
            title: 'ENGAGEMENT RATE',
            value: `${data.engagementRate?.toFixed(1) || 0}%`,
            change: `${data.engagementGrowth >= 0 ? '+' : ''}${data.engagementGrowth?.toFixed(1) || 0}%`,
            isPositive: data.engagementGrowth >= 0,
            icon: '💬',
          },
        ]);
      } else {
        if (onError) onError(response.data?.message || 'Failed to fetch dashboard overview', 'error');
      }
    } catch (error) {
      console.error('Dashboard Overview Fetch Error:', error);
      if (onError) onError('Error connecting to dashboard service', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
        mb: 3,
      }}
    >
      {stats.map((stat, index) => (
        <Card
          key={index}
          sx={{
            backgroundColor: '#2d2d2d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            p: 3,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Icon in top right */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontSize: '28px',
              opacity: 0.8,
            }}
          >
            {stat.icon}
          </Box>

          {/* Title */}
          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              mb: 2,
            }}
          >
            {stat.title}
          </Typography>

          {/* Value */}
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: 700,
              mb: 1,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </Typography>

          {/* Change indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {stat.isPositive ? (
              <TrendingUpIcon sx={{ fontSize: '16px', color: '#10b981' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: '16px', color: '#ef4444' }} />
            )}
            <Typography
              sx={{
                color: stat.isPositive ? '#10b981' : '#ef4444',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {stat.change}
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '13px',
                ml: 0.5,
              }}
            >
              vs last month
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}