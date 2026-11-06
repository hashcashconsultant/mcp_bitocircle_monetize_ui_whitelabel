'use client';

import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Avatar, CircularProgress } from '@mui/material';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

// Emoji mapping for badge codes
const badgeEmojiMap = {
  'DIAMOND': '💎',
  'GOLD': '🏆',
  'SILVER': '🥈',
  'BRONZE': '🥉',
};

// Gradient colors for top 3 ranks
const getRankGradient = (rank) => {
  if (rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
  if (rank === 2) return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
  if (rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)';
  return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
};

export default function TopSupporters({ onThankClick, onViewLeaderboard }) {
  const [topSupporters, setTopSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchTopSupporters();
  }, []);

  const fetchTopSupporters = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('childUserId');

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiClient.get(`${API_BASE_URL}/getTopSupporters`, {
        params: {
          userId: userId,
          limit: 10
        }
      });

      const supportersData = response.data?.data || [];
      setTopSupporters(supportersData);

    } catch (error) {
      console.error('Error fetching top supporters:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load top supporters',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
            Top Supporters
          </Typography>
          <Button
            onClick={onViewLeaderboard}
            sx={{
              color: '#2563eb',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                color: '#1d4ed8',
              },
            }}
          >
            Full Leaderboard →
          </Button>
        </Box>

        {/* Top Supporters List */}
        {topSupporters.length === 0 ? (
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
              No supporters yet
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {topSupporters.map((supporter) => (
              <Card
                key={supporter.userId + '-' + supporter.rank}
                sx={{
                  background: getRankGradient(supporter.rank),
                  borderRadius: '16px',
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 0,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {/* Rank Badge */}
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {supporter.rank}
                  </Avatar>

                  {/* Supporter Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '20px',
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      {supporter.username}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '14px',
                      }}
                    >
                      {badgeEmojiMap[supporter.badgeEmoji] || '🏅'} {supporter.badgeLevel}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '12px',
                        mt: 0.5,
                      }}
                    >
                      Member since {formatMemberSince(supporter.memberSince)}
                    </Typography>
                  </Box>

                  {/* Amount and Button */}
                  <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '24px',
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        B$ {supporter.totalSupport}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '13px',
                        }}
                      >
                        {supporter.giftsSent} gift{supporter.giftsSent !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => onThankClick(supporter)}
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
                      Thank
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
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