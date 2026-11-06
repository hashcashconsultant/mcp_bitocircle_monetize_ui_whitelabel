'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/giftsBadges';

export default function ThankModal({ open, onClose, supporter, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a message',
        severity: 'warning',
      });
      return;
    }

    try {
      setLoading(true);

      // Determine which API to call based on supporter type
      if (supporter?.type === 'badge') {
        // Celebrate badge
        const payload = {
          availId: supporter.availId,
          celebrateBadgeMessage: message.trim(),
          celebrateStatus: 'Y',
        };

        await apiClient.post(`${API_BASE_URL}/celebrateBadge`, payload);

        setSnackbar({
          open: true,
          message: 'Badge celebrated successfully! 🎉',
          severity: 'success',
        });
      } else if (supporter?.type === 'supporter') {
        // Thank supporter from TopSupporters component
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
          throw new Error('User ID not found. Please log in again.');
        }

        const payload = {
          creatorId: parseInt(creatorId),
          supporterId: supporter.userId || supporter.supporterId,
          thankMessage: message.trim()
        };

        const response = await apiClient.post(
          `${API_BASE_URL}/supporter-thank`,
          payload
        );

        if (response.data?.success) {
          setSnackbar({
            open: true,
            message: 'Thank you message sent successfully! 💝',
            severity: 'success',
          });
        } else {
          throw new Error(response.data?.message || 'Failed to send thank you');
        }
      } else {
        // Thank gift sender (from RecentGifts)
        const payload = {
          supporterId: supporter.txnId,
          supporterMessage: message.trim(),
          isThanked: 'Y',
        };

        await apiClient.post(`${API_BASE_URL}/thankGiftSender`, payload);

        setSnackbar({
          open: true,
          message: 'Thank you message sent successfully! 💝',
          severity: 'success',
        });
      }

      // Call success callback to refresh the list
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to send message',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!supporter) return null;

  // Determine the type of supporter
  const isBadge = supporter.type === 'badge';
  const isSupporter = supporter.type === 'supporter';
  const isGift = supporter.type === 'gift';

  const title = isBadge ? 'Celebrate Badge Achievement' : 'Thank Your Supporter';

  const placeholder = isBadge
    ? 'Write a celebration message for achieving this badge...'
    : 'Write a thank you message to your supporter...';

  // Get appropriate avatar icon
  const getAvatarIcon = () => {
    if (isBadge) return supporter.icon;
    if (isSupporter) {
      // Emoji based on badge level for top supporters
      const badgeEmojiMap = {
        'DIAMOND': '💎',
        'GOLD': '🏆',
        'SILVER': '🥈',
        'BRONZE': '🥉',
      };
      return badgeEmojiMap[supporter.badgeEmoji] || '🏅';
    }
    return supporter.icon || '🎁';
  };

  // Get appropriate display text
  const getDisplayText = () => {
    if (isBadge) return `Achieved ${supporter.giftType || 'Badge'}`;
    if (isSupporter) return `Top Supporter • Rank ${supporter.rank}`;
    return `Sent ${supporter.giftType || 'Gift'}`;
  };

  // Get appropriate amount text
  const getAmountText = () => {
    if (isSupporter) return `B$ ${supporter.totalSupport || 0}`;
    return supporter.amount || '0';
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1f1f1f',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: '#9ca3af',
              '&:hover': {
                color: '#ffffff',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ pt: 3 }}>
          {/* Supporter Info Card */}
          <Box
            sx={{
              backgroundColor: '#2d2d2d',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  fontSize: '28px',
                  backgroundColor: '#1f1f1f',
                }}
              >
                {getAvatarIcon()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {supporter.username || 'Anonymous'}
                </Typography>
                <Typography
                  sx={{
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}
                >
                  {getDisplayText()}
                  {isSupporter && supporter.giftsSent && ` • ${supporter.giftsSent} gift${supporter.giftsSent !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: '#2563eb',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                {getAmountText()}
              </Typography>
            </Box>
          </Box>

          {/* Message Input */}
          <Typography
            sx={{
              color: '#e5e7eb',
              fontSize: '14px',
              mb: 2,
              fontWeight: 500,
            }}
          >
            {isBadge ? 'Celebration Message' : 'Thank You Message'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
              },
              '& .MuiOutlinedInput-input': {
                '&::placeholder': {
                  color: '#6b7280',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Character count */}
          <Typography
            sx={{
              color: '#6b7280',
              fontSize: '12px',
              mt: 1,
              textAlign: 'right',
            }}
          >
            {message.length} / 500 characters
          </Typography>

          {/* Tips */}
          <Box
            sx={{
              backgroundColor: '#2d2d2d',
              borderRadius: '8px',
              p: 2,
              mt: 3,
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <Typography
              sx={{
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: 600,
                mb: 1,
              }}
            >
              💡 {isBadge ? 'Celebration Tips:' : 'Tips for a great thank you:'}
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              {isBadge
                ? '• Share your excitement about this achievement\n• Mention what this badge means to you\n• Express gratitude to your supporters'
                : '• Be genuine and personal\n• Mention what their support means to you\n• Let them know how you\'ll use their contribution'}
            </Typography>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            p: 3,
            gap: 2,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: '#9ca3af',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#374151',
                color: '#6b7280',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              `${isBadge ? 'Celebrate 🎉' : 'Send Thank You 💝'}`
            )}
          </Button>
        </DialogActions>
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