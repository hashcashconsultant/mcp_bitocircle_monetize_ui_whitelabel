'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    LinearProgress,
    Tooltip
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import apiClient from '../utils/apiClient';
import CustomSnackbar from '../utils/CustomSnackbar';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/analytics';

// Update the formatCurrency function at the top:
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'B$ 0.00';

    const num = Number(value);
    if (!Number.isFinite(num) || num === 0) return 'B$ 0.00';

    // Handle scientific notation (like 8.96E-4 from your image)
    if (Math.abs(num) > 0 && Math.abs(num) < 0.00001) {
        return `B$ ${num.toExponential(8)}`;
    }

    // Handle very small numbers
    if (Math.abs(num) < 0.01) {
        return `B$ ${num.toFixed(8)}`;
    }

    return `B$ ${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    })}`;
};

// Helper to format percentage
const formatPercent = (val) => {
    if (!val && val !== 0) return '0%';
    return `${Number(val).toFixed(1)}%`;
};

// Helper to extract period days from selected period
const getDaysFromPeriod = (period) => {
    switch (period) {
        case 'Today': return '1D';
        case '7D': return '7D';
        case '30D': return '30D';
        case '3M': return '3M';
        case 'YTD': return '1Y';
        default: return '30D';
    }
};

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('30D');
    const [forecastFilter, setForecastFilter] = useState('THIS_MONTH');
    const [loading, setLoading] = useState(false);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // --- State for Data ---
    const [statsData, setStatsData] = useState([]);
    const [revenueBySource, setRevenueBySource] = useState([]);
    const [revenueBreakdown, setRevenueBreakdown] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [demographics, setDemographics] = useState({ avgAge: 0, topCountry: 'N/A', ageGroups: [] });
    const [topContent, setTopContent] = useState([]);
    const [funnelSteps, setFunnelSteps] = useState([]);
    const [revenueForecast, setRevenueForecast] = useState([]);
    const [revenueForecastSummary, setRevenueForecastSummary] = useState([]);

    const periodOptions = ['Today', '7D', '30D', '3M', 'YTD'];

    // Forecast filter options
    const forecastFilterOptions = [
        { value: 'THIS_MONTH', label: 'This Month' },
        { value: 'QTD', label: 'QTD' },
        { value: 'NEXT_QUARTER', label: 'Next Quarter' },
        { value: 'YTD', label: 'YTD' },
        { value: 'NEXT_YEAR', label: 'Next Year' },
    ];

    // --- Hardcoded Funnel Insights ---
    const funnelInsights = [
        {
            id: 1,
            icon: '🎯',
            title: 'Convert Gift-Givers to Subscribers',
            description: "780 gift-givers aren't subscribed. Target them with exclusive subscriber perks.",
            potential: '+B$ 3,900 MRR potential',
            potentialColor: '#22c55e',
        },
        {
            id: 2,
            icon: '🛍️',
            title: 'Bundle Merch with Subscriptions',
            description: "Only 12% of Superfan subscribers bought merch. Create exclusive drops.",
            potential: '+B$ 8,400 revenue',
            potentialColor: '#22c55e',
        },
        {
            id: 3,
            icon: '📋',
            title: 'Upgrade Starter Subscribers',
            description: "420 Starters engaged daily. Offer limited-time Insider upgrade discount.",
            potential: '+B$ 6,300 MRR',
            potentialColor: '#22c55e',
        },
    ];

    // --- Snackbar Helpers ---
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // --- Icon Mapping Helper ---
    const getSourceIcon = (sourceType) => {
        switch (sourceType) {
            case 'AD_REVENUE': return { icon: '📺', color: '#f59e0b' };
            case 'GIFTS_BADGES': return { icon: '🎁', color: '#ef4444' };
            case 'MERCHANDISE': return { icon: '🛍️', color: '#ec4899' };
            case 'SUBSCRIPTIONS': return { icon: '💎', color: '#3b82f6' };
            case 'COLLABORATIONS': return { icon: '🤝', color: '#8b5cf6' };
            default: return { icon: '💰', color: '#6b7280' };
        }
    };

    const getTrendIcon = (trend) => {
        if (trend === 'UP') return '↑';
        if (trend === 'DOWN') return '↓';
        return '';
    };

    const getTrendColor = (trend) => {
        if (trend === 'UP') return '#22c55e';
        if (trend === 'DOWN') return '#ef4444';
        return '#9ca3af';
    };

    const setDefaultEmptyData = () => {
        setStatsData([
            {
                id: 1,
                label: 'TOTAL REVENUE',
                value: 'B$ 0.00',
                change: '0% from last month',
                changeColor: '#9ca3af',
                icon: '💰',
                iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            },
            {
                id: 2,
                label: 'ACTIVE USERS',
                value: '0',
                change: '0%',
                changeColor: '#9ca3af',
                icon: '👥',
                iconBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            },
            {
                id: 3,
                label: 'AVG REVENUE',
                value: 'B$ 0.00',
                change: '0%',
                changeColor: '#9ca3af',
                icon: '📊',
                iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            {
                id: 4,
                label: 'GROWTH RATE',
                value: '0%',
                change: '0% MoM',
                changeColor: '#9ca3af',
                icon: '📈',
                iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
        ]);
        setRevenueBySource([]);
        setRevenueBreakdown([]);
        setHeatmap([]);
        setDemographics({
            avgAge: 0,
            topCountry: 'N/A',
            ageGroups: []
        });
        setTopContent([]);
        setFunnelSteps([]);
    };

    // --- Data Processing ---
    const processDashboardData = (data) => {
        const sum = data.summary || {};

        // 1. Stats Data
        setStatsData([
            {
                id: 1,
                label: 'TOTAL REVENUE',
                value: formatCurrency(sum.totalRevenue),
                change: `${getTrendIcon(sum.totalRevenueTrend)} ${Math.abs(sum.totalRevenueChange || 0)}% from last month`,
                changeColor: getTrendColor(sum.totalRevenueTrend),
                icon: '💰',
                iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            },
            {
                id: 2,
                label: 'ACTIVE USERS',
                value: (sum.activeUsers || 0).toLocaleString(),
                change: `${getTrendIcon(sum.activeUsersTrend)} ${Math.abs(sum.activeUsersChange || 0)}%`,
                changeColor: getTrendColor(sum.activeUsersTrend),
                icon: '👥',
                iconBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            },
            {
                id: 3,
                label: 'AVG REVENUE',
                value: formatCurrency(sum.avgRevenue),
                change: `${getTrendIcon(sum.avgRevenueTrend)} ${Math.abs(sum.avgRevenueChange || 0)}%`,
                changeColor: getTrendColor(sum.avgRevenueTrend),
                icon: '📊',
                iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            {
                id: 4,
                label: 'GROWTH RATE',
                value: `${sum.growthRate || 0}%`,
                change: `${getTrendIcon(sum.growthRateTrend)} ${Math.abs(sum.growthRateChange || 0)}% MoM`,
                changeColor: getTrendColor(sum.growthRateTrend),
                icon: '📈',
                iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
        ]);

        // 2. Revenue by Source
        const sources = data.revenueBySource || [];
        setRevenueBySource(sources.map((item, index) => ({
            id: index + 1,
            label: item.source?.replace(/_/g, ' ') || 'Other',
            amount: formatCurrency(item.amount),
            percentage: item.percentage || 0,
            ...getSourceIcon(item.source)
        })));

        // 3. Revenue Breakdown (Last 7 Days)
        const breakdown = data.revenueBreakdown || [];
        // Ensure we have data for chart visualization
        const chartBreakdown = breakdown.map(item => ({
            day: item.day?.substring(0, 3) || 'N/A',
            value: Math.min(100, Math.max(5, (item.revenue || 0) * 1000)) // Scale for visualization
        }));

        // If we have less than 7 days, fill with empty data
        while (chartBreakdown.length < 7) {
            chartBreakdown.push({ day: '---', value: 5 });
        }
        setRevenueBreakdown(chartBreakdown.slice(0, 7));

        // 4. Heatmap Data - Handle null from API
        const heatmapData = data.engagementHeatmap?.data;
        if (Array.isArray(heatmapData) && heatmapData.length > 0) {
            setHeatmap(heatmapData);
        } else {
            // Default 4x7 grid with varying values for visualization
            setHeatmap([
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            ]);
        }

        // 5. Demographics
        const demo = data.demographics || {};
        setDemographics({
            avgAge: demo.avgAge || 0,
            topCountry: demo.topCountry || 'N/A',
            ageGroups: demo.ageGroups || [
                { range: '18-24', percentage: 0 },
                { range: '25-34', percentage: 0 },
                { range: '35-44', percentage: 0 },
                { range: '45+', percentage: 0 },
            ]
        });

        // 6. Top Content - Convert API format to expected format
        const apiTopContent = data.topPerformingContent || [];
        const formattedTopContent = apiTopContent.map((item, index) => ({
            type: item.title || `Content ${index + 1}`,
            revenue: formatCurrency(item.revenue),
            percentage: item.percentage || Math.floor(100 / (index + 1))
        }));

        // If no content, show default
        if (formattedTopContent.length === 0) {
            setTopContent([
                { type: 'Live Streams', revenue: 'B$ 0.00', percentage: 0 },
                { type: 'Videos', revenue: 'B$ 0.00', percentage: 0 },
                { type: 'Posts', revenue: 'B$ 0.00', percentage: 0 },
                { type: 'Stories', revenue: 'B$ 0.00', percentage: 0 },
            ]);
        } else {
            setTopContent(formattedTopContent);
        }

        // 7. Funnel Data - Convert API format
        const apiFunnel = data.funnel?.funnel || [];
        const formattedFunnel = apiFunnel.map((step, index) => ({
            label: step.label || `Step ${index + 1}`,
            value: step.value?.toLocaleString() || '0',
            subLabel: step.note || `${step.percentage || 0}% conversion`,
            highlighted: index === 2 // Highlight the middle step as in the design
        }));

        // If no funnel data, show default
        if (formattedFunnel.length === 0) {
            setFunnelSteps([
                { label: 'Total Viewers', value: '0', subLabel: '0% reach', highlighted: false },
                { label: 'Engaged Users', value: '0', subLabel: '0% engagement', highlighted: false },
                { label: 'Gift Givers', value: '0', subLabel: '0% conversion', highlighted: true },
                { label: 'Paying Customers', value: '0', subLabel: '0% conversion', highlighted: false },
                { label: 'Multi-Stream Users', value: '0', subLabel: '0% cross-sell', highlighted: false },
            ]);
        } else {
            setFunnelSteps(formattedFunnel);
        }
    };

    // Replace the current fetchRevenueForecast function with this:
    const fetchRevenueForecast = async () => {
        setForecastLoading(true);
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
            showSnackbar('User ID not found. Please log in.', 'error');
            setForecastLoading(false);
            return;
        }

        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/getRevenueForecast/${creatorId}/${forecastFilter}`
            );

            console.log('Forecast API Response:', response.data); // Debug log

            if (response.data && response.data.success) {
                // Check for different possible response structures
                const forecastData = response.data.data?.forecast ||
                    response.data.forecast ||
                    response.data.data ||
                    [];

                // If forecastData is empty, create mock data for testing
                if (!forecastData || forecastData.length === 0) {
                    // Create mock data matching the image structure
                    const mockForecast = [
                        {
                            period: 'Next Period',
                            revenue: 0.00000000,
                            forecastRevenue: 0.00000000,
                            confidence: 0
                        },
                        {
                            period: 'Q2 2025',
                            revenue: 0.00,
                            forecastRevenue: 0.00,
                            confidence: 0
                        },
                        {
                            period: 'EOY 2025',
                            revenue: 0.00,
                            forecastRevenue: 0.00,
                            confidence: 0
                        }
                    ];
                    setRevenueForecast(mockForecast);
                } else {
                    // Ensure proper formatting of the data
                    const formattedForecast = forecastData.map(item => ({
                        period: item.period || `Period ${item.index || 0}`,
                        revenue: Number(item.revenue || item.actualRevenue || 0),
                        forecastRevenue: Number(item.forecastRevenue || item.forecast || 0),
                        confidence: Number(item.confidence || item.confidenceLevel || 0)
                    }));
                    setRevenueForecast(formattedForecast);
                    fetchForecastSummary(); // Fetch summary after setting forecast
                }
            } else {
                showSnackbar(response.data?.message || 'No forecast data available', 'warning');

                // Set default forecast data when API returns no data
               
            }
        } catch (error) {
            console.error('Forecast Fetch Error:', error);
            showSnackbar('Error fetching revenue forecast', 'error');

            // Set default data on error
           
        } finally {
            setForecastLoading(false);
        }
    };

    // --- API Fetch Logic ---
    const fetchAnalytics = async () => {
        setLoading(true);
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
            showSnackbar('User ID not found. Please log in.', 'error');
            setLoading(false);
            return;
        }

        try {
            const days = getDaysFromPeriod(selectedPeriod);
            const response = await apiClient.get(`${API_BASE_URL}/${creatorId}/dashboard?rangeDays=${days}`);

            if (response.data && response.data.success) {
                const data = response.data.data;
                processDashboardData(data);
            } else {
                showSnackbar(response.data?.message || 'Failed to fetch analytics', 'error');
                setDefaultEmptyData();
            }
        } catch (error) {
            console.error('Analytics Fetch Error:', error);
            showSnackbar('Error connecting to analytics service', 'error');
            setDefaultEmptyData();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchRevenueForecast();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPeriod, forecastFilter]);

    // --- Export Report Function ---
    const exportReport = async () => {
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
            showSnackbar('User ID not found. Please log in.', 'error');
            return;
        }

        try {
            const days = getDaysFromPeriod(selectedPeriod);
            const response = await apiClient.get(`${API_BASE_URL}/${creatorId}/summary-export?rangeDays=${days}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics - report - ${selectedPeriod} - ${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSnackbar('Report exported successfully!', 'success');
        } catch (error) {
            console.error('Export Report Error:', error);
            showSnackbar('Error exporting report. Please try again.', 'error');
        }
    };

    // --- Export Statement Function ---
    const exportStatement = async () => {
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
            showSnackbar('User ID not found. Please log in.', 'error');
            return;
        }

        try {
            const days = getDaysFromPeriod(selectedPeriod);
            const response = await apiClient.get(`${API_BASE_URL}/${creatorId}/revenue-export?rangeDays=${days}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `revenue - statement - ${selectedPeriod} - ${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSnackbar('Revenue statement exported successfully!', 'success');
        } catch (error) {
            console.error('Export Statement Error:', error);
            showSnackbar('Error exporting revenue statement. Please try again.', 'error');
        }
    };

    // Calculate max forecast value for chart scaling
    const maxForecastValue = revenueForecast.length > 0
        ? Math.max(...revenueForecast.map(item => Math.max(item.revenue || 0, item.forecastRevenue || 0)))
        : 0;

    // Heatmap configuration
    const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heatmapTimes = ['6AM', '12PM', '6PM', '11PM'];

    // Add this helper function near the top with other helpers
    const formatPeriodLabel = (period) => {
        return period.replace(/_/g, ' ');
    };

    // Updated fetchForecastSummary function
    const fetchForecastSummary = async () => {
        const creatorId = localStorage.getItem('childUserId');

        if (!creatorId) {
            showSnackbar('User ID not found. Please log in.', 'error');
            setForecastLoading(false);
            return;
        }

        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/${creatorId}/forecast-summary`
            );

            console.log('Forecast API Response:', response.data);

            if (response.data && response.data.success) {
                const summaryData = response.data.data?.forecast || [];
                // Format the period labels by replacing underscores with spaces
                const formattedData = summaryData.map(item => ({
                    ...item,
                    period: formatPeriodLabel(item.period)
                }));
                setRevenueForecastSummary(formattedData);

            } else {
                showSnackbar(response.data?.message || 'No forecast data available', 'warning');
                setRevenueForecastSummary([
                    {
                        period: 'NEXT MONTH',
                        revenue: 0.00000000,
                        confidence: 0
                    },
                    {
                        period: 'NEXT QUARTER',
                        revenue: 0.00,
                        confidence: 0
                    },
                    {
                        period: 'EO YEAR',
                        revenue: 0.00,
                        confidence: 0
                    }
                ]);
            }
        } catch (error) {
            console.error('Forecast Fetch Error:', error);
            showSnackbar('Error fetching revenue forecast', 'error');
            setRevenueForecastSummary([
                {
                    period: 'NEXT MONTH',
                    revenue: 0.00000000,
                    confidence: 0
                },
                {
                    period: 'NEXT QUARTER',
                    revenue: 0.00,
                    confidence: 0
                },
                {
                    period: 'EO YEAR',
                    revenue: 0.00,
                    confidence: 0
                }
            ]);
        } finally {
            setForecastLoading(false);
        }
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Main Card Container */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4,
                    }}
                >
                    {/* Period Tabs */}
                    <Box
                        sx={{
                            display: 'flex',
                            backgroundColor: '#1f1f1f',
                            borderRadius: '8px',
                            p: 0.5,
                        }}
                    >
                        {periodOptions.map((period) => (
                            <Box
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                sx={{
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedPeriod === period ? '#2563eb' : 'transparent',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: selectedPeriod === period ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: selectedPeriod === period ? '#ffffff' : '#9ca3af',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {period}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Export Button */}
                    <Button
                        startIcon={<BarChartIcon />}
                        onClick={exportReport}
                        sx={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            textTransform: 'none',
                            px: 2.5,
                            py: 1,
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            height: '40px',
                            '&:hover': {
                                backgroundColor: '#1d4ed8',
                            },
                        }}
                    >
                        Export Report
                    </Button>
                </Box>

                {/* Stats Cards Row */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    {statsData.map((stat) => (
                        <Box
                            key={stat.id}
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '12px',
                                p: 2.5,
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Typography
                                    sx={{
                                        color: '#9ca3af',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '8px',
                                        background: stat.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '18px' }}>{stat.icon}</Typography>
                                </Box>
                            </Box>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '28px', sm: '32px' },
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    mb: 1,
                                }}
                            >
                                {stat.value}
                            </Typography>
                            <Typography
                                sx={{
                                    color: stat.changeColor,
                                    fontSize: '13px',
                                    fontWeight: 500,
                                }}
                            >
                                {stat.change}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Card>

            {/* Revenue by Source */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                        }}
                    >
                        Revenue by Source
                    </Typography>
                    <Button
                        startIcon={<BarChartIcon />}
                        onClick={exportStatement}
                        sx={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            textTransform: 'none',
                            px: 2.5,
                            py: 1,
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            height: '40px',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                backgroundColor: '#1d4ed8',
                            },
                        }}
                    >
                        Export Statement
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                        gap: 2,
                    }}
                >
                    {revenueBySource.map((source) => (
                        <Box
                            key={source.id}
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '12px',
                                p: 2.5,
                                textAlign: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Typography sx={{ fontSize: '40px', mb: 1.5 }}>{source.icon}</Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    mb: 1,
                                }}
                            >
                                {source.label}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '20px', sm: '24px' },
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                {source.amount}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#6b7280',
                                    fontSize: '13px',
                                }}
                            >
                                {source.percentage.toFixed(1)}%
                            </Typography>
                        </Box>
                    ))}
                    {revenueBySource.length === 0 && (
                        <Box
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '12px',
                                p: 2.5,
                                textAlign: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                gridColumn: { xs: '1', sm: '1 / -1' },
                            }}
                        >
                            <Typography sx={{ fontSize: '40px', mb: 1.5 }}>💰</Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    mb: 1,
                                }}
                            >
                                No Revenue Data
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '20px', sm: '24px' },
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                B$ 0.00
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#6b7280',
                                    fontSize: '13px',
                                }}
                            >
                                0%
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Card>

            {/* Charts Row */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Revenue Breakdown Chart */}
                <Card
                    sx={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: { xs: 2, sm: 3 },
                    }}
                >
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                            mb: 3,
                        }}
                    >
                        Revenue Breakdown - Last 7 Days
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-around',
                            height: { xs: '200px', sm: '250px' },
                            px: { xs: 1, sm: 2 },
                        }}
                    >
                        {revenueBreakdown.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Tooltip title={item.value > 5 ? `Value: ${item.value}` : 'No data'}>
                                    <Box
                                        sx={{
                                            width: { xs: '24px', sm: '40px' },
                                            height: { xs: `${item.value * 1.8}px`, sm: `${item.value * 2.2}px` },
                                            backgroundColor: '#2563eb',
                                            borderRadius: '6px 6px 0 0',
                                            transition: 'height 0.3s ease',
                                        }}
                                    />
                                </Tooltip>
                                <Typography
                                    sx={{
                                        color: '#9ca3af',
                                        fontSize: { xs: '11px', sm: '13px' },
                                    }}
                                >
                                    {item.day}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Card>

                {/* Engagement Heatmap */}
                <Card
                    sx={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: { xs: 2, sm: 3 },
                    }}
                >
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                            mb: 3,
                        }}
                    >
                        Engagement Heatmap
                    </Typography>
                    <Box>
                        {/* Day headers */}
                        <Box sx={{ display: 'flex', mb: 1.5, pl: { xs: 4, sm: 5 } }}>
                            {heatmapDays.map((day) => (
                                <Typography
                                    key={day}
                                    sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                        fontSize: { xs: '10px', sm: '12px' },
                                        fontWeight: 600,
                                    }}
                                >
                                    {day}
                                </Typography>
                            ))}
                        </Box>
                        {/* Heatmap grid */}
                        {heatmap.map((row, rowIndex) => (
                            <Box key={rowIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography
                                    sx={{
                                        width: { xs: '32px', sm: '40px' },
                                        color: '#9ca3af',
                                        fontSize: { xs: '10px', sm: '11px' },
                                        textAlign: 'right',
                                        pr: 1,
                                    }}
                                >
                                    {heatmapTimes[rowIndex] || '--:--'}
                                </Typography>
                                <Box sx={{ display: 'flex', flex: 1 }}>
                                    {row.map((value, colIndex) => (
                                        <Tooltip key={colIndex} title={`Engagement: ${(value * 100).toFixed(1)}% `}>
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    height: { xs: '28px', sm: '36px' },
                                                    backgroundColor: `rgba(37, 99, 235, ${value})`,
                                                    borderRadius: '4px',
                                                    mx: 0.5,
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>
            </Box>

            {/* Demographics and Top Content Row */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Audience Demographics */}
                <Card
                    sx={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: { xs: 2, sm: 3 },
                    }}
                >
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                            mb: 3,
                        }}
                    >
                        Audience Demographics
                    </Typography>
                    {/* Avg Age and Top Country */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                        <Box
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '10px',
                                p: 2,
                            }}
                        >
                            <Typography sx={{ color: '#9ca3af', fontSize: '13px', mb: 0.5 }}>Avg Age</Typography>
                            <Typography sx={{ color: '#ffffff', fontSize: { xs: '24px', sm: '28px' }, fontWeight: 700 }}>
                                {Math.round(demographics.avgAge) || 0}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '10px',
                                p: 2,
                            }}
                        >
                            <Typography sx={{ color: '#9ca3af', fontSize: '13px', mb: 0.5 }}>Top Country</Typography>
                            <Typography sx={{ color: '#ffffff', fontSize: { xs: '24px', sm: '28px' }, fontWeight: 700 }}>
                                {demographics.topCountry}
                            </Typography>
                        </Box>
                    </Box>
                    {/* Age Distribution Bars */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {demographics.ageGroups.map((item, index) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                    <Typography sx={{ color: '#ffffff', fontSize: '14px' }}>{item.range}</Typography>
                                    <Typography sx={{ color: '#9ca3af', fontSize: '14px' }}>{item.percentage}%</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        height: '8px',
                                        backgroundColor: '#1f1f1f',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${item.percentage}% `,
                                            backgroundColor: '#2563eb',
                                            borderRadius: '4px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>

                {/* Top Performing Content */}
                <Card
                    sx={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: { xs: 2, sm: 3 },
                    }}
                >
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                            mb: 3,
                        }}
                    >
                        Top Performing Content
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {topContent.map((item, index) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
                                        {item.type}
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>
                                        {item.revenue}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        height: '10px',
                                        backgroundColor: '#1f1f1f',
                                        borderRadius: '5px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${item.percentage}% `,
                                            backgroundColor: '#2563eb',
                                            borderRadius: '5px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>
            </Box>

            {/* Cross-Revenue Funnel Analysis */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                }}
            >
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: { xs: '16px', sm: '18px' },
                        fontWeight: 700,
                        mb: 3,
                    }}
                >
                    Cross-Revenue Funnel Analysis
                </Typography>
                {/* Funnel Metrics */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    {funnelSteps.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '12px',
                                p: 2.5,
                                textAlign: 'center',
                                border: item.highlighted ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '28px', sm: '32px' },
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                {item.value}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '13px',
                                    mb: 0.5,
                                }}
                            >
                                {item.label}
                            </Typography>
                            <Typography
                                sx={{
                                    color: item.highlighted ? '#22c55e' : '#6b7280',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                }}
                            >
                                {item.subLabel}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Card>

            {/* Revenue Forecast */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: { xs: 2, sm: 3 },
                }}
            >
                {/* Forecast Header with Filter Tabs */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '16px', sm: '18px' },
                            fontWeight: 700,
                        }}
                    >
                        Revenue Forecast
                    </Typography>

                    {/* Forecast Filter Tabs */}
                    <Box
                        sx={{
                            display: 'flex',
                            backgroundColor: '#1f1f1f',
                            borderRadius: '8px',
                            p: 0.5,
                        }}
                    >
                        {forecastFilterOptions.map((filter) => (
                            <Box
                                key={filter.value}
                                onClick={() => setForecastFilter(filter.value)}
                                sx={{
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: forecastFilter === filter.value ? '#2563eb' : 'transparent',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: forecastFilter === filter.value ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: forecastFilter === filter.value ? '#ffffff' : '#9ca3af',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {filter.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {forecastLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <LinearProgress sx={{ width: '80%' }} />
                    </Box>
                ) : (
                    <>
                            {/* Forecast Chart - Dual Line Chart (Revenue + Forecast) */}
                            {revenueForecast.length > 0 ? (
                                <Box sx={{ mb: 3 }}>
                                    {/* Chart Container */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            height: { xs: '220px', sm: '280px' },
                                            px: { xs: 2, sm: 3 },
                                            py: 2,
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        {/* Y-axis labels */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: 8,
                                                top: 16,
                                                bottom: 50,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                pr: 1,
                                            }}
                                        >
                                            {[...Array(5)].map((_, i) => {
                                                const value = maxForecastValue > 0
                                                    ? maxForecastValue * (1 - i / 4)
                                                    : 0;
                                                return (
                                                    <Typography
                                                        key={i}
                                                        sx={{
                                                            color: '#6b7280',
                                                            fontSize: '10px',
                                                            textAlign: 'right',
                                                            minWidth: '70px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {value > 0 ? formatCurrency(value) : 'B$ 0'}
                                                    </Typography>
                                                );
                                            })}
                                        </Box>

                                        {/* Chart Area */}
                                        <Box
                                            sx={{
                                                ml: '85px',
                                                mr: '10px',
                                                height: '100%',
                                                position: 'relative',
                                            }}
                                        >
                                            {/* Grid lines */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 16,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 50,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                {[...Array(5)].map((_, i) => (
                                                    <Box
                                                        key={i}
                                                        sx={{
                                                            width: '100%',
                                                            height: '1px',
                                                            backgroundColor: i === 4 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                        }}
                                                    />
                                                ))}
                                            </Box>

                                            {/* Chart plotting area */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 16,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 50,
                                                }}
                                            >
                                                {/* SVG Line Chart */}
                                                <svg
                                                    width="100%"
                                                    height="100%"
                                                    style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
                                                >
                                                    <defs>
                                                        {/* Gradient for Forecast Revenue */}
                                                        <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                                        </linearGradient>
                                                        {/* Gradient for Actual Revenue */}
                                                        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Calculate points */}
                                                    {(() => {
                                                        const chartWidth = 100;
                                                        const chartHeight = 100;
                                                        const padding = 5;
                                                        const pointSpacing = (chartWidth - padding * 2) / Math.max(revenueForecast.length - 1, 1);

                                                        // Calculate points for both lines
                                                        const forecastPoints = revenueForecast.map((item, index) => {
                                                            const x = padding + (index * pointSpacing);
                                                            const yPercent = maxForecastValue > 0
                                                                ? ((item.forecastRevenue || 0) / maxForecastValue)
                                                                : 0;
                                                            const y = chartHeight - (yPercent * (chartHeight - padding * 2)) - padding;
                                                            return { x, y, value: item.forecastRevenue };
                                                        });

                                                        const revenuePoints = revenueForecast.map((item, index) => {
                                                            const x = padding + (index * pointSpacing);
                                                            const yPercent = maxForecastValue > 0
                                                                ? ((item.revenue || 0) / maxForecastValue)
                                                                : 0;
                                                            const y = chartHeight - (yPercent * (chartHeight - padding * 2)) - padding;
                                                            return { x, y, value: item.revenue };
                                                        });

                                                        // Create path strings
                                                        const forecastPathD = forecastPoints
                                                            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                                                            .join(' ');

                                                        const revenuePathD = revenuePoints
                                                            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                                                            .join(' ');

                                                        const forecastAreaD = forecastPathD + ` L ${forecastPoints[forecastPoints.length - 1].x} ${chartHeight} L ${forecastPoints[0].x} ${chartHeight} Z`;
                                                        const revenueAreaD = revenuePathD + ` L ${revenuePoints[revenuePoints.length - 1].x} ${chartHeight} L ${revenuePoints[0].x} ${chartHeight} Z`;

                                                        return (
                                                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" width="100%" height="100%">
                                                                {/* Forecast Revenue Area */}
                                                                <path
                                                                    d={forecastAreaD}
                                                                    fill="url(#forecastGradient)"
                                                                />
                                                                {/* Actual Revenue Area */}
                                                                <path
                                                                    d={revenueAreaD}
                                                                    fill="url(#revenueGradient)"
                                                                />

                                                                {/* Forecast Revenue Line */}
                                                                <path
                                                                    d={forecastPathD}
                                                                    stroke="#2563eb"
                                                                    strokeWidth="0.6"
                                                                    fill="none"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    vectorEffect="non-scaling-stroke"
                                                                />

                                                                {/* Actual Revenue Line */}
                                                                <path
                                                                    d={revenuePathD}
                                                                    stroke="#22c55e"
                                                                    strokeWidth="0.6"
                                                                    fill="none"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    vectorEffect="non-scaling-stroke"
                                                                />

                                                                {/* Forecast Revenue Data Points */}
                                                                {forecastPoints.map((p, index) => (
                                                                    <circle
                                                                        key={`forecast-${index}`}
                                                                        cx={p.x}
                                                                        cy={p.y}
                                                                        r="1.2"
                                                                        fill="#2563eb"
                                                                        stroke="#1a1a1a"
                                                                        strokeWidth="0.4"
                                                                        vectorEffect="non-scaling-stroke"
                                                                    />
                                                                ))}

                                                                {/* Actual Revenue Data Points */}
                                                                {revenuePoints.map((p, index) => (
                                                                    <circle
                                                                        key={`revenue-${index}`}
                                                                        cx={p.x}
                                                                        cy={p.y}
                                                                        r="1.2"
                                                                        fill="#22c55e"
                                                                        stroke="#1a1a1a"
                                                                        strokeWidth="0.4"
                                                                        vectorEffect="non-scaling-stroke"
                                                                    />
                                                                ))}
                                                            </svg>
                                                        );
                                                    })()}
                                                </svg>

                                                {/* Invisible overlay for tooltips */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        display: 'flex',
                                                        justifyContent: 'space-around',
                                                    }}
                                                >
                                                    {revenueForecast.map((item, index) => (
                                                        <Tooltip
                                                            key={index}
                                                            title={
                                                                <Box sx={{ textAlign: 'left', p: 0.5 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 0.5 }}>
                                                                        {item.period}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                                                                        <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                                                            Actual: {formatCurrency(item.revenue)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                                                                        <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                                                            Forecast: {formatCurrency(item.forecastRevenue)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <Box
                                                                sx={{
                                                                    flex: 1,
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                                                                    },
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* X-axis labels */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '50px',
                                                    display: 'flex',
                                                    justifyContent: 'space-around',
                                                    alignItems: 'flex-start',
                                                    pt: 1,
                                                }}
                                            >
                                                {revenueForecast.map((item, index) => (
                                                    <Typography
                                                        key={index}
                                                        sx={{
                                                            color: '#9ca3af',
                                                            fontSize: { xs: '11px', sm: '12px' },
                                                            fontWeight: 600,
                                                            textAlign: 'center',
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {item.period}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Legend */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: 3,
                                            mt: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 3,
                                                    backgroundColor: '#22c55e',
                                                    borderRadius: '2px',
                                                }}
                                            />
                                            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>
                                                Actual Revenue
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 3,
                                                    backgroundColor: '#2563eb',
                                                    borderRadius: '2px',
                                                }}
                                            />
                                            <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>
                                                Forecast Revenue
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: { xs: '200px', sm: '250px' },
                                        mb: 3,
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                                        No forecast data available
                                    </Typography>
                                </Box>
                            )}

                        {/* Forecast Cards */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                    gap: 3,
                                }}
                            >
                                {revenueForecastSummary.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            backgroundColor: '#1f1f1f',
                                            borderRadius: '12px',
                                            p: 3,
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: '#9ca3af',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                mb: 2,
                                                textAlign: 'left',
                                            }}
                                        >
                                            {item.period}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: '#ffffff',
                                                fontSize: '32px',
                                                fontWeight: 700,
                                                mb: 1,
                                                textAlign: 'left',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {formatCurrency(item.revenue)}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: item.confidence > 0 ? '#22c55e' : '#ef4444',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                textAlign: 'left',
                                                mb: 3,
                                            }}
                                        >
                                            {item.confidence}% confidence
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                    </>
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