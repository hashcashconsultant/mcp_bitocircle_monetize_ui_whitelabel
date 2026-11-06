'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function StatsCard({ title, value, change, icon, isPositive = true }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#9ca3af',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: '2rem',
          }}
        >
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isPositive ? (
            <TrendingUpIcon sx={{ fontSize: '1rem', color: '#10b981' }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? '#10b981' : '#ef4444',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.75rem',
              ml: 0.5,
            }}
          >
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}