'use client';

import { Box } from '@mui/material';

export default function LiveBadge() {
  return (
    <Box
      sx={{
        backgroundColor: '#ef4444',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '4px',
        display: 'inline-block',
        letterSpacing: '0.5px',
      }}
    >
      LIVE
    </Box>
  );
}