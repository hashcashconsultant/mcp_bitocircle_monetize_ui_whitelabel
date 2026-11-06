'use client';

import { Box, Button } from '@mui/material';

export default function GiftTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'recent', label: 'Recent Gifts and Badges' },
    { id: 'supporters', label: 'Top Supporters' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <Box
      sx={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: 1,
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          sx={{
            color: activeTab === tab.id ? '#2563eb' : '#9ca3af',
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
}