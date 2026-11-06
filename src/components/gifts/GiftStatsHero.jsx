'use client';

import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

export default function GiftStatsHero({ onSettingsClick }) {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyChange: 0,
    dailyRevenue: 0,
    dailyChange: 0,
  });
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

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'B$ 0';
    return `B$ ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  // Format percentage change
  const formatPercentage = (change) => {
    if (!change || change === 0) return '0%';
    const sign = change > 0 ? '↑' : '↓';
    return `${sign} ${Math.abs(change).toFixed(1)}%`;
  };

  // Get percentage color
  const getPercentageColor = (change) => {
    if (!change || change === 0) return '#6b7280';
    return change > 0 ? '#10b981' : '#ef4444';
  };

  // Fetch dashboard summary
  const fetchDashboardSummary = async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/getDashboardSummary?userId=${userId}`
      );

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message || 'Failed to load dashboard data', 'error');
        return;
      }

      const data = response.data.data;
      setDashboardData({
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        monthlyChange: data.monthlyChange || 0,
        dailyRevenue: data.dailyRevenue || 0,
        dailyChange: data.dailyChange || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load dashboard data',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Gifts & Badges
          </Typography>
          <Button
            startIcon={<SettingsIcon />}
            onClick={onSettingsClick}
            sx={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Gift Settings
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {/* Total Revenue */}
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              p: 3,
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                mb: 2,
              }}
            >
              TOTAL GIFTS REVENUE
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 700,
                mb: 1,
              }}
            >
              {isLoading ? '...' : formatCurrency(dashboardData.totalRevenue)}
            </Typography>
           
          </Card>

          {/* This Month */}
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              p: 3,
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                mb: 2,
              }}
            >
              THIS MONTH
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 700,
                mb: 1,
              }}
            >
              {isLoading ? '...' : formatCurrency(dashboardData.monthlyRevenue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
              <Typography
                sx={{
                  color: getPercentageColor(dashboardData.monthlyChange),
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {formatPercentage(dashboardData.monthlyChange)}
              </Typography>
            </Box>
          </Card>

          {/* Today */}
          <Card
            sx={{
              backgroundColor: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              p: 3,
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                mb: 2,
              }}
            >
              TODAY
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 700,
                mb: 1,
              }}
            >
              {isLoading ? '...' : formatCurrency(dashboardData.dailyRevenue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
              <Typography
                sx={{
                  color: getPercentageColor(dashboardData.dailyChange),
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {formatPercentage(dashboardData.dailyChange)}
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>

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