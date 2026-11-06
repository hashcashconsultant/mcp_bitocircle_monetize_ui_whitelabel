'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import { Suspense } from 'react';

import StatsOverview from '@/components/dashboard/StatsOverview';
import RevenueBreakdown from '@/components/dashboard/RevenueBreakdown';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CustomSnackbar from '@/components/utils/CustomSnackbar';
import SearchParamsHandler from '@/components/dashboard/SearchParamsHandler';

export default function DashboardPage() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {/* This fixes Jenkins build error */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      {/* Stats Cards */}
      <StatsOverview onError={showSnackbar} />

      {/* Revenue Breakdown and Recent Activity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 3,
          mt: 3,
        }}
      >
        <RevenueBreakdown onError={showSnackbar} />
        <RecentActivity onError={showSnackbar} />
      </Box>

      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
