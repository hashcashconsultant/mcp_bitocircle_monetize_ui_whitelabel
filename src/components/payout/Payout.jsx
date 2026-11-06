'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Switch,
    CircularProgress,
    Menu,
    MenuItem,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import apiClient from '../utils/apiClient';
import CustomSnackbar from '../utils/CustomSnackbar';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie';
import WHITELABEL from '@/config/whitelabel';


const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/payouts';
const TAX_API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/tax';


// Quarter date ranges based on fiscal year
const QUARTERS = [
    {
        id: 1,
        name: 'Q1 Statement',
        label: 'Q1 (Apr-Jun)',
        startDate: '01/04',
        endDate: '30/06',
        description: 'April 1 to June 30'
    },
    {
        id: 2,
        name: 'Q2 Statement',
        label: 'Q2 (Jul-Sep)',
        startDate: '01/07',
        endDate: '30/09',
        description: 'July 1 to September 30'
    },
    {
        id: 3,
        name: 'Q3 Statement',
        label: 'Q3 (Oct-Dec)',
        startDate: '01/10',
        endDate: '31/12',
        description: 'October 1 to December 31'
    },
    {
        id: 4,
        name: 'Q4 Statement',
        label: 'Q4 (Jan-Mar)',
        startDate: '01/01',
        endDate: '31/03',
        description: 'January 1 to March 31'
    }
];

// The statement card for the current financial quarter (Apr-Mar year), e.g. "Q3 Statement, Oct 1, 2026".
const currentQuarterDocument = () => {
    const now = new Date();
    const month = now.getMonth(); // 0 = January
    const quarterId = month >= 3 && month <= 5 ? 1 : month >= 6 && month <= 8 ? 2 : month >= 9 ? 3 : 4;
    const quarter = QUARTERS.find((q) => q.id === quarterId);
    const [day, monthNumber] = quarter.startDate.split('/').map(Number);
    const start = new Date(now.getFullYear(), monthNumber - 1, day);
    return {
        id: 2,
        name: quarter.name,
        date: start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        icon: '📊',
        iconBg: '#374151',
        type: 'quarter',
        quarterId,
    };
};

export default function PayoutPage() {
    const [isLoading, setLoading] = useState(false);
    const [isUploadingW9, setIsUploadingW9] = useState(false);
    const [isDownloading1099, setIsDownloading1099] = useState(false);
    const [isDownloadingStatement, setIsDownloadingStatement] = useState(false);
    const[isExportingStatement, setIsExportingStatement] = useState(false);
    const fileInputRef = useRef(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // Quarter menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedQuarter, setSelectedQuarter] = useState(QUARTERS[2]); // Default to Q3

    // Tax & Compliance toggles
    const [taxGeneration1099, setTaxGeneration1099] = useState(false);
    const [quickBooksIntegration, setQuickBooksIntegration] = useState(false);
    const [cryptoTaxTracking, setCryptoTaxTracking] = useState(true);

    // Tax Form Status
    const [taxFormStatus, setTaxFormStatus] = useState({
        hasForm: false,
        message: 'No Form W-9 submitted',
        errorCode: null,
        statusText: 'Not Submitted',
        statusColor: '#ef4444',
        submittedDate: null,
    });

    const [taxAutomationCap, setTaxAutomationCap] = useState(600); // Default cap
    // State for API data
    const [totalBalance, setTotalBalance] = useState(0);

    const [revenueBreakdown, setRevenueBreakdown] = useState([
        {
            id: 1,
            label: 'Ad Revenue',
            txnType: 'AD_REVENUE',
            amount: 'B$ 0',
            icon: '💰',
            iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            status: 'Available',
        },
        {
            id: 2,
            label: 'Subscriptions',
            txnType: 'SUBSCRIPTIONS',
            amount: 'B$ 0',
            icon: '⭐',
            iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            status: 'Available',
        },
        {
            id: 3,
            label: 'Merchandise',
            txnType: 'MERCHANDISE',
            amount: 'B$ 0',
            icon: '🎁',
            iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            status: 'Available',
        },
        {
            id: 4,
            label: 'Collabs',
            txnType: 'COLLABS',
            amount: 'B$ 0',
            icon: '🤝',
            iconBg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
            status: 'Available',
        },
        {
            id: 5,
            label: 'Gifts & Badges',
            txnType: 'GIFTS_BADGES',
            amount: 'B$ 0',
            icon: '🎀',
            iconBg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            status: 'Available',
        },
    ]);

    const [statsData, setStatsData] = useState([
        {
            id: 1,
            label: 'LIFETIME EARNINGS',
            value: 'B$ 0',
            subLabel: '↑ All time',
            subLabelColor: '#22c55e',
        },
        {
            id: 2,
            label: 'PLATFORM FEES',
            value: 'B$ 0.00',
            subLabel: 'Zero fees!',
            subLabelColor: '#22c55e',
        },
    ]);

    const [taxDocuments, setTaxDocuments] = useState([
        {
            id: 1,
            name: '1099-K Form',
            date: 'Generated Jan 15, 2025',
            icon: '📄',
            iconBg: '#374151',
            type: '1099'
        },
        currentQuarterDocument(),
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
    const getCreatorUuid = () => {
        const creatorUuid = Cookies.get('paybito_launch_platform_uuid') || localStorage.getItem('uuid');
        if (!creatorUuid) {
            showSnackbar(`Creator UUID not found. Please go back to ${WHITELABEL.brandName}`, 'warning');
            return null;
        }
        return creatorUuid;
    };

    // Helper function to format txnType for display
    const formatTxnTypeLabel = (txnType) => {
        const labels = {
            'AD_REVENUE': 'Ad Revenue',
            'SUBSCRIPTIONS': 'Subscriptions',
            'MERCHANDISE': 'Merchandise',
            'COLLABS': 'Collaborations',
            'GIFTS_BADGES': 'Gifts & Badges',
        };
        return labels[txnType] || txnType;
    };

    // Helper function to format date
    const formatSubmittedDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (error) {
            return 'Recently';
        }
    };

    // Helper function to format timestamp for Excel
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timestamp;
        }
    };

    // Get current year for quarter statements
    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    // Get quarter date range for API
    const getQuarterDateRange = (quarter) => {
        const currentYear = getCurrentYear();
        return `${quarter.startDate}/${currentYear}`;
    };

    // Fetch Tax Form Status
    const fetchTaxFormStatus = async () => {
        const userId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!userId) return;

        try {
            const response = await apiClient.get(`${TAX_API_BASE_URL}/user/${userId}?adminUser=${adminUser}`);

            const success = response?.data?.success;
            const message = response?.data?.message;
            const data = response?.data?.data;

            if(!success){
                showSnackbar(message, 'error');
                return;
            }
            // MonetizeService answers the form status in `message` (NOT_SUBMITTED, PENDING, VERIFIED, REJECTED);
            // `data` is null when nothing was submitted, otherwise the list of submitted forms.
            if (message) {
                // Handle different status messages
                switch (message) {
                    case 'VERIFIED':
                        // Form is verified and valid
                        setTaxFormStatus({
                            hasForm: true,
                            message: 'Form W-9 verified successfully',
                            errorCode: null,
                            statusText: 'W-9 Verified • No withholding applied',
                            statusColor: '#22c55e',
                            submittedDate: data?.[0]?.submittedAt ? formatSubmittedDate(data[0].submittedAt) : null,
                        });
                        // Enable 1099 generation toggle only when verified
                        setTaxGeneration1099(true);
                        break;

                    case 'PENDING':
                        // Form submitted but pending verification
                        setTaxFormStatus({
                            hasForm: true,
                            message: 'Form W-9 under review',
                            errorCode: null,
                            statusText: 'Pending Verification • Under Review',
                            statusColor: '#f59e0b',
                            submittedDate: data?.[0]?.submittedAt ? formatSubmittedDate(data[0].submittedAt) : null,
                        });
                        // Disable 1099 generation toggle when pending
                        setTaxGeneration1099(false);
                        break;

                    case 'REJECTED':
                        // Form was rejected
                        setTaxFormStatus({
                            hasForm: false,
                            message: 'Form W-9 was rejected',
                            errorCode: 'REJECTED',
                            statusText: 'Rejected • Resubmission Required',
                            statusColor: '#ef4444',
                            submittedDate: data?.[0]?.submittedAt ? formatSubmittedDate(data[0].submittedAt) : null,
                        });
                        // Disable 1099 generation toggle when rejected
                        setTaxGeneration1099(false);
                        break;

                    case 'NOT_SUBMITTED':
                    default:
                        // Form not submitted
                        setTaxFormStatus({
                            hasForm: false,
                            message: 'No Form W-9 submitted',
                            errorCode: 'NOT_SUBMITTED',
                            statusText: 'Not Submitted • Upload Required',
                            statusColor: '#ef4444',
                            submittedDate: null,
                        });
                        // Disable 1099 generation toggle when not submitted
                        setTaxGeneration1099(false);
                        break;
                }
            } else {
                // Fallback for unsuccessful response
                setTaxFormStatus({
                    hasForm: false,
                    message: 'Form status unknown',
                    errorCode: null,
                    statusText: 'Error Loading Status',
                    statusColor: '#ef4444',
                    submittedDate: null,
                });
                setTaxGeneration1099(false);
            }
        } catch (error) {
            console.error('Error fetching tax form status:', error);
            setTaxFormStatus({
                hasForm: false,
                message: 'Failed to fetch tax form status',
                errorCode: null,
                statusText: 'Error Loading Status',
                statusColor: '#ef4444',
                submittedDate: null,
            });
            setTaxGeneration1099(false);
        }
    };

    // Handle W-9 Form Upload
    const handleUploadW9Form = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const userId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!userId) return;

        setIsUploadingW9(true);
        try {
            // Create FormData
            const formData = new FormData();
            formData.append('request', JSON.stringify({
                userId: userId,
                taxFormType: 'W9'
            }));
            formData.append('files', file);

            const response = await apiClient.post(`${TAX_API_BASE_URL}/w9?adminUser=${adminUser}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const success = response?.data?.success;
            if (success) {
                showSnackbar(response.data.message || 'Form W-9 uploaded successfully!', 'success');
                // Refresh tax form status after successful upload
                await fetchTaxFormStatus();
            } else {
                showSnackbar(response.data.message || 'Failed to upload Form W-9', 'error');
            }
        } catch (error) {
            console.error('Error uploading W-9 form:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to upload Form W-9.',
                'error'
            );
        } finally {
            setIsUploadingW9(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Quarter menu handlers
    const handleQuarterMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleQuarterMenuClose = () => {
        setAnchorEl(null);
    };

    const handleQuarterSelect = (quarter) => {
        setSelectedQuarter(quarter);
        handleQuarterMenuClose();
    };

    // Export Quarter Statement Handler
    const handleExportQuarterStatement = async (quarter) => {
        const creatorId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!creatorId) return;

        setIsDownloadingStatement(true);
        try {
            // Get date range for the selected quarter
            const dateRange = getQuarterDateRange(quarter);

            const response = await apiClient.get(
                `${API_BASE_URL}/statement/export?creatorId=${creatorId}&dateRange=${dateRange}&adminUser=${adminUser}`
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to export statement', 'error');
                return;
            }

            const data = response.data.data || [];
            console.log(`Quarter Statement Data for ${quarter.label}:`, data);

            if (data.length === 0) {
                showSnackbar(`No data available for ${quarter.label} ${getCurrentYear()}`, 'warning');
                return;
            }

            // Calculate total
            const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);

            // Format data for Excel with proper headers
            const formattedData = data.map((item) => ({
                'Revenue Source': formatTxnTypeLabel(item.txnType),
                'Amount (B$)': item.amount || 0,
                'Status': item.revenueBreakDownStatus || 'N/A',
            }));

            // Add total row
            formattedData.push({
                'Revenue Source': 'TOTAL',
                'Amount (B$)': totalAmount,
                'Status': '',
            });

            // Create worksheet from data
            const ws = XLSX.utils.json_to_sheet(formattedData);

            // Set column widths
            ws['!cols'] = [
                { wch: 20 }, // Revenue Source
                { wch: 15 }, // Amount
                { wch: 15 }, // Status
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Quarter Statement');

            // Generate filename with quarter and year
            const filename = `${quarter.name}_${quarter.description.replace(/\s+/g, '_')}_${getCurrentYear()}.xls`;

            // Download the file in XLS format
            XLSX.writeFile(wb, filename, { bookType: 'xls' });

            showSnackbar(`${quarter.label} statement exported successfully!`, 'success');
        } catch (error) {
            console.error(`Error exporting ${quarter.label} statement:`, error);
            showSnackbar(
                error.response?.data?.message || error.message || `Failed to export ${quarter.label} statement.`,
                'error'
            );
        } finally {
            setIsDownloadingStatement(false);
        }
    };

    // Fetch revenue breakdown and calculate total balance
    const fetchRevenueBreakdown = async () => {
        const creatorId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/revenue-breakdown?creatorId=${creatorId}&rangeDays=30D&adminUser=${adminUser}`
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to fetch revenue breakdown', 'error');
                return;
            }

            const data = response.data.data || [];
            console.log('Revenue Breakdown:', data);

            // Calculate total balance by summing all amounts
            const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
            setTotalBalance(total);

            // Update revenue breakdown with API data
            const updatedBreakdown = revenueBreakdown.map((item) => {
                const apiData = data.find((r) => r.txnType === item.txnType);
                if (apiData) {
                    return {
                        ...item,
                        amount: `B$ ${apiData.amount || 0}`,
                        status: apiData.revenueBreakDownStatus === 'AVAILABLE' ? 'Available' : apiData.revenueBreakDownStatus,
                    };
                }
                return item;
            });
            setRevenueBreakdown(updatedBreakdown);
        } catch (error) {
            console.error('Error fetching revenue breakdown:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load revenue breakdown.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch lifetime earnings and platform fees
    const fetchLifetimeEarningsPlatformFees = async () => {
        const creatorId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!creatorId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(
                `${API_BASE_URL}/lifetime-earnings/platform-fees?creatorId=${creatorId}&adminUser=${adminUser}`
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to fetch earnings data', 'error');
                return;
            }

            const data = response.data.data;
            console.log('Lifetime Earnings & Platform Fees:', data);

            if (data && data.length > 0) {
                const earningsData = data[0];

                // Update stats data
                setStatsData([
                    {
                        id: 1,
                        label: 'LIFETIME EARNINGS',
                        value: `B$ ${earningsData.revenue || 0}`,
                        subLabel: '↑ All time',
                        subLabelColor: '#22c55e',
                    },
                    {
                        id: 2,
                        label: 'PLATFORM FEES',
                        value: `B$ ${(earningsData.amount || 0).toFixed(2)}`,
                        subLabel: earningsData.amount === 0 || earningsData.amount === null ? 'Zero fees!' : 'Applied',
                        subLabelColor: earningsData.amount === 0 || earningsData.amount === null ? '#22c55e' : '#f59e0b',
                    },
                ]);
            }
        } catch (error) {
            console.error('Error fetching lifetime earnings & platform fees:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to load earnings data.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle 1099-K Form Download
    const handleDownload1099K = async () => {
        const creatorId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!creatorId) return;

        setIsDownloading1099(true);
        try {
            const response = await apiClient.get(
                `${TAX_API_BASE_URL}/report1099k?creatorId=${creatorId}&adminUser=${adminUser}`
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to generate 1099-K report', 'error');
                return;
            }

            const data = response.data.data || [];
            console.log('1099-K Report Data:', data);

            if (data.length === 0) {
                showSnackbar('No 1099-K data available for the current year', 'warning');
                return;
            }

            // Calculate total credit amount
            const totalCredit = data.reduce((sum, item) => sum + (item.creditAmount || 0), 0);

            // Format data for Excel
            const formattedData = data.map((item) => ({
                'Customer ID': item.customerId || 'N/A',
                'Credit Amount (B$)': item.creditAmount || 0,
                'Transaction Date': formatTimestamp(item.transactionTimestamp),
            }));

            // Add summary row
            formattedData.push({
                'Customer ID': 'TOTAL',
                'Credit Amount (B$)': totalCredit,
                'Transaction Date': '',
            });

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(formattedData);

            // Set column widths
            ws['!cols'] = [
                { wch: 15 }, // Customer ID
                { wch: 20 }, // Credit Amount
                { wch: 25 }, // Transaction Date
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '1099-K Report');

            // Generate filename with current year
            const currentYear = new Date().getFullYear();
            const filename = `1099-K_Form_${currentYear}.xls`;

            // Download the file in XLS format
            XLSX.writeFile(wb, filename, { bookType: 'xls' });

            showSnackbar('1099-K report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading 1099-K report:', error);
            showSnackbar(
                error.response?.data?.message || error.message || 'Failed to download 1099-K report.',
                'error'
            );
        } finally {
            setIsDownloading1099(false);
        }
    };

    // Handle document download
    const handleDownloadDocument = async (document) => {
        // Check document type
        if (document.name === '1099-K Form') {
            await handleDownload1099K();
        } else if (document.type === 'quarter') {
            // Find the quarter based on quarterId
            const quarter = QUARTERS.find(q => q.id === document.quarterId);
            if (quarter) {
                await handleExportQuarterStatement(quarter);
            } else {
                showSnackbar('Quarter not found', 'error');
            }
        } else if (document.downloadUrl) {
            window.open(document.downloadUrl, '_blank');
        } else {
            showSnackbar('Download not available for this document', 'warning');
        }
    };

    // Single Export Statement Handler (uses current date)
    const handleExportStatement = async () => {
        const creatorId = getCreatorId();
        const adminUser = getCreatorUuid();
        if (!creatorId) return;

        setIsExportingStatement(true);
        try {
            // Get current date in DD/MM/YYYY format
            const currentDate = new Date();
            const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

            const response = await apiClient.get(
                `${API_BASE_URL}/statement/export?creatorId=${creatorId}&dateRange=${formattedDate}&adminUser=${adminUser}`
            );

            const success = response?.data?.success;
            if (!success) {
                showSnackbar(response.data.message || 'Failed to export statement', 'error');
                return;
            }

            const data = response.data.data || [];
            console.log(`Statement Data for ${formattedDate}:`, data);

            if (data.length === 0) {
                showSnackbar(`No data available for ${formattedDate}`, 'warning');
                return;
            }

            // Calculate total
            const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);

            // Format data for Excel with proper headers
            const formattedData = data.map((item) => ({
                'Revenue Source': formatTxnTypeLabel(item.txnType),
                'Amount (B$)': item.amount || 0,
                'Status': item.revenueBreakDownStatus || 'N/A',
            }));

            // Add total row
            formattedData.push({
                'Revenue Source': 'TOTAL',
                'Amount (B$)': totalAmount,
                'Status': '',
            });

            // Create worksheet from data
            const ws = XLSX.utils.json_to_sheet(formattedData);

            // Set column widths
            ws['!cols'] = [
                { wch: 20 }, // Revenue Source
                { wch: 15 }, // Amount
                { wch: 15 }, // Status
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Statement');

            // Generate filename with current date
            const dateForFilename = formattedDate.replace(/\//g, '-');
            const filename = `Statement_${dateForFilename}.xls`;

            // Download the file in XLS format
            XLSX.writeFile(wb, filename, { bookType: 'xls' });

            showSnackbar(`Statement for ${formattedDate} exported successfully!`, 'success');
        } catch (error) {
            console.error(`Error exporting statement:`, error);
            showSnackbar(
                error.response?.data?.message || error.message || `Failed to export statement.`,
                'error'
            );
        } finally {
            setIsExportingStatement(false);
        }
    };

    // Load all data on component mount
    useEffect(() => {
        const loadAllData = async () => {
            await Promise.all([
                fetchRevenueBreakdown(),
                fetchLifetimeEarningsPlatformFees(),
                fetchTaxFormStatus(),
            ]);
        };
        loadAllData();
    }, []);

    // Helper function to determine if form is in a verified state
    const isFormVerified = taxFormStatus.message === 'Form W-9 verified successfully';

    // Plain-language guidance for each W-9 stage, shown under the Tax Form Status row.
    const taxGuidance = (() => {
        switch (taxFormStatus.message) {
            case 'Form W-9 verified successfully':
                return 'Your tax details are verified. Payouts are released without withholding, and your annual Form 1099-K is available to download below.';
            case 'Form W-9 under review':
                return 'Your Form W-9 has been received and is being reviewed. Once it is verified, payouts are released without withholding and your Form 1099-K becomes available.';
            case 'Form W-9 was rejected':
                return 'Your Form W-9 could not be verified. Please check the details and upload a corrected form to continue.';
            default:
                return 'How it works: 1) Upload your Form W-9. 2) It is reviewed and verified. 3) Once verified, payouts are released without withholding and your annual Form 1099-K becomes available to download.';
        }
    })();

    return (
        <Box sx={{ p: 3 }}>
            {/* Hidden file input for W-9 upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadW9Form}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
            />

            {/* Page Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '28px' }}>💳</Typography>
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontSize: '28px',
                            fontWeight: 700,
                        }}
                    >
                        Payouts Center
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        startIcon={<BarChartIcon />}
                        onClick={handleExportStatement}
                        disabled={isExportingStatement}
                        sx={{
                            backgroundColor: '#1f1f1f',
                            color: '#ffffff',
                            textTransform: 'none',
                            px: 2.5,
                            py: 1.25,
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                backgroundColor: '#2a2a2a',
                            },
                            '&:disabled': {
                                backgroundColor: '#1f1f1f',
                                color: '#666666',
                            },
                        }}
                    >
                        {isExportingStatement ? (
                            <>
                                <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                                Exporting...
                            </>
                        ) : 'Export Statement'}
                    </Button>
                </Box>
            </Box>

            {/* Total Available Balance Card */}
            <Card
                sx={{
                    backgroundColor: '#262626',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: 3,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            color: '#9ca3af',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            mb: 1.5,
                        }}
                    >
                        Total Available Balance
                    </Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <CircularProgress size={40} sx={{ color: '#22c55e' }} />
                        </Box>
                    ) : (
                        <Typography
                            sx={{
                                color: '#22c55e',
                                fontSize: '48px',
                                fontWeight: 700,
                                lineHeight: 1,
                                mb: 1.5,
                            }}
                        >
                            B$ {totalBalance}
                        </Typography>
                    )}
                </Box>

                {/* Revenue Breakdown Cards */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                        gap: 2,
                        mt: 4,
                    }}
                >
                    {revenueBreakdown.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                backgroundColor: '#1f1f1f',
                                borderRadius: '12px',
                                p: 2.5,
                                textAlign: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: item.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <Typography sx={{ fontSize: '24px' }}>{item.icon}</Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                {item.amount}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    mb: 0.5,
                                }}
                            >
                                {item.label}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#22c55e',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}
                            >
                                {item.status}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Card>

            {/* Stats Row - Only 2 Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                    mb: 3,
                }}
            >
                {statsData.map((stat) => (
                    <Card
                        key={stat.id}
                        sx={{
                            backgroundColor: '#262626',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            p: 3,
                            textAlign: 'center',
                        }}
                    >
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
                                color: '#9ca3af',
                                fontSize: '12px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                mb: 0.5,
                            }}
                        >
                            {stat.label}
                        </Typography>
                        <Typography
                            sx={{
                                color: stat.subLabelColor,
                                fontSize: '13px',
                                fontWeight: 500,
                            }}
                        >
                            {stat.subLabel}
                        </Typography>
                    </Card>
                ))}
            </Box>

            {/* Tax & Compliance Section */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Tax & Compliance Card */}
                <Card
                    sx={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: 3,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
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
                            Tax & Compliance
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                fontSize: '13px',
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '20px',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                            {'IRS Compliant'}
                        </Box>
                    </Box>

                    {/* Form W-9 Row */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#1f1f1f',
                            borderRadius: '10px',
                            p: 2,
                            mb: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '8px',
                                    backgroundColor: '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <DescriptionIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography
                                    sx={{
                                        color: '#ffffff',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Form W-9
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#9ca3af',
                                        fontSize: '13px',
                                    }}
                                >
                                    {taxFormStatus.submittedDate ? `Submitted ${taxFormStatus.submittedDate}` : 'Not Submitted'}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            onClick={handleUploadClick}
                            disabled={isUploadingW9}
                            startIcon={isUploadingW9 ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <UploadFileIcon />}
                            sx={{
                                backgroundColor: taxFormStatus.hasForm ? '#374151' : '#2563eb',
                                color: '#ffffff',
                                textTransform: 'none',
                                px: 2,
                                py: 0.75,
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '13px',
                                '&:hover': {
                                    backgroundColor: taxFormStatus.hasForm ? '#4b5563' : '#1d4ed8',
                                },
                                '&:disabled': {
                                    backgroundColor: '#374151',
                                    color: '#9ca3af',
                                },
                            }}
                        >
                            {isUploadingW9 ? 'Uploading...' : (taxFormStatus.hasForm ? 'Update' : 'Upload')}
                        </Button>
                    </Box>

                    {/* 0% Withholding Highlight */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
                            borderRadius: '10px',
                            p: 2.5,
                            mb: 2,
                            borderLeft: '3px solid #2563eb',
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#ffffff',
                                fontSize: '24px',
                                fontWeight: 700,
                                mb: 0.5,
                            }}
                        >
                            {'0% Withholding'}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#9ca3af',
                                fontSize: '14px',
                            }}
                        >
                            {isFormVerified
                                ? 'U.S. Creator with valid W-9 on file - No withholding required'
                                : 'Please upload Form W-9 to enable payouts and avoid withholding'
                            }
                        </Typography>
                    </Box>

                    {/* Tax Form Status Row - Updated to remove button and show status badge */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    mb: 0.5,
                                }}
                            >
                                Tax Form Status
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '13px',
                                }}
                            >
                                Current verification status
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: taxFormStatus.statusColor === '#22c55e'
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : taxFormStatus.statusColor === '#f59e0b'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                color: taxFormStatus.statusColor,
                                fontSize: '13px',
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                borderRadius: '8px',
                                border: taxFormStatus.statusColor === '#22c55e'
                                    ? '1px solid rgba(34, 197, 94, 0.3)'
                                    : taxFormStatus.statusColor === '#f59e0b'
                                        ? '1px solid rgba(245, 158, 11, 0.3)'
                                        : '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            {taxFormStatus.statusText}
                        </Box>
                    </Box>
                    <Typography sx={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, mt: -1, mb: 2 }}>
                        {taxGuidance}
                    </Typography>

                    {/* 1099 Generation Toggle - Disabled unless verified */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                }}
                            >
                                1099 Generation
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#9ca3af',
                                    fontSize: '13px',
                                }}
                            >
                                Automatic tax reporting ({'>'} B$ {taxAutomationCap}/yr)
                            </Typography>
                            {!isFormVerified && (
                                <Typography sx={{ color: '#f59e0b', fontSize: '12px', mt: 0.5 }}>
                                    Available once your Form W-9 is verified.
                                </Typography>
                            )}
                        </Box>
                        <Switch
                            checked={taxGeneration1099}
                            disabled={!isFormVerified}
                            onChange={(e) => {
                                if (isFormVerified) {
                                    setTaxGeneration1099(e.target.checked);
                                }
                            }}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#22c55e',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#22c55e',
                                },
                                '& .MuiSwitch-track': {
                                    backgroundColor: '#4b5563',
                                },
                                '& .MuiSwitch-switchBase.Mui-disabled': {
                                    color: '#6b7280',
                                },
                                '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                                    backgroundColor: '#374151',
                                },
                            }}
                        />
                    </Box>

                    {/* Regulatory Notice */}
                    <Box
                        sx={{
                            backgroundColor: '#1f1f1f',
                            borderRadius: '10px',
                            p: 2,
                            mt: 2,
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#9ca3af',
                                fontSize: '13px',
                                lineHeight: 1.6,
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                }}
                            >
                                Regulatory Notice:
                            </Typography>{' '}
                            Tax withholding is automatically calculated based on your submitted tax forms and residency
                            status. U.S. creators with valid W-9: 0% withholding. Non-U.S. creators: 0-30% based on W-8BEN and tax treaty
                            benefits.
                        </Typography>
                    </Box>
                </Card>

                {/* Tax Documents Card */}
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
                        Tax Documents
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {taxDocuments.map((doc) => {
                            const quarterInfo = doc.name.includes('Q') ? QUARTERS.find(q => q.id === doc.quarterId) : null;

                            return (
                                <Box
                                    key={doc.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: '#1f1f1f',
                                        borderRadius: '10px',
                                        p: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '10px',
                                                backgroundColor: doc.iconBg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '20px' }}>{doc.icon}</Typography>
                                        </Box>
                                        <Box sx={{ maxWidth: '200px' }}>
                                            <Typography
                                                sx={{
                                                    color: '#ffffff',
                                                    fontSize: '15px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {doc.name} {doc.name === '1099-K Form' ? `(${getCurrentYear()})` : ''}
                                            </Typography>
                                            {doc.name === '1099-K Form' && (
                                                <Typography sx={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.3 }}>
                                                    {isFormVerified
                                                        ? 'Annual summary of your payments for tax filing.'
                                                        : 'Available to download after your Form W-9 is verified.'}
                                                </Typography>
                                            )}
                                            {quarterInfo && (
                                                <Typography
                                                    sx={{
                                                        color: '#9ca3af',
                                                        fontSize: '13px',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {doc.date}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Button
                                        onClick={() => handleDownloadDocument(doc)}
                                        disabled={
                                            (!isFormVerified && doc.name === '1099-K Form') ||
                                            (isDownloading1099 && doc.name === '1099-K Form') ||
                                            (isDownloadingStatement && doc.type === 'quarter')
                                        }
                                        startIcon={
                                            (isDownloading1099 && doc.name === '1099-K Form') ||
                                                (isDownloadingStatement && doc.type === 'quarter') ?
                                                <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : null
                                        }
                                        sx={{
                                            backgroundColor: '#374151',
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.75,
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            '&:hover': {
                                                backgroundColor: '#4b5563',
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#2a2a2a',
                                                color: '#6b7280',
                                                cursor: 'not-allowed',
                                            },
                                        }}
                                    >
                                        {(isDownloading1099 && doc.name === '1099-K Form') ||
                                            (isDownloadingStatement && doc.type === 'quarter')
                                            ? 'Downloading...'
                                            : 'Download'}
                                    </Button>
                                </Box>
                            );
                        })}
                    </Box>
                </Card>
            </Box>

            <CustomSnackbar
                open={snackbar.open}
                onClose={handleCloseSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
}