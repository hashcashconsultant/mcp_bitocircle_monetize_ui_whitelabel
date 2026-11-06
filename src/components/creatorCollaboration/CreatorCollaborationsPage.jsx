'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PublicIcon from '@mui/icons-material/Public';
import MovieIcon from '@mui/icons-material/Movie';
import SendIcon from '@mui/icons-material/Send';

export default function CreatorCollaborationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [compensationFilter, setCompensationFilter] = useState('all');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  // Offers data
  const offers = [
    {
      id: 1,
      name: 'PayBito Wallet',
      initials: 'PB',
      avatarColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      verified: true,
      category: 'Finance App',
      price: '750',
      priceType: 'USDT',
      badge: 'NEW',
      badgeColor: '#ef4444',
      paymentType: 'Performance-based',
      deliverables: '1 Reel, 1 Post, 1 Story',
      target: '100K Views in 7 Days',
      timeline: 'Mar 2–Mar 9, 2025',
      rights: 'Non-exclusive (30-day)',
      tags: [
        { label: 'Escrow Protected', icon: LockIcon, color: '#22c55e' },
        { label: 'High Engagement Audience', icon: TrendingUpIcon, color: '#a855f7' },
      ],
    },
    {
      id: 2,
      name: 'CryptoTrade Pro',
      initials: 'CT',
      avatarColor: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      verified: true,
      category: 'Trading Platform',
      price: '1,200',
      priceType: 'USDT',
      badge: 'INVITE ONLY',
      badgeColor: '#8b5cf6',
      paymentType: 'Fixed + Bonus',
      deliverables: '2 Reels, 3 Posts',
      target: '250K Total Reach',
      timeline: 'Mar 5–Mar 20, 2025',
      rights: 'Exclusive (60-day)',
      tags: [
        { label: 'Escrow Protected', icon: LockIcon, color: '#22c55e' },
        { label: 'Premium Brand', icon: StarIcon, color: '#f59e0b' },
      ],
    },
    {
      id: 3,
      name: 'MetaVerse NFT',
      initials: '🎨',
      avatarColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      verified: true,
      category: 'NFTs',
      price: '2,500',
      priceType: 'USDT',
      badge: 'HIGH REWARD',
      badgeColor: '#22c55e',
      paymentType: 'Performance-based',
      deliverables: '3 Reels, 2 Live Streams',
      target: '500K Views + 50 Sales',
      timeline: 'Mar 10–Apr 10, 2025',
      rights: 'Non-exclusive',
      tags: [
        { label: 'Escrow Protected', icon: LockIcon, color: '#22c55e' },
        { label: 'Trending Project', icon: TrendingUpIcon, color: '#ec4899' },
      ],
    },
  ];

  // Active Deals data
  const activeDeals = [
    {
      id: 1,
      name: 'PayBito Wallet',
      initials: 'PB',
      avatarColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      status: 'In Progress',
      statusColor: '#3b82f6',
      potentialPayout: '750 USDT',
      payoutLabel: 'Potential Payout',
      escrowEnabled: true,
      deliverables: [
        { name: 'Reel', status: 'Uploaded • Under Review', statusColor: '#22c55e', completed: true },
        { name: 'Post', status: 'Pending Upload', statusColor: '#f59e0b', completed: false, pending: true },
        { name: 'Story', status: 'Not Started', statusColor: '#6b7280', completed: false },
      ],
      performance: {
        current: 52000,
        target: 100000,
        percentage: 52,
        daysRemaining: 5,
      },
    },
    {
      id: 2,
      name: 'CryptoTrade Pro',
      initials: 'CT',
      avatarColor: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      status: 'Verification Pending',
      statusColor: '#3b82f6',
      potentialPayout: '1,200 USDT',
      payoutLabel: 'Payout Ready',
      payoutStatus: 'Processing',
      campaignCompleted: true,
    },
  ];

  // Completed Deals data
  const completedDeals = [
    {
      id: 1,
      name: 'DeFi Protocol Launch',
      completedDate: 'Feb 15, 2025',
      earned: '850 USDT',
      views: '156K',
      engagement: '5.2%',
      rating: 5,
    },
  ];

  // Performance Stats
  const performanceStats = [
    {
      label: 'Total Collaboration Earnings',
      value: '$18,500',
      change: '+45% vs last month',
      changeColor: '#22c55e',
    },
    {
      label: 'Average CPM',
      value: '$15.25',
      change: '+12% vs industry avg',
      changeColor: '#22c55e',
    },
    {
      label: 'Avg Engagement Rate',
      value: '4.8%',
      change: 'Excellent',
      changeColor: '#22c55e',
    },
    {
      label: 'Campaigns Completed',
      value: '42',
      change: 'This year',
      changeColor: '#9ca3af',
    },
  ];

  // Top Performing Campaigns
  const topCampaigns = [
    { name: 'MetaVerse NFT Launch', views: '850K views', engagement: '6.2% engagement', earned: '$3,500', medal: '🥇' },
    { name: 'CryptoTrade Pro', views: '620K views', engagement: '5.8% engagement', earned: '$2,800', medal: '🥈' },
    { name: 'PayBito Exchange', views: '480K views', engagement: '5.2% engagement', earned: '$2,200', medal: '🥉' },
  ];

  // AI Insights
  const aiInsights = [
    {
      icon: LightbulbIcon,
      iconColor: '#f59e0b',
      title: 'Brands in DeFi category yield 30% higher CPM for your audience',
      subtitle: 'Consider applying to more DeFi-related campaigns',
    },
    {
      icon: PublicIcon,
      iconColor: '#22c55e',
      title: "You're trending in Singapore — apply to more Asia-based campaigns",
      subtitle: 'Your engagement rate is 2x higher in Southeast Asia',
    },
    {
      icon: MovieIcon,
      iconColor: '#ec4899',
      title: 'Your Reels perform 40% better than static posts',
      subtitle: 'Focus on video content for higher payouts',
    },
  ];

  // Messages data
  const conversations = [
    {
      id: 1,
      name: 'PayBito Wallet',
      lastMessage: 'Great work on the reel! The engagement...',
      time: '2 min ago',
      isNew: true,
      subject: 'Re: Campaign Update',
      campaign: 'Wallet Launch',
      status: 'Active Deal',
    },
    {
      id: 2,
      name: 'CryptoTrade Pro',
      lastMessage: 'Payment has been processed!',
      time: '1 hour ago',
      isNew: false,
      subject: 'Re: Payout Confirmation',
    },
    {
      id: 3,
      name: 'MetaVerse NFT',
      lastMessage: 'Can we schedule the live stream for...',
      time: 'Yesterday',
      isNew: false,
      subject: 'Re: Live Stream Schedule',
    },
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'brand',
      senderName: 'PayBito Team',
      avatar: 'PB',
      message: "Great work on the reel! The engagement is looking fantastic. We're seeing strong initial metrics.",
      time: '2 min ago',
    },
    {
      id: 2,
      sender: 'user',
      message: "Thanks! I'll be uploading the post later today. Should have everything completed by tomorrow.",
      time: '5 min ago',
    },
  ];

  const tabLabels = [
    { label: 'Offers', badge: '12 New', badgeColor: '#22c55e' },
    { label: 'Active Deals', badge: '3', badgeColor: '#6b7280' },
    { label: 'Completed', badge: null },
    { label: 'Performance', badge: null },
    { label: 'Messages', badge: '2', badgeColor: '#ef4444' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: 700,
            mb: 1,
          }}
        >
          Brand Collabs Marketplace
        </Typography>
        <Typography
          sx={{
            color: '#9ca3af',
            fontSize: '15px',
          }}
        >
          Find paid partnership offers from verified crypto brands and businesses.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563eb',
              height: 3,
            },
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
          }}
        >
          {tabLabels.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Box
                      sx={{
                        backgroundColor: tab.badgeColor,
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        px: 1,
                        py: 0.25,
                        borderRadius: '10px',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {tab.badge}
                    </Box>
                  )}
                </Box>
              }
              sx={{
                color: activeTab === index ? '#ffffff' : '#9ca3af',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                minHeight: 'auto',
                backgroundColor: activeTab === index ? '#2563eb' : 'transparent',
                borderRadius: '8px',
                '&.Mui-selected': {
                  color: '#ffffff',
                },
                '&:hover': {
                  backgroundColor: activeTab === index ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Offers Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', mb: 1 }}>
                CATEGORY
              </Typography>
              <Select
                fullWidth
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#9ca3af',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#1f1f1f',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                        '&.Mui-selected': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="finance">Finance App</MenuItem>
                <MenuItem value="trading">Trading Platform</MenuItem>
                <MenuItem value="nft">NFTs</MenuItem>
                <MenuItem value="defi">DeFi</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', mb: 1 }}>
                COMPENSATION TYPE
              </Typography>
              <Select
                fullWidth
                value={compensationFilter}
                onChange={(e) => setCompensationFilter(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#9ca3af',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#1f1f1f',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                        '&.Mui-selected': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="performance">Performance-based</MenuItem>
                <MenuItem value="hybrid">Fixed + Bonus</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', mb: 1 }}>
                PAYMENT TOKEN
              </Typography>
              <Select
                fullWidth
                value={tokenFilter}
                onChange={(e) => setTokenFilter(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#9ca3af',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#1f1f1f',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                        '&.Mui-selected': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Tokens</MenuItem>
                <MenuItem value="usdt">USDT</MenuItem>
                <MenuItem value="usdc">USDC</MenuItem>
                <MenuItem value="btc">BTC</MenuItem>
                <MenuItem value="eth">ETH</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', mb: 1 }}>
                SORT BY
              </Typography>
              <Select
                fullWidth
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#9ca3af',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#1f1f1f',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                        '&.Mui-selected': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="highest">Highest Paying</MenuItem>
                <MenuItem value="deadline">Deadline Soon</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Offer Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {offers.map((offer) => (
              <Card
                key={offer.id}
                sx={{
                  backgroundColor: '#262626',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  p: 3,
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: offer.avatarColor,
                        fontSize: offer.initials.length > 2 ? '24px' : '20px',
                        fontWeight: 700,
                      }}
                    >
                      {offer.initials}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: 700,
                          }}
                        >
                          {offer.name}
                        </Typography>
                        {offer.verified && (
                          <VerifiedIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          color: '#9ca3af',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        📁 Category: {offer.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                      <Typography
                        sx={{
                          color: '#22c55e',
                          fontSize: '28px',
                          fontWeight: 700,
                        }}
                      >
                        {offer.price} {offer.priceType}
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: offer.badgeColor,
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          px: 1,
                          py: 0.25,
                          borderRadius: '4px',
                        }}
                      >
                        {offer.badge}
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        fontSize: '13px',
                      }}
                    >
                      {offer.paymentType}
                    </Typography>
                  </Box>
                </Box>

                {/* Details Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 2,
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    p: 2.5,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>Deliverables</Typography>
                    <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                      {offer.deliverables}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>Target</Typography>
                    <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                      {offer.target}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>Timeline</Typography>
                    <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                      {offer.timeline}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>Rights</Typography>
                    <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                      {offer.rights}
                    </Typography>
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                  {offer.tags.map((tag, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        backgroundColor: 'transparent',
                        border: `1px solid ${tag.color}40`,
                        borderRadius: '20px',
                        px: 1.5,
                        py: 0.5,
                      }}
                    >
                      <tag.icon sx={{ fontSize: 16, color: tag.color }} />
                      <Typography sx={{ color: tag.color, fontSize: '13px', fontWeight: 600 }}>
                        {tag.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    sx={{
                      flex: 1,
                      backgroundColor: '#1f1f1f',
                      color: '#ffffff',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    sx={{
                      flex: 1,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    }}
                  >
                    Apply Now
                  </Button>
                  <Button
                    sx={{
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      textTransform: 'none',
                      py: 1.5,
                      px: 3,
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Decline
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Active Deals Tab */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {activeDeals.map((deal) => (
            <Card
              key={deal.id}
              sx={{
                backgroundColor: '#262626',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                p: 3,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: deal.avatarColor,
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {deal.initials}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      {deal.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: `${deal.statusColor}20`,
                        color: deal.statusColor,
                        fontSize: '13px',
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          backgroundColor: deal.statusColor,
                          borderRadius: '50%',
                        }}
                      />
                      {deal.status}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>
                    {deal.payoutLabel}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#22c55e',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {deal.potentialPayout}
                  </Typography>
                  {deal.escrowEnabled && (
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>
                      Escrow Enabled
                    </Typography>
                  )}
                  {deal.payoutStatus && (
                    <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>
                      {deal.payoutStatus}
                    </Typography>
                  )}
                </Box>
              </Box>

              {deal.campaignCompleted ? (
                <Box
                  sx={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '32px', mb: 1 }}>🎉</Typography>
                  <Typography
                    sx={{
                      color: '#22c55e',
                      fontSize: '20px',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Campaign Completed!
                  </Typography>
                  <Typography sx={{ color: '#9ca3af', fontSize: '14px', mb: 0.5 }}>
                    All deliverables uploaded. Performance targets met.
                  </Typography>
                  <Typography sx={{ color: '#9ca3af', fontSize: '14px' }}>
                    Payout will be released within 24 hours
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Deliverables Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      Deliverables Progress
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {deal.deliverables?.map((deliverable, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: deliverable.completed ? '#22c55e' : deliverable.pending ? '#f59e0b' : '#3a3a3a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {deliverable.completed && (
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                              )}
                              {deliverable.pending && (
                                <Box sx={{ width: 8, height: 8, backgroundColor: '#ffffff', borderRadius: '50%' }} />
                              )}
                            </Box>
                            <Typography sx={{ color: '#ffffff', fontSize: '15px' }}>
                              {deliverable.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              color: deliverable.statusColor,
                              fontSize: '13px',
                              fontWeight: 500,
                            }}
                          >
                            {deliverable.status}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Performance */}
                  {deal.performance && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        Performance
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box />
                          <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                            {deal.performance.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={deal.performance.percentage}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#1f1f1f',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#2563eb',
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#ffffff', fontSize: '14px' }}>
                          {deal.performance.current.toLocaleString()} / {deal.performance.target.toLocaleString()} Views
                        </Typography>
                        <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                          {deal.performance.daysRemaining} days remaining
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      sx={{
                        flex: 1,
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {
                          backgroundColor: '#16a34a',
                        },
                      }}
                    >
                      Upload Deliverable
                    </Button>
                    <Button
                      sx={{
                        flex: 1,
                        backgroundColor: '#1f1f1f',
                        color: '#ffffff',
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {
                          backgroundColor: '#2a2a2a',
                        },
                      }}
                    >
                      Message Brand
                    </Button>
                    <Button
                      sx={{
                        backgroundColor: 'transparent',
                        color: '#9ca3af',
                        textTransform: 'none',
                        py: 1.5,
                        px: 3,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '15px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      View Contract
                    </Button>
                  </Box>
                </>
              )}
            </Card>
          ))}
        </Box>
      )}

      {/* Completed Tab */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {completedDeals.map((deal) => (
            <Card
              key={deal.id}
              sx={{
                backgroundColor: '#262626',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                p: 3,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      {deal.name}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                      Completed {deal.completedDate}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 0.5 }}>
                    Earned
                  </Typography>
                  <Typography
                    sx={{
                      color: '#22c55e',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {deal.earned}
                  </Typography>
                </Box>
              </Box>

              {/* Stats */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    p: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: '28px',
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {deal.views}
                  </Typography>
                  <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                    Views
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    p: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: '28px',
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {deal.engagement}
                  </Typography>
                  <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                    Engagement
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    p: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25, mb: 0.5 }}>
                    {[...Array(deal.rating)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#f59e0b', fontSize: 24 }} />
                    ))}
                  </Box>
                  <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                    Brand Rating
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <Button
                  sx={{
                    backgroundColor: '#1f1f1f',
                    color: '#ffffff',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                    },
                  }}
                >
                  Leave Brand Review
                </Button>
                <Button
                  sx={{
                    backgroundColor: '#1f1f1f',
                    color: '#ffffff',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                    },
                  }}
                >
                  Download Invoice
                </Button>
                <Button
                  sx={{
                    backgroundColor: '#1f1f1f',
                    color: '#ffffff',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                    },
                  }}
                >
                  View Certificate
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Performance Tab */}
      {activeTab === 3 && (
        <Box>
          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2.5,
              mb: 3,
            }}
          >
            {performanceStats.slice(0, 3).map((stat, index) => (
              <Card
                key={index}
                sx={{
                  backgroundColor: '#262626',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    color: '#9ca3af',
                    fontSize: '13px',
                    mb: 2,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: '36px',
                    fontWeight: 700,
                    mb: 1,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    color: stat.changeColor,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {stat.change}
                </Typography>
              </Card>
            ))}
          </Box>

          {/* Campaigns Completed Card */}
          <Card
            sx={{
              backgroundColor: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              maxWidth: '350px',
            }}
          >
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '13px',
                mb: 2,
              }}
            >
              {performanceStats[3].label}
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '48px',
                fontWeight: 700,
                mb: 1,
                lineHeight: 1,
              }}
            >
              {performanceStats[3].value}
            </Typography>
            <Typography
              sx={{
                color: performanceStats[3].changeColor,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {performanceStats[3].change}
            </Typography>
          </Card>

          {/* Top 5 Performing Campaigns */}
          <Card
            sx={{
              backgroundColor: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              p: 3,
              mb: 3,
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
              Top 5 Performing Campaigns
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topCampaigns.map((campaign, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '24px' }}>{campaign.medal}</Typography>
                    <Box>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: 600,
                          mb: 0.25,
                        }}
                      >
                        {campaign.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#9ca3af',
                          fontSize: '13px',
                        }}
                      >
                        {campaign.views} • {campaign.engagement}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: '#22c55e',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {campaign.earned}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* AI Insights */}
          <Card
            sx={{
              backgroundColor: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AutoAwesomeIcon sx={{ color: '#a855f7', fontSize: 24 }} />
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                AI Insights
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aiInsights.map((insight, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <insight.icon sx={{ color: insight.iconColor, fontSize: 24, mt: 0.25 }} />
                  <Box>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {insight.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        fontSize: '13px',
                      }}
                    >
                      {insight.subtitle}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* Messages Tab */}
      {activeTab === 4 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '380px 1fr' },
            gap: 3,
            height: 'calc(100vh - 280px)',
            minHeight: '500px',
          }}
        >
          {/* Conversations List */}
          <Card
            sx={{
              backgroundColor: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                Brand Conversations
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {conversations.map((conversation, index) => (
                <Box
                  key={conversation.id}
                  onClick={() => setSelectedConversation(index)}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    backgroundColor: selectedConversation === index ? '#1f1f1f' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#1f1f1f',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: 600,
                        }}
                      >
                        {conversation.name}
                      </Typography>
                      {conversation.isNew && (
                        <Box
                          sx={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 700,
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '4px',
                          }}
                        >
                          New
                        </Box>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        fontSize: '12px',
                      }}
                    >
                      {conversation.time}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      color: '#9ca3af',
                      fontSize: '13px',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conversation.lastMessage}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#6b7280',
                      fontSize: '12px',
                    }}
                  >
                    {conversation.subject}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Chat View */}
          <Card
            sx={{
              backgroundColor: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 700,
                    mb: 0.25,
                  }}
                >
                  {conversations[selectedConversation].name}
                </Typography>
                <Typography
                  sx={{
                    color: '#9ca3af',
                    fontSize: '13px',
                  }}
                >
                  Campaign: {conversations[selectedConversation].campaign || 'General'} • {conversations[selectedConversation].status || 'Conversation'}
                </Typography>
              </Box>
              <Button
                sx={{
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                  },
                }}
              >
                View Deal Terms
              </Button>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, p: 2.5, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    gap: 1.5,
                    alignItems: 'flex-start',
                  }}
                >
                  {message.sender === 'brand' && (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#3b82f6',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      {message.avatar}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '70%',
                    }}
                  >
                    {message.sender === 'brand' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          sx={{
                            color: '#9ca3af',
                            fontSize: '12px',
                          }}
                        >
                          {message.senderName} • {message.time}
                        </Typography>
                      </Box>
                    )}
                    {message.sender === 'user' && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          sx={{
                            color: '#9ca3af',
                            fontSize: '12px',
                          }}
                        >
                          You • {message.time}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        backgroundColor: message.sender === 'user' ? '#2563eb' : '#1f1f1f',
                        borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        px: 2.5,
                        py: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '14px',
                          lineHeight: 1.5,
                        }}
                      >
                        {message.message}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1f1f1f',
                    color: '#ffffff',
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
                  '& .MuiInputBase-input::placeholder': {
                    color: '#6b7280',
                  },
                }}
              />
              <Button
                sx={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  textTransform: 'none',
                  px: 3,
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '15px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
              >
                Send
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}