'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    ButtonGroup,
    Avatar,
    CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MovieIcon from '@mui/icons-material/Movie';
import FeedIcon from '@mui/icons-material/Feed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideocamIcon from '@mui/icons-material/Videocam';
import dayjs from 'dayjs';
import apiClient from '../utils/apiClient';
import CustomSnackbar from '../utils/CustomSnackbar';
import WHITELABEL from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/ad-revenue';

export default function AdRevenuePage() {
    const [timePeriod, setTimePeriod] = useState('7D');
    const [isLoading, setLoading] = useState(false);
    const [transactionsLimit, setTransactionsLimit] = useState(10);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // State for API data
    const [stats, setStats] = useState([
        { label: "TODAY'S EARNINGS", amount: 'B$ 0', change: '↑ 0%', trend: 'up' },
        { label: 'THIS WEEK', amount: 'B$ 0', change: '↑ 0%', trend: 'up' },
        { label: 'THIS MONTH', amount: 'B$ 0', change: '↑ 0%', trend: 'up' },
        { label: 'LIFETIME EARNINGS', amount: 'B$ 0', badge: 'All Time' },
    ]);

    const [revenueOverviewData, setRevenueOverviewData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [formatEarnings, setFormatEarnings] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState([
        { value: 'B$ 0', label: 'CURRENT CPM', sublabel: 'LIVE' },
        { value: '0', label: 'TOTAL IMPRESSIONS' },
        { value: '0%', label: 'CTR' },
        { value: '0%', label: 'FILL RATE' },
    ]);

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

    // Get creator ID from localStorage
    const getCreatorId = () => {
        const creatorId = localStorage.getItem('childUserId');
        if (!creatorId) {
            showSnackbar(`Creator ID not found. Please go back to ${WHITELABEL.brandName}`, 'warning');
            return null;
        }
        return creatorId;
    };

    // Fetch dashboard stats - Updated to use /getEarningSummary/{userId} endpoint
    const fetchDashboardStats = async () => {
        const creatorId = getCreatorId();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(`${API_BASE_URL}/getEarningSummary/${creatorId}`);

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to fetch earnings summary', 'error');
                return;
            }

            const data = response.data.data;
            console.log('Earnings Summary:', data);

            // Update stats with API data - using correct field names from new API
            setStats([
                {
                    label: "TODAY'S EARNINGS",
                    amount: `B$ ${data.todayEarnings || 0}`,
                    change: `${data.todayGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.todayGrowth || 0)}%`,
                    trend: data.todayGrowth >= 0 ? 'up' : 'down',
                },
                {
                    label: 'THIS WEEK',
                    amount: `B$ ${data.weekEarnings || 0}`,
                    change: `${data.weekGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.weekGrowth || 0)}%`,
                    trend: data.weekGrowth >= 0 ? 'up' : 'down',
                },
                {
                    label: 'THIS MONTH',
                    amount: `B$ ${data.monthEarnings || 0}`,
                    change: `${data.monthGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.monthGrowth || 0)}%`,
                    trend: data.monthGrowth >= 0 ? 'up' : 'down',
                },
                {
                    label: 'LIFETIME EARNINGS',
                    amount: `B$ ${data.lifetimeEarnings || 0}`,
                    badge: 'All Time',
                },
            ]);
        } catch (error) {
            console.error('Error fetching earnings summary:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load earnings summary.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch revenue overview - Updated to use new API endpoint
    const fetchRevenueOverview = async (period) => {
        const creatorId = getCreatorId();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/getRevenueChart/${creatorId}`,
                {
                    params: {
                        timeFilter: period,
                    },
                }
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message, 'error');
                setRevenueOverviewData([]);
                return;
            }

            console.log('Revenue Chart:', response.data.data);

            // Map the new API response to the chart format
            const chartData = (response.data.data || []).map(item => ({
                date: item.revenueDate,
                revenue: item.revenueAmount || 0,
                label: item.dateLabel,
            }));

            setRevenueOverviewData(chartData);
        } catch (error) {
            console.error('Error fetching revenue chart:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load revenue chart.',
                'error'
            );
            setRevenueOverviewData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch recent transactions - Updated to use new API endpoint
    const fetchRecentTransactions = async (limit = transactionsLimit) => {
        const creatorId = getCreatorId();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/getRecentTransactions/${creatorId}`,
                {
                    params: {
                        limit: limit,
                    },
                }
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message, 'error');
                return;
            }

            console.log('Recent Transactions:', response.data.data);
            setRecentTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load transactions.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch earnings by format - Updated to use /getEarningsByFormat/{userId} endpoint
    const fetchEarningsByFormat = async () => {
        const creatorId = getCreatorId();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(`${API_BASE_URL}/getEarningsByFormat/${creatorId}`);

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to fetch format earnings', 'error');
                return;
            }

            console.log('Earnings by Format:', response.data.data);

            // Map API data to UI format
            const formattedData = response.data.data.map((item, index) => ({
                id: index,
                icon: getFormatIconByContentType(item.contentType),
                iconBg: getFormatColorByContentType(item.contentType),
                name: item.contentType,
                amount: `B$ ${item.revenue || 0}`,
                impressions: `${formatNumber(item.impressions || 0)} impressions`,
                cpm: `CPM B$${item.cpm || 0}`,
            }));

            setFormatEarnings(formattedData);
        } catch (error) {
            console.error('Error fetching earnings by format:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load format earnings.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch performance metrics - Updated to use /getPerformanceMetrics/{userId} endpoint
    const fetchPerformanceMetrics = async () => {
        const creatorId = getCreatorId();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(`${API_BASE_URL}/getPerformanceMetrics/${creatorId}`);

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to fetch performance metrics', 'error');
                return;
            }

            const data = response.data.data;
            console.log('Performance Metrics:', data);

            setPerformanceMetrics([
                { value: `B$ ${data.currentCpm || 0}`, label: 'CURRENT CPM', sublabel: 'LIVE' },
                { value: formatNumber(data.totalImpressions || 0), label: 'TOTAL IMPRESSIONS' },
                { value: `${data.vtr || 0}%`, label: 'CTR' },
                { value: `${data.fillRate || 0}%`, label: 'FILL RATE' },
            ]);
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load performance metrics.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get format icon by content type
    const getFormatIconByContentType = (contentType) => {
        const normalizedType = contentType.toLowerCase();

        if (normalizedType.includes('reel')) {
            return <MovieIcon sx={{ fontSize: 28, color: '#ffffff' }} />;
        } else if (normalizedType.includes('post') || normalizedType.includes('feed')) {
            return <FeedIcon sx={{ fontSize: 28, color: '#ffffff' }} />;
        } else if (normalizedType.includes('story') || normalizedType.includes('stories')) {
            return <AutoAwesomeIcon sx={{ fontSize: 28, color: '#ffffff' }} />;
        } else if (normalizedType.includes('live')) {
            return <VideocamIcon sx={{ fontSize: 28, color: '#ffffff' }} />;
        }
        return <FeedIcon sx={{ fontSize: 28, color: '#ffffff' }} />;
    };

    // Helper function to get format color by content type
    const getFormatColorByContentType = (contentType) => {
        const normalizedType = contentType.toLowerCase();

        if (normalizedType.includes('reel')) {
            return '#f97316';
        } else if (normalizedType.includes('post') || normalizedType.includes('feed')) {
            return '#3b82f6';
        } else if (normalizedType.includes('story') || normalizedType.includes('stories')) {
            return '#8b5cf6';
        } else if (normalizedType.includes('live')) {
            return '#ef4444';
        }
        return '#3b82f6';
    };

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Helper function to format time ago
    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return dayjs(date).format('MMM DD, YYYY');
    };

    // Helper function to get transaction display name
    const getTransactionDisplayName = (transactionType) => {
        const typeMap = {
            'AD_REVENUE': 'Ad Revenue',
            'REVENUE': 'Ad Revenue',
            'PAYOUT': 'Wallet Payout',
            'WITHDRAWAL': 'Withdrawal',
            'TRANSFER': 'Transfer',
        };
        return typeMap[transactionType] || transactionType;
    };

    // Helper function to determine if transaction is revenue type
    const isRevenueTransaction = (transactionType) => {
        return ['AD_REVENUE', 'REVENUE'].includes(transactionType);
    };

    // Get max value for chart scaling
    const getMaxChartValue = () => {
        if (revenueOverviewData.length === 0) return 100;
        const maxRevenue = Math.max(...revenueOverviewData.map((d) => d.revenue || 0));
        return maxRevenue === 0 ? 100 : maxRevenue;
    };

    // Handle load more transactions
    const handleLoadMore = () => {
        const newLimit = transactionsLimit + 10;
        setTransactionsLimit(newLimit);
        fetchRecentTransactions(newLimit);
    };

    // Load all data on component mount
    useEffect(() => {
        const loadAllData = async () => {
            await Promise.all([
                fetchDashboardStats(),
                fetchEarningsByFormat(),
                fetchPerformanceMetrics(),
                fetchRevenueOverview(timePeriod),
                fetchRecentTransactions(),
            ]);
        };
        loadAllData();
    }, []);

    // Reload revenue overview when time period changes
    useEffect(() => {
        fetchRevenueOverview(timePeriod);
    }, [timePeriod]);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Row 1: Stats Cards (4 in a row) */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                    gap: 2.5,
                    mb: 3,
                }}
            >
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        sx={{
                            backgroundColor: '#262626',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            p: 2.5,
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#9ca3af',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                mb: 1.5,
                            }}
                        >
                            {stat.label}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#ffffff',
                                fontSize: { xs: '24px', sm: '30px' },
                                fontWeight: 700,
                                mb: 0.5,
                                lineHeight: 1,
                            }}
                        >
                            {stat.amount}
                        </Typography>
                        {stat.change && (
                            <Typography
                                sx={{
                                    color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    mt: 1,
                                }}
                            >
                                {stat.change}
                            </Typography>
                        )}
                        {stat.badge && (
                            <Box
                                sx={{
                                    display: 'inline-block',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    mt: 1,
                                }}
                            >
                                {stat.badge}
                            </Box>
                        )}
                    </Card>
                ))}
            </Box>

            {/* Row 2: Revenue Overview + Recent Transactions (Side by Side) */}
            <Box sx={{ display: 'flex', gap: 2.5, mb: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                {/* Revenue Overview */}
                <Box sx={{ flex: 1 }}>
                    <Card
                        sx={{
                            backgroundColor: '#262626',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            p: { xs: 2, sm: 3 },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '16px', sm: '18px' },
                                    fontWeight: 700,
                                }}
                            >
                                Revenue Overview
                            </Typography>
                            <ButtonGroup sx={{ backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                                {['24H', '7D', '30D', '90D'].map((period, index) => (
                                    <Button
                                        key={period}
                                        onClick={() => setTimePeriod(period)}
                                        sx={{
                                            backgroundColor: timePeriod === period ? '#2563eb' : 'transparent',
                                            color: timePeriod === period ? '#ffffff' : '#9ca3af',
                                            textTransform: 'none',
                                            px: { xs: 1.5, sm: 2 },
                                            py: 0.75,
                                            fontSize: { xs: '12px', sm: '13px' },
                                            fontWeight: 600,
                                            border: 'none',
                                            borderRight: index !== 3 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                            '&:hover': {
                                                backgroundColor: timePeriod === period ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                                                border: 'none',
                                                borderRight: index !== 3 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                            },
                                        }}
                                    >
                                        {period}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>

                        {/* Bar Chart */}
                        {isLoading ? (
                            <Box sx={{
                                height: 280,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CircularProgress sx={{ color: '#2563eb' }} />
                            </Box>
                        ) : (
                            <Box sx={{
                                height: 280,
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: { xs: 0.5, sm: 1.5 },
                                px: 1,
                                overflowX: 'auto',
                                overflowY: 'visible',  // ✅ Add this to prevent clipping tooltips
                                pb: 2,
                                pt: 8,  // ✅ Add top padding for tooltip space
                                position: 'relative',  // ✅ Establish stacking context
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '3px',
                                },
                            }}>
                                {revenueOverviewData.length === 0 ? (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#6b7280',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '16px', color: '#9ca3af', mb: 1 }}>
                                            No revenue data available
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', px: 2 }}>
                                            Revenue will appear once you start earning from ads
                                        </Typography>
                                    </Box>
                                ) : (
                                    revenueOverviewData.map((data, index) => {
                                        const maxValue = getMaxChartValue();
                                        const heightPercent = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;

                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    flex: 1,
                                                    minWidth: { xs: '35px', sm: '50px' },
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    // ✅ Fixed hover selector
                                                    '&:hover > .revenue-tooltip': {
                                                        opacity: 1,
                                                        visibility: 'visible',
                                                        transform: 'translateX(-50%) translateY(0)',
                                                    },
                                                }}
                                            >
                                                {/* Tooltip - Overlay Style */}
                                                <Box
                                                    className="revenue-tooltip"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',  // ✅ Position at middle
                                                        left: '50%',  // ✅ Center horizontally on bar
                                                        transform: 'translate(-50%, -50%)',  // ✅ Center both ways
                                                        backgroundColor: 'rgba(31, 31, 31, 0.95)',  // ✅ Slightly transparent
                                                        border: '1px solid #2563eb',
                                                        borderRadius: '8px',
                                                        p: 1.5,
                                                        opacity: 0,
                                                        visibility: 'hidden',
                                                        transition: 'all 0.2s ease-in-out',
                                                        whiteSpace: 'nowrap',
                                                        zIndex: 1000,
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <Typography sx={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, mb: 0.5 }}>
                                                        {data.label || dayjs(data.date).format('MMM DD')}
                                                    </Typography>
                                                    <Typography sx={{ color: '#2563eb', fontSize: '13px', fontWeight: 600 }}>
                                                        B$ {data.revenue || 0}
                                                    </Typography>
                                                </Box>

                                                {/* Bar */}
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: `${Math.max(heightPercent * 2.3, 0)}px`,
                                                        minHeight: data.revenue > 0 ? '8px' : '4px',
                                                        backgroundColor: data.revenue > 0 ? '#2563eb' : 'rgba(37, 99, 235, 0.3)',
                                                        borderRadius: '6px 6px 0 0',
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            backgroundColor: data.revenue > 0 ? '#1d4ed8' : 'rgba(37, 99, 235, 0.5)',
                                                        },
                                                    }}
                                                />

                                                {/* Date Label */}
                                                <Typography
                                                    sx={{
                                                        color: '#6b7280',
                                                        fontSize: { xs: '9px', sm: '10px' },
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        mt: 0.5,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {(() => {
                                                        if (timePeriod === '24H') {
                                                            return data.label || dayjs(data.date).format('h A');
                                                        } else if (timePeriod === '7D') {
                                                            return data.label || dayjs(data.date).format('ddd');
                                                        } else if (timePeriod === '30D') {
                                                            return data.label || dayjs(data.date).format('DD');
                                                        } else if (timePeriod === '90D') {
                                                            return data.label || dayjs(data.date).format('MMM D');
                                                        }
                                                        return data.label || dayjs(data.date).format('DD');
                                                    })()}
                                                </Typography>
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>
                        )}
                    </Card>
                </Box>

                {/* Recent Transactions */}
                <Box sx={{ width: { xs: '100%', lg: '380px' } }}>
                    <Card
                        sx={{
                            backgroundColor: '#262626',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            p: { xs: 2, sm: 3 },
                            height: '100%',
                            maxHeight: { xs: 'none', lg: '470px' },
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#ffffff',
                                fontSize: { xs: '16px', sm: '18px' },
                                fontWeight: 700,
                                mb: 2.5,
                            }}
                        >
                            Recent Transactions
                        </Typography>

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#2563eb' }} />
                            </Box>
                        ) : recentTransactions.length === 0 ? (
                            <Typography
                                sx={{
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    fontStyle: 'italic',
                                    textAlign: 'center',
                                    py: 3,
                                }}
                            >
                                No transactions yet
                            </Typography>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        mb: 2,
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: 'transparent',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '3px',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {recentTransactions.map((transaction, index) => {
                                            const isRevenue = isRevenueTransaction(transaction.transactionType);

                                            return (
                                                <Box
                                                    key={transaction.transactionId || index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        p: 2,
                                                        backgroundColor: '#1f1f1f',
                                                        borderRadius: '10px',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#2a2a2a',
                                                        },
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 38,
                                                            height: 38,
                                                            backgroundColor: isRevenue
                                                                ? 'rgba(16, 185, 129, 0.15)'
                                                                : 'rgba(239, 68, 68, 0.15)',
                                                        }}
                                                    >
                                                        {isRevenue ? (
                                                            <TrendingUpIcon sx={{ color: '#10b981', fontSize: '20px' }} />
                                                        ) : (
                                                            <TrendingDownIcon sx={{ color: '#ef4444', fontSize: '20px' }} />
                                                        )}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            sx={{
                                                                color: '#ffffff',
                                                                fontSize: '14px',
                                                                fontWeight: 600,
                                                                mb: 0.25,
                                                            }}
                                                        >
                                                            {getTransactionDisplayName(transaction.transactionType)}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                color: '#6b7280',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            {formatTimeAgo(transaction.transactionDate)}
                                                        </Typography>
                                                        {transaction.description && (
                                                            <Typography
                                                                sx={{
                                                                    color: '#6b7280',
                                                                    fontSize: '11px',
                                                                    mt: 0.5,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {transaction.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography
                                                            sx={{
                                                                color: isRevenue ? '#10b981' : '#ef4444',
                                                                fontSize: '15px',
                                                                fontWeight: 700,
                                                                mb: 0.25,
                                                            }}
                                                        >
                                                            {isRevenue ? '+' : '-'}B$ {transaction.amount || 0}
                                                        </Typography>
                                                        {transaction.status && (
                                                            <Typography
                                                                sx={{
                                                                    color: transaction.status === 'COMPLETED' ? '#10b981' : '#6b7280',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase',
                                                                }}
                                                            >
                                                                {transaction.status}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>

                                {/* Load More Button */}
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    sx={{
                                        backgroundColor: '#1f1f1f',
                                        color: '#2563eb',
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        py: 1,
                                        borderRadius: '8px',
                                        border: '1px solid rgba(37, 99, 235, 0.3)',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a',
                                            border: '1px solid rgba(37, 99, 235, 0.5)',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#1a1a1a',
                                            color: '#6b7280',
                                        },
                                    }}
                                >
                                    {isLoading ? 'Loading...' : 'Load More'}
                                </Button>
                            </>
                        )}
                    </Card>
                </Box>
            </Box>

            {/* Row 3: Earnings by Format */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: { xs: '16px', sm: '18px' },
                        fontWeight: 700,
                        mb: 2.5,
                    }}
                >
                    Earnings by Format
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#2563eb' }} />
                    </Box>
                ) : formatEarnings.length === 0 ? (
                    <Card
                        sx={{
                            backgroundColor: '#262626',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            p: 3,
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#6b7280',
                                fontSize: '14px',
                                fontStyle: 'italic',
                                textAlign: 'center',
                            }}
                        >
                            No earnings data available yet
                        </Typography>
                    </Card>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {formatEarnings.map((format) => (
                            <Card
                                key={format.id}
                                sx={{
                                    backgroundColor: '#262626',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                    gap: 2,
                                    '&:hover': {
                                        backgroundColor: '#2d2d2d',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            backgroundColor: format.iconBg,
                                        }}
                                    >
                                        {format.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            sx={{
                                                color: '#ffffff',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                mb: 0.5,
                                            }}
                                        >
                                            {format.name}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: '#6b7280',
                                                fontSize: '13px',
                                            }}
                                        >
                                            {format.impressions}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography
                                        sx={{
                                            color: '#ffffff',
                                            fontSize: '22px',
                                            fontWeight: 700,
                                            mb: 0.5,
                                        }}
                                    >
                                        {format.amount}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: '#6b7280',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {format.cpm}
                                    </Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Row 4: Performance Metrics */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: { xs: 2.5, sm: 3.5 },
                }}
            >
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: { xs: '16px', sm: '18px' },
                        fontWeight: 700,
                        mb: { xs: 3, sm: 4 },
                    }}
                >
                    Performance Metrics
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#2563eb' }} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 3,
                        }}
                    >
                        {performanceMetrics.map((metric, index) => (
                            <Box key={index} sx={{ textAlign: 'center' }}>
                                <Typography
                                    sx={{
                                        color: '#ffffff',
                                        fontSize: { xs: '28px', sm: '34px' },
                                        fontWeight: 700,
                                        mb: 1,
                                        lineHeight: 1,
                                    }}
                                >
                                    {metric.value}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        flexDirection: 'column',
                                    }}
                                >
                                    {metric.sublabel && (
                                        <Box
                                            sx={{
                                                backgroundColor: '#2563eb',
                                                color: '#ffffff',
                                                px: 1.5,
                                                py: 0.25,
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                mb: 0.5,
                                            }}
                                        >
                                            {metric.sublabel}
                                        </Box>
                                    )}
                                    <Typography
                                        sx={{
                                            color: '#6b7280',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        {metric.label}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Card>

            <CustomSnackbar
                open={snackbar.open}
                onClose={handleCloseSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
}