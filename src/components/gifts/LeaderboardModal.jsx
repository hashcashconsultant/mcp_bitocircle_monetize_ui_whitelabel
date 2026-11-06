'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

export default function LeaderboardModal({ open, onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (open) {
      setLimit(20);
      setHasMore(true);
      fetchLeaderboard(20, true);
    }
  }, [open]);

  const fetchLeaderboard = async (currentLimit, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const userId = localStorage.getItem('childUserId');

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiClient.get(`${API_BASE_URL}/getTopSupporters`, {
        params: {
          userId: userId,
          limit: currentLimit
        }
      });

      const data = response.data?.data || [];
      setLeaderboardData(data);

      // Check if there might be more data
      setHasMore(data.length === currentLimit);

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load leaderboard',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const newLimit = limit + 20;
    setLimit(newLimit);
    fetchLeaderboard(newLimit);
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#9ca3af';
    if (rank === 3) return '#cd7f32';
    return '#ffffff';
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1f1f1f',
            borderRadius: '16px',
            maxHeight: '85vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#2d2d2d',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Full Supporter Leaderboard
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: '#2563eb' }} />
            </Box>
          ) : leaderboardData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: '#9ca3af', fontSize: '16px' }}>
                No supporters yet
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: '60vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        RANK
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        SUPPORTER
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        BADGE LEVEL
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        TOTAL SUPPORT
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        GIFTS SENT
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2d2d2d', color: '#9ca3af', fontWeight: 700, fontSize: '12px' }}>
                        MEMBER SINCE
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboardData.map((row) => (
                      <TableRow
                        key={row.userId + '-' + row.rank}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#2d2d2d',
                          },
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: row.rank <= 3 ? 'transparent' : '#2d2d2d',
                              color: getRankColor(row.rank),
                              fontWeight: 700,
                              fontSize: '14px',
                            }}
                          >
                            {row.rank}
                          </Avatar>
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {row.username}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {badgeEmojiMap[row.badgeEmoji] || '🏅'} {row.badgeLevel}
                        </TableCell>
                        <TableCell sx={{ color: '#2563eb', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          B$ {row.totalSupport}
                        </TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {row.giftsSent}
                        </TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {formatMemberSince(row.memberSince)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Load More Button */}
              {hasMore && (
                <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="contained"
                    sx={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                      '&:disabled': {
                        backgroundColor: '#374151',
                        color: '#6b7280',
                      },
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
}