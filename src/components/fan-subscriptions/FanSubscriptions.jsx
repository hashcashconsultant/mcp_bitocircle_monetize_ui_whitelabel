'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  ButtonGroup,
  Avatar,
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  Switch,
  FormControl,
  Chip,
  ListItemText,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MovieIcon from '@mui/icons-material/Movie';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import apiClient from '../utils/apiClient';
import CustomSnackbar from '../utils/CustomSnackbar';
import WHITELABEL, { communityUrl } from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/subscription';

function BenefitsSelect({
  fanFeatures,
  benefits,
  setBenefits
}) {
  return (
    <FormControl fullWidth>
      <Select
        multiple
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Typography sx={{ color: '#6b7280' }}>
              Select benefits
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((v) => (
                <Chip key={v} label={v} size="small" />
              ))}
            </Box>
          )
        }
      >
        {fanFeatures.map((f) => (
          <MenuItem key={f.id} value={f.name}>
            <Checkbox checked={benefits.includes(f.name)} />
            <ListItemText primary={f.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function FanSubscriptionsPage() {
  console.log('DEBUGGER Component rendering, window exists:', typeof window !== 'undefined');
  const [selectedPrice, setSelectedPrice] = useState('9.99');
  const [managementTab, setManagementTab] = useState(0);
  const [analyticsTimePeriod, setAnalyticsTimePeriod] = useState('7days');
  const [revenueView, setRevenueView] = useState('cumulative');
  const [contentTab, setContentTab] = useState(0);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [addPlanModalOpen, setAddPlanModalOpen] = useState(false);
  const [pricingPlan, setPricingPlan] = useState([]);
  const [subscriberSearchString, setSubscriberSearchString] = useState('');
  const [subscriberType, setSubscriberType] = useState('ALL');
  const [subscriberDays, setSubscriberDays] = useState('7');
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [exclusiveContent, setExclusiveContent] = useState([]);
  const [customStartDate, setCustomStartDate] = useState(dayjs().subtract(7, 'day'));
  const [customEndDate, setCustomEndDate] = useState(dayjs());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [stats, setStats] = useState([
    {
      label: 'MONTHLY RECURRING REVENUE',
      amount: 'B$ 0',
      change: '↑ 0% from last month',
      trend: 'up',
      highlight: true,
    },
    {
      label: 'TOTAL SUBSCRIBERS',
      amount: 'B$ 0',
      change: '↑ 0 new this week',
      trend: 'up',
    },
    {
      label: 'CHURN RATE',
      amount: '0%',
      change: '↑ 0% from last month',
      trend: 'down',
    },
    {
      label: 'AVERAGE REVENUE PER USER',
      amount: 'B$ 0',
      change: '↑ B$ increase',
      trend: 'up',
    },
  ]);

  // Subscription Settings States
  const [enableSubscriptions, setEnableSubscriptions] = useState(true);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState(true);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Thank you for subscribing! You now have access to exclusive content...'
  );
  const [benefits, setBenefits] = useState([]);
  const [fanFeatures, setFanFeatures] = useState([]);

  const [minimumPeriod, setMinimumPeriod] = useState('1');
  const [freeTrialPeriod, setFreeTrialPeriod] = useState('7');

  const [isLoading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [creatorUuid, setCreatorUuid] = useState(null);


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

  

  // Function to calculate date range based on period
  const getDateRange = (period) => {
    const today = dayjs();
    let fromDate, toDate;

    switch (period) {
      case '7days':
        fromDate = today.subtract(7, 'day');
        toDate = today;
        break;
      case '30days':
        fromDate = today.subtract(30, 'day');
        toDate = today;
        break;
      case '3months':
        fromDate = today.subtract(3, 'month');
        toDate = today;
        break;
      case '6months':
        fromDate = today.subtract(6, 'month');
        toDate = today;
        break;
      case 'year':
        fromDate = today.subtract(1, 'year');
        toDate = today;
        break;
      case 'custom':
        fromDate = customStartDate;
        toDate = customEndDate;
        break;
      default:
        fromDate = today.subtract(7, 'day');
        toDate = today;
    }

    return {
      fromDate: fromDate.format('YYYY-MM-DD'),
      toDate: toDate.format('YYYY-MM-DD')
    };
  };

  // Function to fetch analytics data
  const fetchAnalyticsData = async (period) => {
    
    if (!creatorId) return;

    try {
      const { fromDate, toDate } = getDateRange(period);

      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${creatorId}/managementAnalytics`,
        {
          params: {
            fromDate,
            toDate
          }
        }
      );

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }

      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load analytics.',
        'error'
      );
    }
  };

  // Helper function to format analytics stats
  const formatAnalyticsStat = (label, value, change, isPercentage = false, isAmount = false) => {
    const isPositive = change > 0;
    const changeText = isPercentage
      ? `${Math.abs(change).toFixed(1)}%`
      : isAmount
        ? `B$ ${Math.abs(change)}`
        : Math.abs(change);

    return {
      label,
      value: isPercentage ? `${value}%` : isAmount ? `B$ ${value}` : value.toString(),
      change: `${isPositive ? '↑' : '↓'} ${changeText} from previous period`,
      trend: isPositive ? 'up' : 'down'
    };
  };

  // Generate analytics stats from API data
  const getAnalyticsStats = () => {
    if (!analyticsData) {
      return [
        { label: 'ACTIVE SUBSCRIBERS', value: '0', change: '↑ 0% from previous period', trend: 'up' },
        { label: 'AVG. SUBSCRIPTION DURATION', value: '0 months', change: '↑ 0 months from last quarter', trend: 'up' },
        { label: 'LIFETIME VALUE', value: 'B$ 0', change: '↑ B$ 0 from last month', trend: 'up' },
        { label: 'CHURN RATE', value: '0%', change: '↓ 0% improvement', trend: 'up' },
        { label: 'ACTIVE ENGAGEMENT', value: '0%', change: '↑ 0% from last week', trend: 'up' },
      ];
    }

    return [
      formatAnalyticsStat(
        'ACTIVE SUBSCRIBERS',
        analyticsData.activeSubscribers || 0,
        analyticsData.activeSubscribersChangePercentage || 0,
        true
      ),
      {
        label: 'AVG. SUBSCRIPTION DURATION',
        value: `${analyticsData.averageSubscriptionDuration || 0} months`,
        change: `${(analyticsData.averageSubscriptionDurationChange || 0) > 0 ? '↑' : '↓'} ${Math.abs(analyticsData.averageSubscriptionDurationChange || 0)} months from last quarter`,
        trend: (analyticsData.averageSubscriptionDurationChange || 0) >= 0 ? 'up' : 'down'
      },
      formatAnalyticsStat(
        'LIFETIME VALUE',
        analyticsData.lifetimeValue || 0,
        analyticsData.lifetimeValueChangeAmount || 0,
        false,
        true
      ),
      formatAnalyticsStat(
        'CHURN RATE',
        analyticsData.churnRate || 0,
        -(analyticsData.churnRateChangePercentage || 0),
        true
      ),
      formatAnalyticsStat(
        'ACTIVE ENGAGEMENT',
        analyticsData.activeEngagement || 0,
        analyticsData.activeEngagementChangePercentage || 0,
        true
      ),
    ];
  };

  const fetchDashboardAnalytics = async (period) => {
    
    if (!creatorId) return;

    try {
      const { fromDate, toDate } = getDateRange(period);

      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${creatorId}/managementAnalytics`,
        {
          params: {
            fromDate,
            toDate
          }
        }
      );

      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }

      console.log('Dashboard Analytics:', response.data.data);
      setDashboardAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load dashboard analytics.',
        'error'
      );
    }
  };

  const getRetentionData = () => {
    if (!dashboardAnalytics?.retention?.breakdown) {
      return [
        { label: 'Returning', percentage: 0, color: '#10b981', count: 0 },
        { label: 'New', percentage: 0, color: '#3b82f6', count: 0 },
        { label: 'Churned', percentage: 0, color: '#ef4444', count: 0 },
        { label: 'Paused', percentage: 0, color: '#f59e0b', count: 0 },
      ];
    }

    const segmentMap = {
      'RETURNING': { label: 'Returning', color: '#10b981' },
      'NEW': { label: 'New', color: '#3b82f6' },
      'CHURNED': { label: 'Churned', color: '#ef4444' },
      'PAUSED': { label: 'Paused', color: '#f59e0b' },
    };

    return dashboardAnalytics.retention.breakdown.map(item => ({
      label: segmentMap[item.segment]?.label || item.segment,
      percentage: item.percentage || 0,
      color: segmentMap[item.segment]?.color || '#9ca3af',
      count: item.count || 0
    }));
  };

  // Helper function to format growth trend data for chart
  const getGrowthTrendData = () => {
    if (!dashboardAnalytics?.growthTrend) {
      return [];
    }
    return dashboardAnalytics.growthTrend;
  };

  // Add this function after fetchDashboardAnalytics
  const fetchRevenueAnalytics = async (viewType) => {
    
    if (!creatorId) return;

    try {
      const currentYear = new Date().getFullYear();
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${creatorId}/managementRevenueAnalytics`,
        {
          params: {
            viewType: viewType.toUpperCase(),
            year: currentYear
          }
        }
      );

      const success = response?.data?.success;
      if (!success) {
        if (response?.data?.errorCode === 'NO_RECORD_FOUND') {
          setRevenueAnalytics(null);
          return;
        }
        showSnackbar(response.data.message, 'error');
        return;
      }

      console.log('Revenue Analytics:', response.data.data);
      setRevenueAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      setRevenueAnalytics(null);
    }
  };

  // Helper function to format revenue data for display
  const getRevenueChartData = () => {
    if (!revenueAnalytics || !Array.isArray(revenueAnalytics)) {
      return [];
    }
    return revenueAnalytics.map(item => ({
      date: item.date,
      recurringRevenue: item.recurringRevenue || 0,
      oneTimeRevenue: item.oneTimeRevenue || 0,
      totalRevenue: item.totalRevenue || 0,
    }));
  };

  // Helper function to calculate max revenue for chart scaling
  const getMaxRevenue = () => {
    const data = getRevenueChartData();
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => item.totalRevenue));
  };

  // Helper function to format date
  const formatRevenueDate = (dateString) => {
    return dayjs(dateString).format('MMM DD');
  };

  // Handle saving settings
  const handleSaveSettings = async () => {
    

    const featureIds = benefits.map((benefit) => {
      const feature = fanFeatures.find(f => f.name.toLowerCase() === benefit.toLowerCase());
      return feature ? feature.featureId : null;
    }).filter(id => id !== null);

    try {
      const payload = {
        "enabledSubscriptions": enableSubscriptions ? 1 : 0,
        "subscriptionNotifications": subscriptionNotifications ? 1 : 0,
        "autoRenewal": autoRenewal ? 1 : 0,
        "welcomeMessage": welcomeMessage,
        "minSubscriptionPeriod": `${minimumPeriod} MONTH`,
        "freeTrialDays": parseInt(freeTrialPeriod),
        "creatorId": creatorId,
        "featuresIds": featureIds,
      }
      console.log('Payload to be sent:', payload);

      const response = await apiClient.post(`${API_BASE_URL}/settings`, payload);
      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      showSnackbar('Subscription settings saved successfully!', 'success');
      setSettingsModalOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to save subscription settings.',
        'error'
      );
    } finally {
      setLoading(false)
    }
  };

  /* Function for opening settings popup */
  const handleOpenSettingsModal = async () => {
    await getAllFanFeatures();
    setSettingsModalOpen(true);
    await renderSubscriptionSettings();
  }

  /* function defination to render fan features */
  const getAllFanFeatures = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/fan-features`);
      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      const features = response.data.data;
      setFanFeatures(features || []);
    } catch (error) {
      console.error('Error fetching fan features:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load fan features.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  /* Function defination to render existing settings data */
  const renderSubscriptionSettings = async () => {
    
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/creator/${creatorId}/details`);
      const success = response?.data?.success;
      // No settings saved yet: keep the form's defaults so the creator can set them up for the first time.
      if (!success && response?.data?.errorCode === 'NO_RECORD_FOUND') {
        return;
      }
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      const settings = response.data.data;
      console.log('settings', settings);

      setEnableSubscriptions(settings.isSubscriptionsEnabled === 'Y');
      setSubscriptionNotifications(settings.isSubscriptionNotificationEnabled === 'Y');
      setAutoRenewal(settings.autoRenewal === 1);
      setWelcomeMessage(settings.welcomeMessage || '');
      setMinimumPeriod(settings.minSubscriptionPeriod ? settings.minSubscriptionPeriod.split(' ')[0] : '1');
      setFreeTrialPeriod(settings.freeTrialDays ? settings.freeTrialDays.toString() : '7');
      setBenefits(settings.features ? settings.features.map(f => f.name) : []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load subscription settings.',
        'error'
      );
    } finally {
      setLoading(false)
    }
  }

  /* Function defination to add a tier */
  const handleAddNewTier = async (tierId) => {
    
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/creator/${creatorId}/details`);
      const success = response?.data?.success;
      const notConfigured = (!success && response?.data?.errorCode === 'NO_RECORD_FOUND') || (success && !response.data.data);
      if (notConfigured) {
        showSnackbar('Set up your subscription first: open "Subscription Settings", save it, then choose a plan.', 'warning');
        return;
      }
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      const settings = response.data.data;
      try {
        const response = await apiClient.patch(
          `${API_BASE_URL}/creator/${creatorId}/current-tier`,
          null,
          {
            params: {
              tierId: tierId,
            },
          }
        );

        const success = response?.data?.success;
        if (!success) {
          showSnackbar(response.data.message, 'error');
          return;
        }

        showSnackbar('Tier updated successfully!', 'success');

        const updatedPlan = pricingPlan.find(plan => plan.id === tierId);
        if (updatedPlan) {
          setSelectedPrice(updatedPlan.price);
        }

        console.log('Tier updated:', response.data);
      } catch (error) {
        console.error('Error updating tier:', error);
        showSnackbar(
          error.response?.data?.message || error.message || 'Failed to update tier.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking settings:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to verify settings.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  const getRecentSubscribers = async (searchString, type, days) => {
    
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_BASE_URL}/creator/${creatorId}/subscribers?searchStr=${searchString}&type=${type}&noOfDays=${days}`);
      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      console.log(response.data.data);
      const subscribers = response.data.data;
      setRecentSubscribers(subscribers || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load subscribers.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  /* Function to fetch exclusive content */
  const getExclusiveContent = async (creatorUuid) => {
    

    try {
      const response = await apiClient.get(`${API_BASE_URL}/getExclusiveContents/${creatorUuid}`);
      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      console.log('Exclusive content:', response.data.data);
      setExclusiveContent(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exclusive content:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load exclusive content.',
        'error'
      );
    }
  };

  // Filter content by type
  const getFilteredContent = (type) => {
    return exclusiveContent.filter(content => content.contentType === type);
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  // Format view count
  const formatViewCount = (count) => {
    if (!count || count === 0) return '0 views';
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  // Get gradient for content cards
  const getGradientForIndex = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    ];
    return gradients[index % gradients.length];
  };

  /*
  * Function defination to render all pricing plan
  */
  const getAllPricingPlans = async (creatorId) => {
    

    try {
      const pricingResponse = await apiClient.get(`${API_BASE_URL}/pricing`);
      const pricingSuccess = pricingResponse?.data?.success;
      if (!pricingSuccess) {
        showSnackbar(pricingResponse.data.message, 'error');
        return;
      }
      const plans = pricingResponse.data.data || [];
      setPricingPlan(plans);

      try {
        const detailsResponse = await apiClient.get(`${API_BASE_URL}/creator/${creatorId}/details`);
        const detailsSuccess = detailsResponse?.data?.success;

        if (detailsSuccess && detailsResponse.data.data) {
          const creatorDetails = detailsResponse.data.data;

          if (creatorDetails.currentTierId) {
            const activePlan = plans.find(plan => plan.id === creatorDetails.currentTierId);
            if (activePlan) {
              setSelectedPrice(activePlan.price);
              console.log('Active tier set:', activePlan);
            }
          }
        }
      } catch (detailsError) {
        console.log('Creator details not found or error fetching:', detailsError);
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load pricing plans.',
        'error'
      );
    }
  }

  /**
   * Function defination for rendering dashboard details  
   */
  const getAllSubscriptionDashboard = async (creatorId) => {
    

    try {
      const response = await apiClient.get(`${API_BASE_URL}/creator/${creatorId}/dashboard-details`);
      const success = response?.data?.success;
      if (!success) {
        showSnackbar(response.data.message, 'error');
        return;
      }
      const resData = response.data.data;
      const resStats = [
        {
          label: 'MONTHLY RECURRING REVENUE',
          amount: `B$ ${resData.monthlyRecurringRevenue || '0'}`,
          change: `${resData.profitLossPercentageOfLastMonth > 0 ? `↑ ${resData.profitLossPercentageOfLastMonth}% from last month` : `↓ ${Math.abs(resData.profitLossPercentageOfLastMonth)}% from last month`}`,
          trend: `${resData.profitLossPercentageOfLastMonth > 0 ? 'up' : 'down'}`,
          highlight: true,
        },
        {
          label: 'TOTAL SUBSCRIBERS',
          amount: `${resData.totalSubscribers || '0'}`,
          change: `${resData.totalSubscribersThisWeek > 0 ? `↑ ${resData.totalSubscribersThisWeek} new this week` : `↓ ${Math.abs(resData.totalSubscribersThisWeek)} new this week`}`,
          trend: `${resData.totalSubscribersThisWeek > 0 ? 'up' : 'down'}`,
        },
        {
          label: 'CHURN RATE',
          amount: `${resData.cancelSubscriptionPercentage || '0'}%`,
          change: `${resData.cancelSubscriptionPercentageLastMonth === 0 ? `↑ ${resData.cancelSubscriptionPercentage}% from last month` : `↓ ${Math.abs(resData.cancelSubscriptionPercentageLastMonth)}% from last month`}`,
          trend: `${resData.cancelSubscriptionPercentageLastMonth === 0 ? 'up' : 'down'}`,
        },
        {
          label: 'AVERAGE REVENUE PER USER',
          amount: `B$ ${resData.averageRevenuePerUser}`,
          change: `${resData.averageRevenuePerUserChangeLastMonth > 0 ? `↑ B$ ${resData.averageRevenuePerUserChangeLastMonth} increase` : `↓ B$ ${Math.abs(resData.averageRevenuePerUserChangeLastMonth)} decrease`}`,
          trend: `${resData.averageRevenuePerUserChangeLastMonth > 0 ? 'up' : 'down'}`,
        },
      ]
      setStats(resStats);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to load dashboard details.',
        'error'
      );
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('DEBUGGER ', localStorage.getItem('childUserId'), localStorage.getItem('uuid'))
      setCreatorId(localStorage.getItem('childUserId'));
      setCreatorUuid(localStorage.getItem('uuid'));
    }
  }, []);



  useEffect(() => {
    console.log('DEBUGGER ',creatorId)
    if (!creatorId || !creatorUuid) return;

    getAllPricingPlans(creatorId);
    getAllSubscriptionDashboard(creatorId);
    getExclusiveContent(creatorUuid);
    getRecentSubscribers(subscriberSearchString, subscriberType, subscriberDays);
  }, [creatorId, creatorUuid]);


  // Update other useEffects to only 
  useEffect(() => {

    if (managementTab === 1) {
      const loadAnalytics = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchAnalyticsData(analyticsTimePeriod),
            fetchDashboardAnalytics(analyticsTimePeriod),
            fetchRevenueAnalytics(revenueView),
          ]);
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setLoading(false);
        }
      };
      loadAnalytics();
    }
  }, [managementTab, analyticsTimePeriod]);

  useEffect(() => {
    if (managementTab === 1) {
      fetchRevenueAnalytics(revenueView);
    }
  }, [revenueView]);

  // Add style element for hover effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .revenue-bar:hover .revenue-tooltip {
        opacity: 1 !important;
      }
    `;
    document.head.append(style);
    return () => style.remove();
  }, []);


  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
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
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          Fan Subscriptions
        </Typography>
        <Button
          startIcon={<SettingsIcon />}
          onClick={() => handleOpenSettingsModal()}
          sx={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            textTransform: 'none',
            px: 3,
            py: 1.25,
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          Subscription Settings
        </Button>
      </Box>

      {/* Row 1: Stats Cards */}
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
              backgroundColor: stat.highlight ? '#2563eb' : '#262626',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                color: stat.highlight ? 'rgba(255, 255, 255, 0.8)' : '#9ca3af',
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
                fontSize: '30px',
                fontWeight: 700,
                mb: 0.5,
                lineHeight: 1,
              }}
            >
              {stat.amount}
            </Typography>
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
          </Card>
        ))}
      </Box>

      {/* Row 2: Subscription Pricing */}
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
          }}
        >
          Subscription Pricing
        </Typography>

        <Typography
          sx={{
            color: '#9ca3af',
            fontSize: '14px',
            mb: 3,
          }}
        >
          Choose a monthly subscription fee for your exclusive content.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
            gap: 2,
          }}
        >
          {pricingPlan.map((plan) => (
            <Box
              key={plan.id}
              onClick={() => handleAddNewTier(plan.id)}
              sx={{
                backgroundColor: selectedPrice === plan.price ? '#2563eb' : '#1f1f1f',
                border: selectedPrice === plan.price ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                '&:hover': {
                  backgroundColor: selectedPrice === plan.price ? '#1d4ed8' : '#2a2a2a',
                  border: selectedPrice === plan.price ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Typography
                sx={{
                  color: '#e5e7eb',
                  fontSize: '14px',
                  fontWeight: 600,
                  mb: 0.75,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {plan.name}
              </Typography>

              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '26px',
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                B$ {plan.price}
              </Typography>

              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '12px',
                }}
              >
                {plan.description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mt: 3,
            p: 2,
            backgroundColor: '#1f1f1f',
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              backgroundColor: '#2563eb',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: '13px',
            }}
          >
            Your followers would see this fee as the monthly subscription fee to subscribe for your exclusive content.
          </Typography>
        </Box>
      </Card>

      {/* Row 3: Subscription Management */}
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
          Subscription Management
        </Typography>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={managementTab}
            onChange={(e, newValue) => setManagementTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563eb',
              },
              '& .MuiTab-root': {
                color: '#9ca3af',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#2563eb',
                },
              },
            }}
          >
            <Tab label="Recent Subscribers" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Recent Subscribers Tab */}
        {managementTab === 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <TextField
                value={subscriberSearchString}
                onChange={(e) => {
                  setSubscriberSearchString(e.target.value);
                  getRecentSubscribers(e.target.value, subscriberType, subscriberDays);
                }}
                placeholder="Search subscribers..."
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#6b7280', mr: 1 }} />,
                }}
                sx={{
                  flex: 1,
                  minWidth: '250px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1f1f1f',
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}
              />
              <Select
                value={subscriberType}
                onChange={(e) => {
                  setSubscriberType(e.target.value);
                  getRecentSubscribers(subscriberSearchString, e.target.value, subscriberDays);
                }}
                size="small"
                sx={{
                  minWidth: '160px',
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MenuItem value="ALL">All Subscribers</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PAUSED">Paused</MenuItem>
              </Select>
              <Select
                size="small"
                value={subscriberDays}
                onChange={(e) => {
                  setSubscriberDays(e.target.value);
                  getRecentSubscribers(subscriberSearchString, subscriberType, e.target.value);
                }}
                sx={{
                  minWidth: '140px',
                  backgroundColor: '#1f1f1f',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentSubscribers.length === 0 ? (
                <Typography
                  sx={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    py: 3,
                  }}
                >
                  No subscribers yet
                </Typography>
              ) : (
                recentSubscribers.map((subscriber, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      p: 2.5,
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
                      src={subscriber.profilePicture || undefined}
                      onClick={() => {
                        const userId = subscriber.userId || subscriber.subscriberId || subscriber.id || subscriber.uuid;
                        if (userId) {
                          window.open(communityUrl(WHITELABEL.communityLinks.profile(userId)), '_blank');
                        } else {
                          showSnackbar('User ID not found', 'error');
                        }
                      }}
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: subscriber.profilePicture ? 'transparent' : '#2563eb',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {!subscriber.profilePicture &&
                        subscriber.userName?.charAt(1).toUpperCase()}
                    </Avatar>

                    <Box
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const userId = subscriber.userId || subscriber.subscriberId || subscriber.id || subscriber.uuid;
                        if (userId) {
                          window.open(communityUrl(WHITELABEL.communityLinks.profile(userId)), '_blank');
                        } else {
                          showSnackbar('User ID not found', 'error');
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#eeeaeaff',
                          fontSize: '15px',
                          fontWeight: 600,
                          mb: 0.25,
                          '&:hover': {
                            color: '#2563eb',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {subscriber.userName}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#6b7280',
                          fontSize: '13px',
                        }}
                      >
                        {subscriber.tierName || 'No Tier'} Subscriber
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 700,
                          mb: 0.25,
                        }}
                      >
                        B$ {subscriber.amount}
                      </Typography>
                      <Typography sx={{ color: '#6b7280', fontSize: '11px' }}>
                        Amount
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 700,
                          mb: 0.25,
                        }}
                      >
                        {subscriber.monthsSubscribed > 1
                          ? `${subscriber.monthsSubscribed} months`
                          : `${subscriber.monthsSubscribed} month`}
                      </Typography>
                      <Typography sx={{ color: '#6b7280', fontSize: '11px' }}>
                        Subscribed
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                      <Typography
                        sx={{
                          color:
                            subscriber.paymentStatus.toLowerCase() === 'active'
                              ? '#10b981' : subscriber.paymentStatus.toLowerCase() === 'cancelled' ? '#ef4444' :
                                '#e78f0c',
                          fontSize: '14px',
                          fontWeight: 700,
                          mb: 0.25,
                        }}
                      >
                        {subscriber.paymentStatus}
                      </Typography>
                      <Typography sx={{ color: '#6b7280', fontSize: '11px' }}>
                        Status
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Analytics Tab */}
        {managementTab === 1 && (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <ButtonGroup sx={{ backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                {[
                  { label: 'Last 7 days', value: '7days' },
                  { label: 'Last 30 days', value: '30days' },
                  { label: 'Last 3 months', value: '3months' },
                  { label: 'Last 6 months', value: '6months' },
                  { label: 'Last year', value: 'year' },
                  { label: 'Custom range', value: 'custom' },
                ].map((period, index, array) => (
                  <Button
                    key={period.value}
                    onClick={() => {
                      setAnalyticsTimePeriod(period.value);
                      if (period.value === 'custom') {
                        setShowCustomDatePicker(true);
                      } else {
                        setShowCustomDatePicker(false);
                        fetchAnalyticsData(period.value);
                      }
                    }}
                    sx={{
                      backgroundColor: analyticsTimePeriod === period.value ? '#2563eb' : 'transparent',
                      color: analyticsTimePeriod === period.value ? '#ffffff' : '#9ca3af',
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      borderRight: index !== array.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      '&:hover': {
                        backgroundColor: analyticsTimePeriod === period.value ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRight: index !== array.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      },
                    }}
                  >
                    {period.label}
                  </Button>
                ))}
              </ButtonGroup>

              <Button
                startIcon={<InsertChartIcon />}
                sx={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.75,
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
              >
                Export Report
              </Button>
            </Box>

            {showCustomDatePicker && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    p: 2.5,
                    backgroundColor: '#1f1f1f',
                    borderRadius: '10px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <DatePicker
                    label="From Date"
                    value={customStartDate}
                    onChange={(newValue) => setCustomStartDate(newValue)}
                    maxDate={customEndDate}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#2a2a2a',
                            color: '#ffffff',
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
                          '& .MuiInputLabel-root': {
                            color: '#9ca3af',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#9ca3af',
                          },
                        }
                      }
                    }}
                  />
                  <DatePicker
                    label="To Date"
                    value={customEndDate}
                    onChange={(newValue) => setCustomEndDate(newValue)}
                    minDate={customStartDate}
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#2a2a2a',
                            color: '#ffffff',
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
                          '& .MuiInputLabel-root': {
                            color: '#9ca3af',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#9ca3af',
                          },
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => fetchAnalyticsData('custom')}
                    variant="contained"
                    sx={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textTransform: 'none',
                      px: 3,
                      py: 1.25,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </LocalizationProvider>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#2563eb' }} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 2.5,
                    mb: 3,
                  }}
                >
                  {getAnalyticsStats().map((stat, index) => (
                    <Card
                      key={index}
                      sx={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
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
                          fontSize: '34px',
                          fontWeight: 700,
                          mb: 0.5,
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
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
                    </Card>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', lg: 'row' }, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        p: 3,
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: 700,
                          }}
                        >
                          Subscription Growth Trend
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              backgroundColor: '#2563eb',
                              borderRadius: '2px',
                            }}
                          />
                          <Typography
                            sx={{
                              color: '#9ca3af',
                              fontSize: '12px',
                            }}
                          >
                            Current Period
                          </Typography>
                        </Box>
                      </Box>

                      {getGrowthTrendData().length === 0 ? (
                        <Box
                          sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6b7280',
                            fontSize: '14px',
                          }}
                        >
                          No growth data available for this period
                        </Box>
                      ) : (
                        <Box sx={{ height: 200, overflowY: 'auto' }}>
                          {getGrowthTrendData().map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                mb: 1,
                                backgroundColor: index % 2 === 0 ? '#262626' : 'transparent',
                                borderRadius: '6px',
                              }}
                            >
                              <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                                {dayjs(item.date).format('MMM DD, YYYY')}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography sx={{ color: '#2563eb', fontSize: '14px', fontWeight: 600 }}>
                                    {item.totalSubscribers}
                                  </Typography>
                                  <Typography sx={{ color: '#6b7280', fontSize: '11px' }}>
                                    Total
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography sx={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                                    +{item.newSubscribers}
                                  </Typography>
                                  <Typography sx={{ color: '#6b7280', fontSize: '11px' }}>
                                    New
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Card>
                  </Box>

                  <Box sx={{ width: { xs: '100%', lg: '350px' } }}>
                    <Card
                      sx={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        p: 3,
                        height: '100%',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '16px',
                          fontWeight: 700,
                          mb: 3,
                        }}
                      >
                        Retention Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '56px',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          {dashboardAnalytics?.retention?.retentionPercentage
                            ? `${dashboardAnalytics.retention.retentionPercentage}%`
                            : '0%'}
                        </Typography>
                        <Typography
                          sx={{
                            color: '#9ca3af',
                            fontSize: '14px',
                            mt: 1,
                          }}
                        >
                          Retention
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {getRetentionData().map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: item.color,
                                  borderRadius: '3px',
                                }}
                              />
                              <Typography
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '16px',
                                  fontWeight: 700,
                                }}
                              >
                                {item.percentage}%
                              </Typography>
                              <Typography
                                sx={{
                                  color: '#6b7280',
                                  fontSize: '11px',
                                }}
                              >
                                ({item.count})
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Box>
                </Box>

                <Card
                  sx={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 700,
                      }}
                    >
                      Revenue Analytics
                    </Typography>
                    <ButtonGroup sx={{ backgroundColor: '#262626', borderRadius: '8px' }}>
                      {['Monthly', 'Cumulative'].map((view, index) => (
                        <Button
                          key={view}
                          onClick={() => setRevenueView(view.toLowerCase())}
                          sx={{
                            backgroundColor: revenueView === view.toLowerCase() ? '#2563eb' : 'transparent',
                            color: revenueView === view.toLowerCase() ? '#ffffff' : '#9ca3af',
                            textTransform: 'none',
                            px: 2.5,
                            py: 0.75,
                            fontSize: '13px',
                            fontWeight: 600,
                            border: 'none',
                            borderRight: index === 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                            '&:hover': {
                              backgroundColor: revenueView === view.toLowerCase() ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                              border: 'none',
                              borderRight: index === 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                            },
                          }}
                        >
                          {view}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </Box>

                  {getRevenueChartData().length > 0 && (
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#2563eb', borderRadius: '2px' }} />
                        <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>Total Revenue</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '2px' }} />
                        <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>Recurring</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                        <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>One-Time</Typography>
                      </Box>
                    </Box>
                  )}

                  {getRevenueChartData().length === 0 ? (
                    <Box
                      sx={{
                        height: 250,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: '16px', color: '#9ca3af' }}>
                        No revenue data available
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
                        Revenue analytics will appear once you start receiving subscriptions
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: 280, overflowX: 'auto', overflowY: 'hidden', pb: 2 }}>
                      <Box sx={{ minWidth: `${Math.max(600, getRevenueChartData().length * 80)}px`, height: '100%', position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 50,
                            width: '60px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            pr: 1,
                          }}
                        >
                          {[100, 75, 50, 25, 0].map((percent) => (
                            <Typography
                              key={percent}
                              sx={{
                                color: '#6b7280',
                                fontSize: '11px',
                                fontWeight: 500,
                              }}
                            >
                              B$ {Math.round((getMaxRevenue() * percent) / 100).toLocaleString()}
                            </Typography>
                          ))}
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            left: '70px',
                            right: 0,
                            top: 0,
                            bottom: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                height: '1px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }}
                            />
                          ))}
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            left: '70px',
                            right: 0,
                            top: 0,
                            bottom: 50,
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 2,
                            pb: 1,
                          }}
                        >
                          {getRevenueChartData().map((item, index) => {
                            const maxRevenue = getMaxRevenue();
                            const totalHeightPercent = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;
                            const recurringHeightPercent = maxRevenue > 0 ? (item.recurringRevenue / maxRevenue) * 100 : 0;
                            const oneTimeHeightPercent = maxRevenue > 0 ? (item.oneTimeRevenue / maxRevenue) * 100 : 0;

                            return (
                              <Box
                                key={index}
                                sx={{
                                  flex: 1,
                                  minWidth: '60px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 1,
                                  position: 'relative',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover .revenue-tooltip': {
                                      opacity: 1,
                                      visibility: 'visible',
                                    },
                                  }}
                                >
                                  <Box
                                    className="revenue-tooltip"
                                    sx={{
                                      position: 'absolute',
                                      bottom: '100%',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      backgroundColor: '#1f1f1f',
                                      border: '1px solid #2563eb',
                                      borderRadius: '8px',
                                      p: 1.5,
                                      mb: 1,
                                      opacity: 0,
                                      visibility: 'hidden',
                                      transition: 'all 0.2s',
                                      whiteSpace: 'nowrap',
                                      zIndex: 10,
                                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                    }}
                                  >
                                    <Typography sx={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, mb: 0.5 }}>
                                      {formatRevenueDate(item.date)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                        <Typography sx={{ color: '#2563eb', fontSize: '11px' }}>Total:</Typography>
                                        <Typography sx={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>
                                          B$ {item.totalRevenue.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                        <Typography sx={{ color: '#10b981', fontSize: '10px' }}>Recurring:</Typography>
                                        <Typography sx={{ color: '#e5e7eb', fontSize: '10px' }}>
                                          B$ {item.recurringRevenue.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                        <Typography sx={{ color: '#f59e0b', fontSize: '10px' }}>One-Time:</Typography>
                                        <Typography sx={{ color: '#e5e7eb', fontSize: '10px' }}>
                                          B$ {item.oneTimeRevenue.toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: `${totalHeightPercent}%`,
                                      backgroundColor: '#2563eb',
                                      borderRadius: '4px 4px 0 0',
                                      position: 'relative',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        backgroundColor: '#1d4ed8',
                                      },
                                    }}
                                  >
                                    {recurringHeightPercent > 0 && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                          height: `${(recurringHeightPercent / totalHeightPercent) * 100}%`,
                                          backgroundColor: '#10b981',
                                          borderRadius: oneTimeHeightPercent === 0 ? '4px 4px 0 0' : '0',
                                        }}
                                      />
                                    )}

                                    {oneTimeHeightPercent > 0 && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          height: `${(oneTimeHeightPercent / totalHeightPercent) * 100}%`,
                                          backgroundColor: '#f59e0b',
                                          borderRadius: '4px 4px 0 0',
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>

                                <Typography
                                  sx={{
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                  }}
                                >
                                  B$ {item.totalRevenue.toLocaleString()}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            left: '70px',
                            right: 0,
                            bottom: 0,
                            height: '45px',
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            pt: 1,
                          }}
                        >
                          {getRevenueChartData().map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                flex: 1,
                                minWidth: '60px',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: '#9ca3af',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                }}
                              >
                                {formatRevenueDate(item.date)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Card>
              </>
            )}
          </Box>
        )}
      </Card>

      {/* Row 4: Exclusive Content - KEEPING IT SHORT DUE TO LENGTH */}
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
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 700,
            mb: 3,
          }}
        >
          Exclusive Content
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Tabs
            value={contentTab}
            onChange={(e, newValue) => setContentTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563eb',
              },
              '& .MuiTab-root': {
                color: '#9ca3af',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#2563eb',
                },
              },
            }}
          >
            <Tab label="Posts" />
            <Tab label="Live Streams" />
            <Tab label="Reels" />
            <Tab label="Stories" />
          </Tabs>
        </Box>

        {contentTab === 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {getFilteredContent('POST').length === 0 ? (
              <Typography
                sx={{
                  color: '#6b7280',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  py: 3,
                  gridColumn: '1 / -1',
                }}
              >
                No posts available
              </Typography>
            ) : (
              getFilteredContent('POST').map((post, index) => (
                <Box
                  key={post.postId}
                  sx={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Media Display - Check if VIDEO or PHOTO */}
                  {post.postType === 'VIDEO' ? (
                    <Box
                      sx={{
                        height: 180,
                        backgroundColor: '#000000',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <video
                        src={post.mediaUrl}
                        controls
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '4px',
                          px: 1,
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <MovieIcon sx={{ fontSize: '14px', color: '#ffffff' }} />
                        <Typography sx={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>
                          VIDEO
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        background: post.mediaUrl
                          ? `url(${post.mediaUrl}) center/cover`
                          : getGradientForIndex(index),
                        position: 'relative',
                      }}
                    >
                      {post.postType === 'PHOTO' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '4px',
                            px: 1,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CameraAltIcon sx={{ fontSize: '14px', color: '#ffffff' }} />
                          <Typography sx={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>
                            PHOTO
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Box sx={{ p: 2.5 }}>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 600,
                        mb: 0.75,
                      }}
                    >
                      {post.title || post.description || 'Untitled Post'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        sx={{
                          color: '#6b7280',
                          fontSize: '12px',
                        }}
                      >
                        {formatTimeAgo(post.createdAt)}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {formatViewCount(post.totalViewCount)}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {post.likeCount} likes
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Similar structure for other tabs - keeping concise due to character limit */}
        {contentTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {getFilteredContent('LIVE').length === 0 ? (
              <Typography sx={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                No live streams available
              </Typography>
            ) : (
              getFilteredContent('LIVE').map((stream) => (
                <Box key={stream.postId} sx={{ display: 'flex', gap: 2.5, p: 2.5, backgroundColor: '#1f1f1f', borderRadius: '10px' }}>
                  {/* Stream content */}
                </Box>
              ))
            )}
          </Box>
        )}

        {contentTab === 2 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {getFilteredContent('REEL').length === 0 ? (
              <Typography sx={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', py: 3, gridColumn: '1 / -1' }}>
                No reels available
              </Typography>
            ) : (
              getFilteredContent('REEL').map((reel) => (
                <Box key={reel.postId}>
                  {/* Reel content */}
                </Box>
              ))
            )}
          </Box>
        )}

        {contentTab === 3 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {getFilteredContent('STORY').length === 0 ? (
              <Typography sx={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', py: 3, gridColumn: '1 / -1' }}>
                No stories available
              </Typography>
            ) : (
              getFilteredContent('STORY').map((story) => (
                <Box key={story.postId}>
                  {/* Story content */}
                </Box>
              ))
            )}
          </Box>
        )}
      </Card>

      {/* Settings Modal - keeping concise */}
      <Dialog
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
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
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          Subscription Settings
          <IconButton
            onClick={() => setSettingsModalOpen(false)}
            sx={{
              color: '#9ca3af',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          {/* Enable Subscriptions Toggle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              pb: 2.5,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Enable Subscriptions
            </Typography>
            <Switch
              checked={enableSubscriptions}
              onChange={(e) => setEnableSubscriptions(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2563eb',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2563eb',
                },
              }}
            />
          </Box>

          {/* Subscription Notifications Toggle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              pb: 2.5,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Subscription Notifications
            </Typography>
            <Switch
              checked={subscriptionNotifications}
              onChange={(e) => setSubscriptionNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2563eb',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2563eb',
                },
              }}
            />
          </Box>

          {/* Auto-renewal Toggle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              pb: 2.5,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Auto-renewal
            </Typography>
            <Switch
              checked={autoRenewal}
              onChange={(e) => setAutoRenewal(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2563eb',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2563eb',
                },
              }}
            />
          </Box>

          {/* Welcome Message for New Subscribers */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                mb: 2,
              }}
            >
              Welcome Message for New Subscribers
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Enter welcome message..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  fontSize: '14px',
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
                  color: '#ffffff',
                },
              }}
            />
          </Box>

          {/* Subscription Benefits */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Subscription Benefits
            </Typography>

            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '13px',
                mb: 2,
              }}
            >
              Select one or more benefits from the list
            </Typography>

            <BenefitsSelect
              fanFeatures={fanFeatures}
              benefits={benefits}
              setBenefits={setBenefits}
            />
          </Box>

          {/* Minimum Subscription Period */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                mb: 2,
              }}
            >
              Minimum Subscription Period
            </Typography>
            <Select
              fullWidth
              value={minimumPeriod}
              onChange={(e) => setMinimumPeriod(e.target.value)}
              sx={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563eb',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#2a2a2a',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="1">1 month</MenuItem>
              <MenuItem value="3">3 months</MenuItem>
              <MenuItem value="6">6 months</MenuItem>
              <MenuItem value="12">12 months</MenuItem>
            </Select>
          </Box>

          {/* Free Trial Period */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                mb: 2,
              }}
            >
              Free Trial Period
            </Typography>
            <Select
              fullWidth
              value={freeTrialPeriod}
              onChange={(e) => setFreeTrialPeriod(e.target.value)}
              sx={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563eb',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#2a2a2a',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="0">No trial</MenuItem>
              <MenuItem value="3">3 days</MenuItem>
              <MenuItem value="7">7 days</MenuItem>
              <MenuItem value="14">14 days</MenuItem>
            </Select>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              onClick={() => setSettingsModalOpen(false)}
              sx={{
                backgroundColor: 'transparent',
                color: '#9ca3af',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              sx={{
                backgroundColor: '#84cc16',
                color: '#ffffff',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#65a30d',
                },
              }}
            >
              Save Settings
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}