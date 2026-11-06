'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  TextField,
  Select,
  MenuItem,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  Pagination,
  InputAdornment,
  DialogTitle,
  Divider,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import apiClient from '../../components/utils/apiClient';
import CustomSnackbar from '../../components/utils/CustomSnackbar';
import { MAX_OFFER_PLACE_LIMIT } from '@/components/utils/constants';
import WHITELABEL from '@/config/whitelabel';


const API_BASE_URL =
  'https://institutional-bo.paybito.com:8443/MonetizeService/collab';

export default function CreatorCollaborationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('ALL');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [campaignDetailsModalOpen, setCampaignDetailsModalOpen] =
    useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);
  const [campaignDetailsLoading, setCampaignDetailsLoading] = useState(false);
  const [counterOfferDialogOpen, setCounterOfferDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterOfferData, setCounterOfferData] = useState({
    totalBudget: 0,
    startDate: '',
    endDate: '',
    kpiType: 'ENGAGEMENT',
    kpiTarget: '0',
    deliverables: [],
  });
  const [counterOfferLoading, setCounterOfferLoading] = useState(false);
  const [dealDetailsModalOpen, setDealDetailsModalOpen] = useState(false);
  const [selectedDealDetails, setSelectedDealDetails] = useState(null);
  const [dealDetailsLoading, setDealDetailsLoading] = useState(false);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [performanceSummaryLoading, setPerformanceSummaryLoading] =
    useState(false);
  const [topCampaignsLoading, setTopCampaignsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeDeals, setActiveDeals] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [activeDealsLoading, setActiveDealsLoading] = useState(false);
  const [completedDealsLoading, setCompletedDealsLoading] = useState(false);
  const [applyingCampaignId, setApplyingCampaignId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesPageNo, setMessagesPageNo] = useState(1);
  const [messagesPageSize] = useState(10);
  const chatContainerRef = useRef(null);

  const [applyNowDialogOpen, setApplyNowDialogOpen] = useState(false);
  const [selectedCampaignForApply, setSelectedCampaignForApply] = useState(null);
  const [campaignOffers, setCampaignOffers] = useState([]);
  const [campaignOffersLoading, setCampaignOffersLoading] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);
  const [invitationSubTab, setInvitationSubTab] = useState(0); // 0 = My Invitations, 1 = My Offers
  const [myOffers, setMyOffers] = useState([]);
  const [myOffersLoading, setMyOffersLoading] = useState(false);

  const shouldShowButtons = (offer) => {
    return offer.placedBy === 'BRAND';
  };

  const areButtonsDisabled = (offer) => {
    if (offer.placedBy !== 'BRAND') return false;

    // Disable if status is not PENDING
    if (offer.status !== 'PENDING') return true;

    // Check if offer has expired based on endDate
    if (offer.endDate && offer.status === 'PENDING') {
      const now = new Date();
      const expiry = new Date(offer.endDate);
      if (!isNaN(expiry.getTime()) && expiry.getTime() <= now.getTime()) {
        return true; // Offer has expired
      }
    }

    return false;
  };

  const fetchMyOffers = async () => {
    const creatorId = getCreatorId();
    setMyOffersLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/offers/${creatorId}`
      );

      if (response.data && response.data.success) {
        const data = response.data.data || [];

        if (!data || data.length === 0) {
          setMyOffers([]);
          return;
        }

        const transformedOffers = data.map((offer) => {
          let deliverables = [];
          if (typeof offer.deliverablesJson === 'string') {
            try {
              deliverables = JSON.parse(offer.deliverablesJson);
            } catch (e) {
              deliverables = [];
            }
          } else if (offer.deliverables) {
            deliverables = offer.deliverables;
          }

          if (!Array.isArray(deliverables)) deliverables = [];

          deliverables = deliverables.filter(
            (d) => d && (d.deliverableType || d.name)
          );

          return {
            offerId: offer.offerId,
            offerTimeLineId: offer.offerTimeLineId,
            brandId: offer.brandId,
            campaignId: offer.campaignId,
            creatorId: offer.creatorId,
            brandName: offer.brandName || `Brand #${offer.brandId}`,
            campaignName: offer.campaignName || offer.campaignId
              ? `Campaign #${offer.campaignId}`
              : 'Offer',
            totalBudget: offer.totalBudget || 0,
            startDate: offer.startDate,
            endDate: offer.endDate,
            kpiType: offer.kpiType || 'N/A',
            kpiTarget: offer.kpiTarget || 'N/A',
            status: offer.status || 'PENDING',
            placedBy: offer.placedBy || 'CREATOR',
            deliverables,
            message: offer.message || '',
            createdAt: offer.createdAt,
            expiresIn: calculateExpiresIn(offer.endDate),
          };
        });

        setMyOffers(transformedOffers);
      } else {
        setMyOffers([]);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load my offers.',
        'error'
      );
      setMyOffers([]);
    } finally {
      setMyOffersLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getCreatorId = () => {
    const creatorId = localStorage.getItem('childUserId');
    if (!creatorId) {
      showSnackbar(
        `Creator ID not found. Please go back to ${WHITELABEL.brandName}`,
        'warning'
      );
      return null;
    }
    return creatorId;
  };

  const fetchCampaignDetails = async (campaignId) => {
    setCampaignDetailsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${campaignId}/campaignDetails`
      );
      if (response.data && response.data.success) {
        const resultSet = response.data.data.R_RESULT_SET || [];
        const campaignData = resultSet.find(
          (item) => item.SECTION_TYPE === 'CAMPAIGN'
        );
        const deliverables = resultSet
          .filter((item) => item.SECTION_TYPE === 'DELIVERABLE')
          .map((item) => {
            const extraText = item.EXTRA_TEXT || '';
            const quantity = extraText.match(/QUANTITY=(\d+)/)?.[1] || '0';
            const pricePerUnit =
              extraText.match(/PRICE_PER_UNIT=(\d+)/)?.[1] || '0';
            return {
              type: item.EXTRA_JSON,
              quantity: parseInt(quantity),
              pricePerUnit: parseInt(pricePerUnit),
              total: parseInt(quantity) * parseInt(pricePerUnit),
            };
          });
        const tags = resultSet
          .filter((item) => item.SECTION_TYPE === 'TAG')
          .map((item) => item.EXTRA_JSON);
        setSelectedCampaignDetails({ ...campaignData, deliverables, tags });
        setCampaignDetailsModalOpen(true);
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch campaign details'
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load campaign details.',
        'error'
      );
    } finally {
      setCampaignDetailsLoading(false);
    }
  };

  const handleViewDetails = (campaign) => {
    fetchCampaignDetails(campaign.id);
  };

  const handleCloseCampaignDetails = () => {
    setCampaignDetailsModalOpen(false);
    setSelectedCampaignDetails(null);
  };

  // Updated function to fetch campaign offers for Apply Now dialog
  const fetchCampaignOffers = async (campaign) => {
    setCampaignOffersLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${campaign.id}/campaignDetails`
      );
      if (response.data && response.data.success) {
        const resultSet = response.data.data.R_RESULT_SET || [];

        // Find all OFFER sections
        const offers = resultSet
          .filter((item) => item.SECTION_TYPE === 'OFFER_TIMELINE' && item.STATUS === 'PENDING' && item.PLACED_BY === 'BRAND')
          .map((offerData) => {
            // Parse deliverables from EXTRA_JSON
            let deliverables = [];
            if (offerData.EXTRA_JSON) {
              try {
                deliverables = JSON.parse(offerData.EXTRA_JSON);
              } catch (e) {
                console.error('Failed to parse deliverables:', e);
              }
            }

            return {
              offerId: offerData.OFFER_ID,
              offerTimeLineId: offerData.OFFER_TIMELINE_ID,
              campaignId: offerData.CAMPAIGN_ID,
              brandId: offerData.BRAND_ID,
              creatorId: offerData.CREATOR_ID,
              totalBudget: offerData.TOTAL_BUDGET,
              startDate: offerData.START_DATE,
              endDate: offerData.END_DATE,
              kpiType: offerData.KPI_TYPE,
              kpiTarget: offerData.KPI_TARGET,
              status: offerData.STATUS,
              deliverables: deliverables,
              createdAt: offerData.CREATED_AT,
            };
          });

        if (offers.length === 0) {
          showSnackbar('No active offers found for this campaign.', 'info');
          return;
        }

        setCampaignOffers(offers);
        setApplyNowDialogOpen(true);

      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch campaign offers'
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load campaign offers.',
        'error'
      );
      setCampaignOffers([]);
    } finally {
      setCampaignOffersLoading(false);
    }
  };

  // Updated function to open Apply Now dialog
  const handleOpenApplyNowDialog = async (campaign) => {
    setSelectedCampaignForApply(campaign);
    setCampaignOffers([]);
    await fetchCampaignOffers(campaign);
  };

  // Function to close Apply Now dialog
  const handleCloseApplyNowDialog = () => {
    setApplyNowDialogOpen(false);
    setSelectedCampaignForApply(null);
    setCampaignOffers([]);
  };

  // Updated function to handle applying for an offer
  const handleApplyForOffer = async (offer) => {
    const creatorId = getCreatorId();
    const brandId = offer.brandId;

    if (!creatorId || !brandId) {
      return;
    }

    // Check if the offer has an offerId
    if (!offer.offerId) {
      showSnackbar(
        'This offer does not have a valid ID. Please contact support.',
        'warning'
      );
      return;
    }

    setAcceptingOfferId(offer.offerId);

    try {
      const payload = {
        offerId: offer.offerId,
        offerTimeLineId: offer.offerTimeLineId,
        brandId: parseInt(offer.brandId),
        creatorId: parseInt(offer.creatorId),
        campaignId: offer.campaignId
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/accept_offer`,
        payload
      );

      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        showSnackbar(
          'Application submitted successfully! The brand will review your application.',
          'success'
        );
        // Close dialog and refresh campaigns
        handleCloseApplyNowDialog();
        fetchCampaigns();
      } else {
        const errorMsg =
          response.data?.errorResponse?.errorMsg || 'Failed to apply for campaign';

        // Handle specific error cases
        if (errorMsg.toLowerCase().includes('insufficient fund')) {
          showSnackbar(
            'Insufficient funds in escrow. Please ensure you have adequate balance before applying.',
            'error'
          );
        } else if (errorMsg.toLowerCase().includes('already applied')) {
          showSnackbar(
            'You have already applied for this campaign.',
            'warning'
          );
        } else {
          showSnackbar(errorMsg, 'error');
        }
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.errorResponse?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to apply for campaign. Please try again.',
        'error'
      );
    } finally {
      setAcceptingOfferId(null);
    }
  };

  // Add this new function after handleApplyForOffer
  const handleAcceptCampaignInvitation = async (invitation) => {
    const creatorId = getCreatorId();

    if (!creatorId) {
      return;
    }

    if (!invitation.invitationId || !invitation.campaignId) {
      showSnackbar(
        'Invalid invitation data. Please contact support.',
        'warning'
      );
      return;
    }

    setApplyingCampaignId(invitation.campaignId);

    try {
      const payload = {
        campaignId: invitation.campaignId,
        creatorId: parseInt(creatorId),
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/accept_campaign?invitationId=${invitation.invitationId}`,
        payload
      );

      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        showSnackbar(
          'Campaign invitation accepted successfully! The brand will review your application.',
          'success'
        );
        // Refresh invitations list
        fetchInvitations();
      } else {
        const errorMsg =
          response.data?.errorResponse?.errorMsg || 'Failed to accept campaign invitation';

        // Handle specific error cases
        if (errorMsg.toLowerCase().includes('insufficient fund')) {
          showSnackbar(
            'Insufficient funds in escrow. Please ensure you have adequate balance before applying.',
            'error'
          );
        } else if (errorMsg.toLowerCase().includes('already accepted')) {
          showSnackbar(
            'You have already accepted this campaign invitation.',
            'warning'
          );
        } else {
          showSnackbar(errorMsg, 'error');
        }
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.errorResponse?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to accept campaign invitation. Please try again.',
        'error'
      );
    } finally {
      setApplyingCampaignId(null);
    }
  };

  // Add this new function to handle applying from Discover Campaigns tab
const handleApplyCampaignFromDiscoverTab = async (campaign) => {
  const creatorId = getCreatorId();
  
  if (!creatorId) {
    return;
  }

  if (!campaign.campaignId) {
    showSnackbar(
      'Invalid campaign data. Please try again.',
      'warning'
    );
    return;
  }

  setApplyingCampaignId(campaign.campaignId);

  try {
    const payload = {
      campaignId: campaign.campaignId,
      creatorId: parseInt(creatorId),
    };

    // For Discover Campaigns tab, always use invitationId=0
    const response = await apiClient.post(
      `${API_BASE_URL}/creator/accept_campaign?invitationId=0`,
      payload
    );

    if (
      response.data &&
      response.data.errorResponse &&
      response.data.errorResponse.errorData === 0
    ) {
      showSnackbar(
        'Campaign application submitted successfully! The brand will review your application.',
        'success'
      );
      // Refresh campaigns list
      fetchCampaigns();
    } else {
      const errorMsg =
        response.data?.errorResponse?.errorMsg || 'Failed to apply for campaign';

      // Handle specific error cases
      if (errorMsg.toLowerCase().includes('insufficient fund')) {
        showSnackbar(
          'Insufficient funds in escrow. Please ensure you have adequate balance before applying.',
          'error'
        );
      } else if (errorMsg.toLowerCase().includes('already accepted') || errorMsg.toLowerCase().includes('already applied')) {
        showSnackbar(
          'You have already applied for this campaign.',
          'warning'
        );
      } else {
        showSnackbar(errorMsg, 'error');
      }
    }
  } catch (error) {
    showSnackbar(
      error.response?.data?.errorResponse?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to apply for campaign. Please try again.',
      'error'
    );
  } finally {
    setApplyingCampaignId(null);
  }
};

  const handleAcceptOffer = async (offer) => {
    const creatorId = getCreatorId();
    const brandId = offer.brandId;

    if (!creatorId || !brandId) {
      return;
    }

    // Check if the offer has an offerTimeLineId
    if (!offer.offerTimeLineId) {
      showSnackbar(
        'This offer does not have a valid timeline ID. Please contact support.',
        'warning'
      );
      return;
    }

    try {
      const payload = {
        offerTimeLineId: offer.offerTimeLineId,
        brandId: parseInt(brandId),
        creatorId: parseInt(creatorId),
        campaignId: offer.campaignId
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/accept_offer`,
        payload
      );

      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        showSnackbar(
          'Offer accepted successfully! The brand has been notified.',
          'success'
        );
        if (invitationSubTab === 0) {
          fetchInvitations();
        } else {
          fetchMyOffers();
        }
      } else {
        const errorMsg =
          response.data?.errorResponse?.errorMsg || 'Failed to accept offer';

        // Handle specific error cases
        if (errorMsg.toLowerCase().includes('insufficient fund')) {
          showSnackbar(
            'Insufficient funds in escrow. Please ensure you have adequate balance.',
            'error'
          );
        } else if (errorMsg.toLowerCase().includes('already accepted')) {
          showSnackbar(
            'You have already accepted this offer.',
            'warning'
          );
        } else {
          showSnackbar(errorMsg, 'error');
        }
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.errorResponse?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to accept offer. Please try again.',
        'error'
      );
    }
  };

  const handleOpenCounterOffer = async (offer) => {
    console.log(offer);

    // First check the offer timeline limit
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${offer.campaignId}/campaignDetails`
      );

      if (response.data && response.data.success) {
        const resultSet = response.data.data.R_RESULT_SET || [];

        // Filter for OFFER_TIMELINE section types
        const offerTimelines = resultSet.filter(
          (item) => item.SECTION_TYPE === 'OFFER_TIMELINE'
        );

        // Check if limit reached
        if (offerTimelines.length >= MAX_OFFER_PLACE_LIMIT) {
          showSnackbar(
            `You cannot place an offer since maximum ${MAX_OFFER_PLACE_LIMIT} offers can be placed for a campaign.`,
            'warning'
          );
          return;
        }
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to verify offer limit.',
        'error'
      );
      return;
    }

    // If we get here, proceed with opening the counter offer dialog
    setSelectedOffer(offer);
    setCounterOfferData({
      totalBudget: offer.totalBudget || 0,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      kpiType: offer.kpiType || 'ENGAGEMENT',
      kpiTarget: offer.kpiTarget || '0',
      deliverables: offer.deliverables.map((d) => ({
        deliverableType: d.deliverableType,
        quantity: d.quantity,
        pricePerUnit: d.pricePerUnit,
      })),
    });
    setCounterOfferDialogOpen(true);
  }; 


  const handleCloseCounterOffer = () => {
    setCounterOfferDialogOpen(false);
    setSelectedOffer(null);
    setCounterOfferData({
      totalBudget: 0,
      startDate: '',
      endDate: '',
      kpiType: 'ENGAGEMENT',
      kpiTarget: '0',
      deliverables: [],
    });
  };

  const handleDeliverableChange = (index, field, value) => {
    setCounterOfferData((prev) => {
      const newDeliverables = [...prev.deliverables];
      newDeliverables[index] = {
        ...newDeliverables[index],
        [field]: field === 'deliverableType' ? value : parseFloat(value) || 0,
      };
      const newTotalBudget = newDeliverables.reduce(
        (sum, d) => sum + d.quantity * d.pricePerUnit,
        0
      );
      return { ...prev, deliverables: newDeliverables, totalBudget: newTotalBudget };
    });
  };

  const handleSubmitCounterOffer = async () => {
    const creatorId = getCreatorId();
    const brandId = selectedOffer?.brandId;

    if (!selectedOffer || !creatorId || brandId == null) return;

    // Validation
    if (!counterOfferData.startDate || !counterOfferData.endDate) {
      showSnackbar('Please provide both start and end dates.', 'warning');
      return;
    }

    if (!counterOfferData.kpiType || !counterOfferData.kpiTarget) {
      showSnackbar('Please provide KPI type and target.', 'warning');
      return;
    }

    if (counterOfferData.deliverables.length === 0) {
      showSnackbar('Please add at least one deliverable.', 'warning');
      return;
    }

    setCounterOfferLoading(true);
    console.log(selectedOffer)
    try {
      const payload = {
        offerId: selectedOffer.offerId,
        campaignId: selectedOffer.campaignId,
        status: 'PENDING',
        startDate: counterOfferData.startDate,
        endDate: counterOfferData.endDate,
        totalBudget: parseFloat(counterOfferData.totalBudget.toFixed(2)),
        kpiType: counterOfferData.kpiType,
        kpiTarget: `${counterOfferData.kpiTarget}%`,
        brandId: parseInt(brandId),
        creatorId: parseInt(creatorId),
        deliverables: counterOfferData.deliverables.map((d) => ({
          deliverableType: d.deliverableType,
          quantity: parseInt(d.quantity),
          pricePerUnit: parseFloat(d.pricePerUnit.toFixed(2)),
        })),
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/send_offer`,
        payload
      );

      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        showSnackbar('Counter offer submitted successfully!', 'success');
        handleCloseCounterOffer();
        if (invitationSubTab === 0) {
          fetchInvitations();
        } else {
          fetchMyOffers();
        }
      } else {
        const errorMsg =
          response.data?.errorResponse?.errorMsg || 'Failed to submit counter offer';
        showSnackbar(errorMsg, 'error');
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.errorResponse?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to submit counter offer.',
        'error'
      );
    } finally {
      setCounterOfferLoading(false);
    }
  };
  // Helper Functions
  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.split(' ');
    if (words.length >= 2)
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const generateAvatarColor = (id) => {
    const colors = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    ];
    return colors[(id || 0) % colors.length];
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatRights = (rights) => {
    if (!rights) return 'Standard';
    return rights
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCampaignBadgeFromStatus = (status) => {
    const statusMap = {
      ACTIVE: 'ACTIVE',
      CANCELLED: 'CANCELLED',
      DRAFT: 'DRAFT',
      PAUSED: 'PAUSED',
      COMPLETED: 'COMPLETED',
    };
    return statusMap[status] || status;
  };

  const getCampaignBadgeColorFromStatus = (status) => {
    const colorMap = {
      ACTIVE: '#22c55e',
      CANCELLED: '#ef4444',
      DRAFT: '#6b7280',
      PAUSED: '#f59e0b',
      COMPLETED: '#3b82f6',
    };
    return colorMap[status] || '#6b7280';
  };

  const getBadgeColorFromCompensation = (compensationType) => {
    const colorMap = {
      FIXED: '#3b82f6',
      Fixed: '#3b82f6',
      'Performance-based': '#f59e0b',
      PERFORMANCE: '#f59e0b',
      Percentage: '#8b5cf6',
      PERCENTAGE: '#8b5cf6',
      'Fixed + Bonus': '#22c55e',
      BONUS: '#22c55e',
    };
    return colorMap[compensationType] || '#3b82f6';
  };

  const formatTimeline = (startDate, endDate) => {
    if (!startDate || !endDate) return 'TBD';
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} – ${end}`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatChatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    if (days === 0) return timeStr;
    if (days === 1) return `Yesterday ${timeStr}`;
    if (days < 7) return `${days} days ago`;
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' +
      timeStr
    );
  };

  const calculateExpiresIn = (expiryDate) => {
    if (!expiryDate) return 'Soon';
    const now = new Date();
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return 'Invalid date';
    const diffMs = expiry.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expired';
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const formatCompletedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMedalIcon = (medal) => {
    switch (medal) {
      case 'Gold':
        return { icon: '🥇', color: '#fbbf24' };
      case 'Silver':
        return { icon: '🥈', color: '#d1d5db' };
      case 'Bronze':
        return { icon: '🥉', color: '#cd7f32' };
      default:
        return { icon: '🏅', color: '#6b7280' };
    }
  };

  const getStatusText = (status) => getCampaignBadgeFromStatus(status);
  const getStatusColor = (status) => getCampaignBadgeColorFromStatus(status);
  const getCompensationTypeText = (type) => type;
  const getCompensationTypeColor = (type) => getBadgeColorFromCompensation(type);

  // API Functions
  const fetchCampaigns = async () => {
    const creatorId = getCreatorId();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', campaignStatus); // Always send status including 'ALL'
      params.append('startDate', '');
      params.append('endDate', '');
      params.append('pageNumber', currentPage.toString());
      params.append('pageSize', pageSize.toString());
      params.append('creatorId', creatorId.toString());


      const payload = {
        searchTerm: debouncedSearchTerm || '', // Send searchTerm in body (blank if not entered)
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/offers?${params.toString()}`,
        payload
      );

      if (response.data && response.data.success) {
        const data = response.data.data || [];
        const transformedCampaigns = data.map((campaign) => ({
          id: campaign.campaignId,
          campaignId: campaign.campaignId,
          name: campaign.campaignName || 'Untitled Campaign',
          initials: getInitials(campaign.campaignName || 'Untitled'),
          avatarColor: generateAvatarColor(campaign.campaignId),
          verified: true,
          category: campaign.audienceInterest || 'Uncategorized',
          price: formatPrice(campaign.totalBudget || 0),
          priceType: 'B$',
          badge: getCampaignBadgeFromStatus(campaign.status),
          brandId: campaign.brandId,
          offerId: campaign.offerId,
          badgeColor: getCampaignBadgeColorFromStatus(campaign.status),
          paymentType: campaign.compensationType || 'Fixed',
          deliverables: `${campaign.kpiType || 'Performance'} Target`,
          target: campaign.kpiTarget || '0',
          timeline: formatTimeline(campaign.startDate, campaign.endDate),
          rights: formatRights(campaign.rights),
          description: campaign.description || 'No description available',
          creatorRegion: campaign.creatorRegion || 'Global',
          creatorType: campaign.creatorType || 'All Types',
          status: campaign.status,
          maxCreatorApplications: campaign.maxCreatorApplications,
          budgetPerCreator: campaign.budgetPerCreator,
          noOfApplied: campaign.noOfApplied,
          campaignType: campaign.campaignType,

        }));
        setCampaigns(transformedCampaigns);

        // Use totalRecords from response for pagination
        const total = response.data.totalRecords || 0;
        setTotalRecords(total);
        setTotalPages(Math.ceil(total / pageSize));

        if (transformedCampaigns.length === 0 && currentPage === 1)
          showSnackbar('No campaigns found matching your criteria.', 'info');
      } else {
        throw new Error(response.data?.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load campaigns.',
        'error'
      );
      setCampaigns([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    const creatorId = getCreatorId();

    if (!creatorId) {
      showSnackbar('Creator ID not found. Please login again.', 'error');
      return;
    }

    setInvitationsLoading(true);

    try {
      console.log('Fetching invitations for creator:', creatorId); // Debug log

      const response = await apiClient.get(
        `${API_BASE_URL}/creator/${creatorId}/InvitedCampaign`
      );

      console.log('Invitations API Response:', response.data); // Debug log

      // Check if response has data
      if (!response.data) {
        console.error('No data in response');
        setInvitations([]);
        showSnackbar('No data received from server', 'warning');
        return;
      }

      // Handle different response structures
      let campaignsData = [];

      // Try multiple possible response structures
      if (response.data.success && response.data.data?.r_creators_cursor) {
        campaignsData = response.data.data.r_creators_cursor;
      } else if (response.data.data?.r_creators_cursor) {
        campaignsData = response.data.data.r_creators_cursor;
      } else if (response.data.r_creators_cursor) {
        campaignsData = response.data.r_creators_cursor;
      } else if (Array.isArray(response.data.data)) {
        campaignsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        campaignsData = response.data;
      }

      console.log('Campaigns data extracted:', campaignsData); // Debug log
      console.log('Number of campaigns:', campaignsData.length); // Debug log

      if (!campaignsData || campaignsData.length === 0) {
        setInvitations([]);
        showSnackbar('No invitations found.', 'info');
        return;
      }

      // Transform campaign invitations to invitation format
      const transformedInvitations = campaignsData
        .filter((campaign) => {
          // Log each campaign to see what we're working with
          const invitationStatus = campaign.INVITATIONS_STATUS;
          return invitationStatus === 'PENDING' || invitationStatus === 'ACTIVE';
        })
        .map((campaign) => {
          return {
            invitationId: campaign.INVITATION_ID,
            campaignId: campaign.CAMPAIGN_ID,
            brandId: campaign.BRAND_ID,
            brandName: campaign.BRAND_NAME || `Brand #${campaign.BRAND_ID}`,
            campaignName: campaign.CAMPAIGN_NAME || 'Campaign Invitation',
            totalBudget: campaign.TOTAL_BUDGET || 0,
            startDate: campaign.START_DATE,
            endDate: campaign.END_DATE,
            kpiType: campaign.KPI_TYPE || 'N/A',
            kpiTarget: campaign.KPI_TARGET || 'N/A',
            status: campaign.INVITATIONS_STATUS || campaign.STATUS || 'PENDING',
            description: campaign.DESCRIPTION || '',
            creatorRegion: campaign.CREATOR_REGION || 'Global',
            creatorType: campaign.CREATOR_TYPE || 'All Types',
            audienceInterest: campaign.AUDIENCE_INTEREST || 'General',
            minFollowerCount: campaign.MIN_FOLLOWER_COUNT || 0,
            avgEngagementRate: campaign.AVG_ENGAGEMENT_RATE || 0,
            compensationType: campaign.COMPENSATION_TYPE || 'FIXED',
            escrowEnabled: campaign.ESCROW_ENABLED === 1 || campaign.ESCROW_ENABLED === true,
            rights: campaign.RIGHTS || 'STANDARD',
            exclusivityDays: campaign.EXCLUSIVITY_DURATION_DAYS || 0,
            campaignStatus: campaign.STATUS || 'ACTIVE',
            createdAt: campaign.CREATED_AT,
            updatedAt: campaign.UPDATED_AT,
            expiresIn: calculateExpiresIn(campaign.END_DATE),
            deliverables: [],
            message: '',
          };
        });

      console.log('Transformed invitations:', transformedInvitations); // Debug log
      console.log('Number of transformed invitations:', transformedInvitations.length); // Debug log

      setInvitations(transformedInvitations);

      /* if (transformedInvitations.length === 0) {
        showSnackbar('No pending invitations found.', 'info');
      } else {
        showSnackbar(`Loaded ${transformedInvitations.length} invitation(s)`, 'success');
      } */

    } catch (error) {
      console.error('Error fetching invitations:', error); // Debug log
      console.error('Error response:', error.response); // Debug log

      showSnackbar(
        error.response?.data?.message ||
        error.response?.data?.errorMsg ||
        error.message ||
        'Failed to load invitations.',
        'error'
      );
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchActiveDeals = async () => {
    const creatorId = getCreatorId();
    setActiveDealsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/deal/active/${creatorId}`
      );
      if (response.data && response.data.success) {
        const data = response.data.data || [];
        if (!data || data.length === 0) {
          setActiveDeals([]);
          return;
        }
        const transformedDeals = data.map((deal) => {
          const deliverables = (deal.deliverables || []).map((d) => {
            let status = 'Not Started',
              statusColor = '#6b7280',
              completed = false,
              pending = false;
            switch (d.status) {
              case 'COMPLETED':
                status = 'Completed ✓';
                statusColor = '#22c55e';
                completed = true;
                break;
              case 'UNDER_REVIEW':
                status = 'Uploaded • Under Review';
                statusColor = '#3b82f6';
                break;
              case 'PENDING':
                status = 'Pending Upload';
                statusColor = '#f59e0b';
                pending = true;
                break;
              default:
                status = 'Not Started';
                statusColor = '#6b7280';
            }
            return { name: d.name, status, statusColor, completed, pending };
          });
          const endDate = new Date(deal.endDate);
          const now = new Date();
          const diffTime = endDate - now;
          const daysRemaining = Math.max(
            0,
            Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          );
          return {
            id: deal.campaignId,
            name: deal.campaignName || 'Untitled Campaign',
            initials: getInitials(deal.campaignName || 'Campaign'),
            avatarColor: generateAvatarColor(deal.campaignId),
            status: deal.status || 'In Progress',
            statusColor: '#3b82f6',
            potentialPayout: `${formatPrice(deal.campaignType === 'IN_APPLICATION' ? deal.budgetPerCreator : deal.totalBudget || 0)} B$`,
            payoutLabel: 'Potential Payout',
            escrowEnabled: deal.escrowEnabled || false,
            deliverables: deliverables,
            performance: {
              current: Math.round((deal.progress || 0) * 1000),
              target: 100000,
              percentage: deal.progress || 0,
              daysRemaining,
            },
            //TODO: need to add more data
          };
        });
        setActiveDeals(transformedDeals);
      } else {
        setActiveDeals([]);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load active deals.',
        'error'
      );
      setActiveDeals([]);
    } finally {
      setActiveDealsLoading(false);
    }
  };

  const fetchCompletedDeals = async () => {
    const creatorId = getCreatorId();
    setCompletedDealsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/deal/completed/${creatorId}`
      );
      if (response.data && response.data.success) {
        const data = response.data.data || [];
        if (!data || data.length === 0) {
          setCompletedDeals([]);
          return;
        }
        const transformedDeals = data.map((deal) => ({
          id: deal.campaignId,
          name: deal.campaignName || 'Untitled Campaign',
          initials: getInitials(deal.campaignName || 'Campaign'),
          avatarColor: generateAvatarColor(deal.campaignId),
          completedDate: formatCompletedDate(deal.completedDate),
          earned: `${formatPrice(deal.earnings || 0)} B$`,
          status: deal.status || 'COMPLETED',
        }));
        setCompletedDeals(transformedDeals);
      } else {
        setCompletedDeals([]);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load completed deals.',
        'error'
      );
      setCompletedDeals([]);
    } finally {
      setCompletedDealsLoading(false);
    }
  };

  const fetchPerformanceSummary = async () => {
    const creatorId = getCreatorId();
    setPerformanceSummaryLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/summary/${creatorId}`
      );
      if (response.data && response.data.success) {
        const data = response.data.data || {};
        setPerformanceSummary({
          earnings: data.earnings || 0,
          cpm: data.cpm || 0,
          engagement: data.engagement || 0,
        });
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch performance summary'
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load performance summary.',
        'error'
      );
      setPerformanceSummary(null);
    } finally {
      setPerformanceSummaryLoading(false);
    }
  };

  const fetchTopCampaigns = async () => {
    const creatorId = getCreatorId();
    setTopCampaignsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/top-campaigns/${creatorId}`
      );
      if (response.data && response.data.success) {
        setTopCampaigns(response.data.data || []);
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch top campaigns'
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load top campaigns.',
        'error'
      );
      setTopCampaigns([]);
    } finally {
      setTopCampaignsLoading(false);
    }
  };

  const fetchDealDetails = async (dealId) => {
    const creatorId = getCreatorId();
    setDealDetailsLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/creator/deal/${creatorId}`
      );
      if (response.data && response.data.success) {
        const dealData = response.data.data;
        if (!dealData) throw new Error('No deal data found');
        setSelectedDealDetails(dealData);
        setDealDetailsModalOpen(true);
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch deal details'
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load deal details.',
        'error'
      );
    } finally {
      setDealDetailsLoading(false);
    }
  };

  const handleViewDealDetails = (dealId) => {
    fetchDealDetails(dealId);
  };

  const handleCloseDealDetails = () => {
    setDealDetailsModalOpen(false);
    setSelectedDealDetails(null);
  };

  const fetchAllCreatorChats = async (pageNo, pageSizeVal) => {
    const creatorId = getCreatorId();
    if (!creatorId) return;
    setConversationsLoading(true);
    try {
      const payload = {
        creatorId: parseInt(creatorId),
        pageNo: pageNo,
        pageSize: pageSizeVal,
      };
      const response = await apiClient.post(
        `${API_BASE_URL}/creator/with-chat`,
        payload
      );
      if (response.data && response.data.errorData === 0) {
        const campaignsData = response.data.campaigns || [];
        const count = response.data.count || 0;
        const transformedConversations = campaignsData.map((campaign) => ({
          id: campaign.CAMPAIGN_ID,
          campaignId: campaign.CAMPAIGN_ID,
          name: campaign.CAMPAIGN_NAME || 'Untitled Campaign',
          brandId: campaign.BRAND_ID,
          description: campaign.DESCRIPTION || '',
          lastMessage: campaign.lastMessage || 'Click to start conversation',
          time: formatChatTime(campaign.UPDATED_AT || campaign.CREATED_AT),
          campaign: campaign.CAMPAIGN_NAME?.toUpperCase() || 'CAMPAIGN',
          isActive: false,
          status: campaign.STATUS,
          totalBudget: campaign.TOTAL_BUDGET,
          kpiType: campaign.KPI_TYPE,
          kpiTarget: campaign.KPI_TARGET,
          compensationType: campaign.COMPENSATION_TYPE,
          startDate: campaign.START_DATE,
          endDate: campaign.END_DATE,
          creatorRegion: campaign.CREATOR_REGION,
          audienceInterest: campaign.AUDIENCE_INTEREST,
          escrowEnabled: campaign.ESCROW_ENABLED === 1,
        }));
        setConversations(transformedConversations);
        setConversationsCount(count);
      } else {
        showSnackbar(
          response.data?.errorMsg || 'Failed to load conversations.',
          'error'
        );
        setConversations([]);
        setConversationsCount(0);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load chat details.',
        'error'
      );
      setConversations([]);
      setConversationsCount(0);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchConversationMessages = async (conversation, pageNo = 1) => {
    const creatorId = getCreatorId();
    if (!creatorId || !conversation) return;
    setMessagesLoading(true);
    try {
      const payload = {
        brandId: conversation.brandId,
        creatorId: parseInt(creatorId),
        campaignId: conversation.campaignId,
        pageNo: pageNo,
        pageSize: messagesPageSize,
      };
      const response = await apiClient.post(
        `${API_BASE_URL}/creator/messages`,
        payload
      );
      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        const messagesList = response.data.messagesList || [];
        const transformedMessages = messagesList
          .map((msg) => ({
            id: msg.messageId,
            sender: msg.senderRole === 'creator' ? 'user' : 'other',
            senderRole: msg.senderRole,
            message: msg.message,
            time: formatMessageTime(msg.createdAt),
            createdAt: msg.createdAt,
            brandId: msg.brandId,
            creatorId: msg.creatorId,
            campaignId: msg.campaignId,
          }))
          .reverse();
        setChatMessages(transformedMessages);
        setMessagesPageNo(pageNo);
        setTimeout(() => {
          if (chatContainerRef.current)
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
        }, 100);
      } else {
        showSnackbar(
          response.data?.errorResponse?.errorMsg || 'Failed to load messages.',
          'error'
        );
        setChatMessages([]);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to load messages.',
        'error'
      );
      setChatMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (index) => {
    const conversation = conversations[index];
    setSelectedConversation(index);
    setConversations((prev) =>
      prev.map((conv, i) => ({ ...conv, isActive: i === index }))
    );
    setChatMessages([]);
    if (conversation) fetchConversationMessages(conversation, 1);
  };

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === 0) fetchCampaigns();
    else if (activeTab === 1) {
      // Fetch based on which sub-tab is active
      if (invitationSubTab === 0) {
        fetchInvitations();
      } else if (invitationSubTab === 1) {
        fetchMyOffers();
      }
    }
    else if (activeTab === 2) fetchActiveDeals();
    else if (activeTab === 3) fetchCompletedDeals();
    else if (activeTab === 4) {
      fetchPerformanceSummary();
      fetchTopCampaigns();
    } else if (activeTab === 5) fetchAllCreatorChats(currentPage, pageSize);
  }, [activeTab, invitationSubTab, sortBy, currentPage, debouncedSearchTerm, campaignStatus]);

  useEffect(() => {
    if (activeTab === 0) setCurrentPage(1);
  }, [sortBy, debouncedSearchTerm, campaignStatus]);

  useEffect(() => {
    if (activeTab !== 5) {
      setSelectedConversation(null);
      setChatMessages([]);
    }
  }, [activeTab]);

  const currentConversation =
    selectedConversation !== null ? conversations[selectedConversation] : null;

  const tabLabels = [
    { label: 'Discover Campaigns', badge: null },
    { label: 'Invitations', badge: null },
    { label: 'Active Deals', badge: null },
    { label: 'Completed', badge: null },
    { label: 'Performance', badge: null },
    { label: 'Messages', badge: null },
  ];

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    const creatorId = getCreatorId();
    if (!creatorId) return;

    const messageText = messageInput.trim();
    setMessageInput('');

    try {
      const payload = {
        brandId: currentConversation.brandId,
        creatorId: parseInt(creatorId),
        campaignId: currentConversation.campaignId,
        message: messageText,
      };

      const response = await apiClient.post(
        `${API_BASE_URL}/creator/send_message`,
        payload
      );

      if (
        response.data &&
        response.data.errorResponse &&
        response.data.errorResponse.errorData === 0
      ) {
        // Add message to chat locally
        const newMessage = {
          id: Date.now(),
          sender: 'user',
          senderRole: 'creator',
          message: messageText,
          time: formatMessageTime(new Date().toISOString()),
          createdAt: new Date().toISOString(),
          brandId: currentConversation.brandId,
          creatorId: parseInt(creatorId),
          campaignId: currentConversation.campaignId,
        };
        setChatMessages((prev) => [...prev, newMessage]);

        // Scroll to bottom
        setTimeout(() => {
          if (chatContainerRef.current)
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
        }, 100);

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.campaignId === currentConversation.campaignId
              ? { ...conv, lastMessage: messageText, time: 'Just now' }
              : conv
          )
        );
      } else {
        showSnackbar(
          response.data?.errorResponse?.errorMsg || 'Failed to send message.',
          'error'
        );
        setMessageInput(messageText); // Restore message on failure
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Failed to send message.',
        'error'
      );
      setMessageInput(messageText); // Restore message on failure
    }
  };


  const renderInvitationsContent = () => {
    const currentData = invitationSubTab === 0 ? invitations : myOffers;
    const isLoading = invitationSubTab === 0 ? invitationsLoading : myOffersLoading;

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={50} sx={{ color: '#2563eb' }} />
        </Box>
      );
    }

    if (currentData.length === 0) {
      return (
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            p: 6,
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <InfoIcon sx={{ fontSize: 64, color: '#6b7280', mb: 2 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
          >
            {invitationSubTab === 0 ? 'No Invitations Found' : 'No Offers Found'}
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
            {invitationSubTab === 0
              ? "You haven't received any campaign invitations yet."
              : "You haven't sent any counter offers yet."}
          </Typography>
        </Card>
      );
    }

    // Render MY INVITATIONS TAB (invitationSubTab === 0)
    if (invitationSubTab === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {invitations.map((invitation) => (
            <Card
              key={`invitation-${invitation.invitationId}`}
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      background: generateAvatarColor(invitation.brandId),
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(invitation.campaignName || 'Campaign')}
                  </Avatar>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {invitation.campaignName}
                      </Typography>
                      <VerifiedIcon
                        sx={{ fontSize: '20px', color: '#2563eb' }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#3b82f6',
                        mb: 0.5,
                      }}
                    >
                      Campaign Invitation
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                      Received {formatRelativeTime(invitation.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#22c55e',
                    }}
                  >
                    {formatPrice(invitation.totalBudget)}{' '}
                    <span style={{ fontSize: '16px' }}>B$</span>
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'flex-end',
                      mt: 1,
                    }}
                  >
                    <Chip
                      label={invitation.campaignStatus}
                      size="small"
                      sx={{
                        backgroundColor: getCampaignBadgeColorFromStatus(
                          invitation.campaignStatus
                        ),
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    />
                    <Chip
                      label={invitation.compensationType || 'FIXED'}
                      size="small"
                      sx={{
                        backgroundColor: getBadgeColorFromCompensation(
                          invitation.compensationType
                        ),
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {invitation.description && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                    mb: 3,
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#3b82f6',
                      mb: 0.5,
                    }}
                  >
                    Campaign Description
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#d1d5db',
                    }}
                  >
                    {invitation.description}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    Campaign Duration
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {formatTimeline(invitation.startDate, invitation.endDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    KPI Target
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {invitation.kpiType}: {invitation.kpiTarget}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    Min Followers
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {formatPrice(invitation.minFollowerCount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    Target Region
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {invitation.creatorRegion}
                  </Typography>
                </Box>
              </Box>

              {invitation.expiresIn && invitation.expiresIn !== 'Expired' && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                  }}
                >
                  <InfoIcon sx={{ fontSize: '18px', color: '#ef4444' }} />
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    Campaign ends in {invitation.expiresIn}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleViewDetails({ id: invitation.campaignId })}
                  sx={{
                    flex: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  View Campaign Details
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleAcceptCampaignInvitation(invitation)}
                  disabled={
                    invitation.campaignStatus === 'CANCELLED' ||
                    applyingCampaignId === invitation.campaignId
                  }
                  sx={{
                    flex: 1,
                    backgroundColor:
                      invitation.campaignStatus === 'CANCELLED' ||
                        applyingCampaignId === invitation.campaignId
                        ? '#6b7280'
                        : '#22c55e',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor:
                        invitation.campaignStatus === 'CANCELLED' ||
                          applyingCampaignId === invitation.campaignId
                          ? '#6b7280'
                          : '#16a34a',
                    },
                    '&:disabled': {
                      backgroundColor: '#6b7280',
                      color: '#9ca3af',
                    },
                  }}
                >
                  {applyingCampaignId === invitation.campaignId ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : invitation.campaignStatus === 'CANCELLED' ? (
                    'Campaign Closed'
                  ) : (
                    'Apply to Campaign'
                  )}
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      );
    }

    // Render MY OFFERS TAB (invitationSubTab === 1)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {myOffers.map((offer) => {
          const showButtons = shouldShowButtons(offer);
          const buttonsDisabled = areButtonsDisabled(offer);

          return (
            <Card
              key={`${offer.offerId}-${offer.offerTimeLineId}`}
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      background: generateAvatarColor(offer.brandId),
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(offer.brandName || 'Brand')}
                  </Avatar>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {offer.brandName || `Brand #${offer.brandId}`}
                      </Typography>
                      <VerifiedIcon
                        sx={{ fontSize: '20px', color: '#2563eb' }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#3b82f6',
                        mb: 0.5,
                      }}
                    >
                      {offer.campaignName || 'Campaign Offer'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                      Received {formatRelativeTime(offer.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#22c55e',
                    }}
                  >
                    {formatPrice(offer.totalBudget)}{' '}
                    <span style={{ fontSize: '16px' }}>B$</span>
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'flex-end',
                      mt: 1,
                    }}
                  >
                    <Chip
                      label={offer.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          offer.status === 'PENDING'
                            ? '#f59e0b'
                            : offer.status === 'APPROVED'
                              ? '#22c55e'
                              : offer.status === 'REJECTED'
                                ? '#ef4444'
                                : offer.status === 'CLOSED'
                                  ? '#6b7280'
                                  : '#22c55e',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    />
                    <Chip
                      label={
                        offer.placedBy === 'BRAND'
                          ? 'Brand Offer'
                          : 'Counter Offer'
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          offer.placedBy === 'BRAND' ? '#3b82f6' : '#8b5cf6',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {offer.message && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                    mb: 3,
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#3b82f6',
                      mb: 0.5,
                    }}
                  >
                    Message from {offer.brandName || 'Brand'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#d1d5db',
                    }}
                  >
                    {offer.message}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    mb: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Deliverables
                </Typography>
                {offer.deliverables && offer.deliverables.length > 0 ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 2,
                    }}
                  >
                    {offer.deliverables.map((deliverable, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '12px',
                          p: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#ffffff',
                            mb: 1,
                          }}
                        >
                          {deliverable.deliverableType
                            ? deliverable.deliverableType.replace('_', ' ')
                            : 'Deliverable'}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            mb: 0.5,
                          }}
                        >
                          Quantity: {deliverable.quantity || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: '12px', color: '#9ca3af', mb: 1 }}
                        >
                          Per Unit:{' '}
                          {formatPrice(deliverable.pricePerUnit || 0)} B$
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#22c55e',
                          }}
                        >
                          Total:{' '}
                          {formatPrice(
                            (deliverable.quantity || 0) *
                            (deliverable.pricePerUnit || 0)
                          )}{' '}
                          B$
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                      No deliverables specified
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    Campaign Duration
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {formatTimeline(offer.startDate, offer.endDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    KPI Target
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {offer.kpiType}: {offer.kpiTarget}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                  >
                    Total Budget
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#22c55e',
                    }}
                  >
                    {formatPrice(offer.totalBudget)} B$
                  </Typography>
                </Box>
              </Box>

              {offer.expiresIn && offer.expiresIn !== 'Expired' && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                  }}
                >
                  <InfoIcon sx={{ fontSize: '18px', color: '#ef4444' }} />
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    This offer expires in {offer.expiresIn}
                  </Typography>
                </Box>
              )}

              {showButtons && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleAcceptOffer(offer)}
                    disabled={buttonsDisabled}
                    sx={{
                      flex: 1,
                      backgroundColor: buttonsDisabled ? '#6b7280' : '#22c55e',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: buttonsDisabled ? '#6b7280' : '#16a34a',
                      },
                      '&:disabled': {
                        backgroundColor: '#6b7280',
                        color: '#9ca3af',
                      },
                    }}
                  >
                    Accept Offer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenCounterOffer(offer)}
                    disabled={buttonsDisabled}
                    sx={{
                      flex: 1,
                      borderColor: buttonsDisabled
                        ? 'rgba(107, 114, 128, 0.5)'
                        : 'rgba(255, 255, 255, 0.2)',
                      color: buttonsDisabled ? '#6b7280' : '#ffffff',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: buttonsDisabled
                          ? 'rgba(107, 114, 128, 0.5)'
                          : 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: buttonsDisabled
                          ? 'transparent'
                          : 'rgba(255, 255, 255, 0.05)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(107, 114, 128, 0.5)',
                        color: '#6b7280',
                      },
                    }}
                  >
                    Counter Offer
                  </Button>
                </Box>
              )}
            </Card>
          );
        })}
      </Box>
    );
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Brand Collabs Marketplace
        </Typography>
        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
          Find paid partnership offers from verified crypto brands and
          businesses.
        </Typography>
        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
          You must use tag the business and use the campaign hashtag in your post to earn from brand collaboration.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {tabLabels.map((tab, index) => (
            <Box
              key={index}
              onClick={() => setActiveTab(index)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                flex: 1,
                px: 3,
                py: 1.5,
                cursor: 'pointer',
                backgroundColor:
                  activeTab === index ? '#2563eb' : 'transparent',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor:
                    activeTab === index
                      ? '#2563eb'
                      : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}
              >
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Filters for Discover Campaigns Tab */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: '300px', flex: 1 }}>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}>
                Search Campaigns
              </Typography>
              <TextField
                fullWidth
                placeholder="Search by title, category, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                  },
                }}
              />
            </Box>
            <Box sx={{ minWidth: '180px' }}>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}>
                Status
              </Typography>
              <Select
                fullWidth
                value={campaignStatus}
                onChange={(e) => setCampaignStatus(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PAUSED">Paused</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </Box>
            {/* <Box sx={{ minWidth: '180px' }}>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}>
                Sort By
              </Typography>
              <Select
                fullWidth
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="highest">Highest Paying</MenuItem>
                <MenuItem value="deadline">Deadline Soon</MenuItem>
              </Select>
            </Box> */}
          </Box>
        )}
      </Box>

      {/* Discover Campaigns Tab */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={50} sx={{ color: '#2563eb' }} />
            </Box>
          )}
          {!loading && campaigns.length === 0 && (
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
              >
                No campaigns found
              </Typography>
            </Card>
          )}
          {!loading &&
            campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 3,
                  opacity: campaign.status === 'CANCELLED' ? 0.7 : 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: campaign.avatarColor,
                        fontSize: '20px',
                        fontWeight: 700,
                      }}
                    >
                      {campaign.initials}
                    </Avatar>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {campaign.name}
                        </Typography>
                        {campaign.verified && (
                          <VerifiedIcon
                            sx={{ fontSize: '20px', color: '#2563eb' }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                        📁 Category: {campaign.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#22c55e',
                      }}
                    >
                      {campaign.campaignType === 'IN_APPLICATION' ? campaign.budgetPerCreator : campaign.price}{' '}
                      <span style={{ fontSize: '16px' }}>
                        {campaign.priceType}
                      </span>
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'flex-end',
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={campaign.badge}
                        size="small"
                        sx={{
                          backgroundColor: campaign.badgeColor,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      />
                      <Chip
                        label={campaign.paymentType}
                        size="small"
                        sx={{
                          backgroundColor: getBadgeColorFromCompensation(
                            campaign.paymentType
                          ),
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                {campaign.description && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      p: 2,
                      mb: 3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: '#d1d5db',
                      }}
                    >
                      {campaign.description}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                    >
                      KPI Target
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {campaign.target}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                    >
                      Region
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {campaign.creatorRegion}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                    >
                      Timeline
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {campaign.timeline}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                    >
                      Content Rights
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {campaign.rights}
                    </Typography>
                  </Box>
                </Box>
                {/* Spots Remaining Alert - NEW */}
                {campaign.maxCreatorApplications > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3,
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      p: 2,
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: '18px', color: '#f59e0b' }} />
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: '#f59e0b',
                        fontWeight: 600,
                      }}
                    >
                      Only {campaign.maxCreatorApplications - campaign.noOfApplied} spot{campaign.maxCreatorApplications - campaign.noOfApplied !== 1 ? 's' : ''} left! Submit your application before the deadline.
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleViewDetails(campaign)}
                    disabled={campaignDetailsLoading}
                    sx={{
                      flex: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    {campaignDetailsLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'View Details'
                    )}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleApplyCampaignFromDiscoverTab(campaign)}
                    disabled={
                      campaign.status === 'CANCELLED' ||
                      applyingCampaignId === campaign.campaignId ||
                      (campaign.budgetPerCreator > 0 && campaign.noOfApplied === campaign.budgetPerCreator) // NEW CONDITION
                    }
                    sx={{
                      flex: 1,
                      backgroundColor:
                        campaign.status === 'CANCELLED' ||
                          applyingCampaignId === campaign.campaignId ||
                          (campaign.budgetPerCreator > 0 && campaign.noOfApplied === campaign.budgetPerCreator) // NEW CONDITION
                          ? '#6b7280'
                          : '#2563eb',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor:
                          campaign.status === 'CANCELLED' ||
                            applyingCampaignId === campaign.campaignId ||
                            (campaign.budgetPerCreator > 0 && campaign.noOfApplied === campaign.budgetPerCreator) // NEW CONDITION
                            ? '#6b7280'
                            : '#1d4ed8',
                      },
                      '&:disabled': {
                        backgroundColor: '#6b7280',
                        color: '#9ca3af',
                      },
                    }}
                  >
                    {applyingCampaignId === campaign.campaignId ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : campaign.status === 'CANCELLED' ? (
                      'Campaign Closed'
                    ) : (campaign.budgetPerCreator > 0 && campaign.noOfApplied === campaign.budgetPerCreator) ? (
                      'All Spots Filled' // NEW TEXT
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                </Box>
              </Card>
            ))}
          {!loading && campaigns.length > 0 && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}

     

      {/* Invitations Tab */}
      {activeTab === 1 && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={invitationSubTab}
            onChange={(e, newValue) => setInvitationSubTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            <Tab
              label="My Invitations"
              sx={{
                color: invitationSubTab === 0 ? '#2563eb' : '#9ca3af',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            />
            <Tab
              label="My Offers"
              sx={{
                color: invitationSubTab === 1 ? '#2563eb' : '#9ca3af',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            />
          </Tabs>
        </Box>
      )}

      {activeTab === 1 && renderInvitationsContent()}
      
      {/* Active Deals Tab */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {activeDealsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={50} sx={{ color: '#2563eb' }} />
            </Box>
          )}
          {!activeDealsLoading && activeDeals.length === 0 && (
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <FolderIcon sx={{ fontSize: 64, color: '#6b7280', mb: 2 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
              >
                No Active Deals Found
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                You don't have any active deals at the moment.
              </Typography>
            </Card>
          )}
          {!activeDealsLoading &&
            activeDeals.map((deal) => (
              <Card
                key={deal.id}
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: deal.avatarColor,
                        fontSize: '20px',
                        fontWeight: 700,
                      }}
                    >
                      {deal.initials}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        {deal.name}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <Chip
                          label={deal.status}
                          size="small"
                          sx={{
                            backgroundColor: deal.statusColor,
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        />
                        {deal.escrowEnabled && (
                          <Chip
                            icon={
                              <LockIcon sx={{ fontSize: '12px !important' }} />
                            }
                            label="Escrow"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(34, 197, 94, 0.2)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.5)',
                              fontSize: '11px',
                              '& .MuiChip-icon': { color: '#22c55e' },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                    >
                      {deal.payoutLabel}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#22c55e',
                      }}
                    >
                      {deal.potentialPayout}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#9ca3af',
                      mb: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    Deliverables
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {deal.deliverables.map((deliverable, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          border: `1px solid ${deliverable.completed
                            ? 'rgba(34, 197, 94, 0.3)'
                            : deliverable.pending
                              ? 'rgba(245, 158, 11, 0.3)'
                              : 'rgba(255, 255, 255, 0.1)'
                            }`,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          {deliverable.completed && (
                            <CheckCircleIcon
                              sx={{ fontSize: 20, color: '#22c55e' }}
                            />
                          )}
                          <Typography
                            sx={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            {deliverable.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={deliverable.status}
                          size="small"
                          sx={{
                            backgroundColor: `${deliverable.statusColor}20`,
                            color: deliverable.statusColor,
                            border: `1px solid ${deliverable.statusColor}`,
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#9ca3af',
                      }}
                    >
                      KPI Progress
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#3b82f6',
                      }}
                    >
                      {deal.performance.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={deal.performance.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                      {deal.performance.daysRemaining} days remaining
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => fetchCampaignDetails(deal.id)}
                  disabled={dealDetailsLoading}
                  sx={{
                    backgroundColor: '#2563eb',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#1d4ed8' },
                  }}
                >
                  {dealDetailsLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'View Details'
                  )}
                </Button>
              </Card>
            ))}
        </Box>
      )}

      {/* Completed Deals Tab */}
      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {completedDealsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={50} sx={{ color: '#2563eb' }} />
            </Box>
          )}
          {!completedDealsLoading && completedDeals.length === 0 && (
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <EmojiEventsIcon
                  sx={{ fontSize: 64, color: '#6b7280', mb: 2 }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
              >
                No Completed Deals Yet
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                Once you finish a campaign, it will appear here with your
                earnings.
              </Typography>
            </Card>
          )}
          {!completedDealsLoading &&
            completedDeals.map((deal) => (
              <Card
                key={deal.id}
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: deal.avatarColor,
                        fontSize: '20px',
                        fontWeight: 700,
                      }}
                    >
                      {deal.initials}
                    </Avatar>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {deal.name}
                        </Typography>
                        <CheckCircleIcon
                          sx={{ fontSize: '20px', color: '#22c55e' }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                        Completed on {deal.completedDate}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="COMPLETED"
                    size="small"
                    icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      fontWeight: 700,
                      fontSize: '11px',
                      '& .MuiChip-icon': { color: '#22c55e' },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    p: 3,
                    mb: 3,
                    background:
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#9ca3af',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Total Earned
                  </Typography>
                  <Typography
                    sx={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}
                  >
                    {deal.earned}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fetchCampaignDetails(deal.id)}
                  disabled={dealDetailsLoading}
                  sx={{
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    color: '#22c55e',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#22c55e',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    },
                  }}
                >
                  {dealDetailsLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'View Details'
                  )}
                </Button>
              </Card>
            ))}
        </Box>
      )}

      {/* Performance Tab */}
      {activeTab === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Performance Summary
            </Typography>
            {performanceSummaryLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={50} sx={{ color: '#2563eb' }} />
              </Box>
            )}
            {!performanceSummaryLoading && performanceSummary && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: '16px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      p: 3,
                      background:
                        'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AttachMoneyIcon
                          sx={{ fontSize: 28, color: '#22c55e' }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Total Earnings
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#22c55e',
                      }}
                    >
                      {formatPrice(performanceSummary.earnings)}{' '}
                      <span style={{ fontSize: '20px' }}>B$</span>
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: '16px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      p: 3,
                      background:
                        'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VisibilityIcon
                          sx={{ fontSize: 28, color: '#3b82f6' }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          CPM (Cost per Mille)
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#3b82f6',
                      }}
                    >
                      {formatPrice(performanceSummary.cpm)}{' '}
                      <span style={{ fontSize: '20px' }}>B$</span>
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: '16px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      p: 3,
                      background:
                        'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ThumbUpIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Total Engagement
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#f59e0b',
                      }}
                    >
                      {formatPrice(performanceSummary.engagement)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
            {!performanceSummaryLoading && !performanceSummary && (
              <Card
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '16px',
                  p: 6,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
                >
                  No Performance Data Available
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                  Complete some campaigns to see your performance metrics here.
                </Typography>
              </Card>
            )}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Top Performing Campaigns
            </Typography>
            {topCampaignsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={50} sx={{ color: '#2563eb' }} />
              </Box>
            )}
            {!topCampaignsLoading && topCampaigns.length === 0 && (
              <Card
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '16px',
                  p: 6,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 64, color: '#6b7280', mb: 2 }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: '#9ca3af' }}
                >
                  No Top Campaigns Yet
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                  Complete campaigns to see your top performers here.
                </Typography>
              </Card>
            )}
            {!topCampaignsLoading && topCampaigns.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {topCampaigns.map((campaign, index) => {
                  const medal = getMedalIcon(campaign.medal);
                  return (
                    <Card
                      key={index}
                      sx={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '16px',
                        border: `1px solid ${medal.color}40`,
                        p: 3,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: 20,
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#0a0a0a',
                          border: `3px solid ${medal.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                        }}
                      >
                        {medal.icon}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 1 }}
                          >
                            {campaign.campaignName}
                          </Typography>
                          <Chip
                            label={`#${index + 1} Top Campaign`}
                            size="small"
                            sx={{
                              backgroundColor: `${medal.color}30`,
                              color: medal.color,
                              border: `1px solid ${medal.color}`,
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          />
                        </Box>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '8px',
                              p: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                mb: 0.5,
                              }}
                            >
                              Views
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#3b82f6',
                              }}
                            >
                              {formatPrice(campaign.views)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '8px',
                              p: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                mb: 0.5,
                              }}
                            >
                              Engagement
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#f59e0b',
                              }}
                            >
                              {formatPrice(campaign.engagement)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '8px',
                              p: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                mb: 0.5,
                              }}
                            >
                              Earnings
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#22c55e',
                              }}
                            >
                              {formatPrice(campaign.earnings)} B$
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '8px',
                              p: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                mb: 0.5,
                              }}
                            >
                              Medal
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: medal.color,
                              }}
                            >
                              {campaign.medal}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Messages Tab */}
      {activeTab === 5 && (
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 250px)' }}>
          {/* Conversations List */}
          <Box
            sx={{
              width: '280px',
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Conversations
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                }}
              >
                {conversationsCount} ACTIVE CONVERSATION
                {conversationsCount !== 1 ? 'S' : ''}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {conversationsLoading && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
                >
                  <CircularProgress size={30} sx={{ color: '#2563eb' }} />
                </Box>
              )}
              {!conversationsLoading && conversations.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 48, color: '#6b7280', mb: 2 }}
                  />
                  <Typography sx={{ fontSize: '14px', color: '#9ca3af' }}>
                    No conversations yet
                  </Typography>
                  <Typography
                    sx={{ fontSize: '12px', color: '#6b7280', mt: 1 }}
                  >
                    Start a conversation with a brand to see it here
                  </Typography>
                </Box>
              )}
              {!conversationsLoading &&
                conversations.map((conv, index) => (
                  <Box
                    key={conv.id}
                    onClick={() => handleSelectConversation(index)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      backgroundColor: conv.isActive
                        ? 'rgba(37, 99, 235, 0.1)'
                        : 'transparent',
                      borderLeft: conv.isActive
                        ? '3px solid #2563eb'
                        : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: conv.isActive
                          ? 'rgba(37, 99, 235, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: generateAvatarColor(conv.id),
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(conv.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            {conv.name}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '11px', color: '#9ca3af' }}
                          >
                            {conv.time}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor:
                                conv.status === 'ACTIVE'
                                  ? '#22c55e'
                                  : '#f59e0b',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '11px',
                              color: '#9ca3af',
                              textTransform: 'uppercase',
                            }}
                          >
                            {conv.campaign}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.lastMessage}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>

          {/* Chat Area */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, flex: 1 }}
                  >
                    {currentConversation.name}
                  </Typography>
                  <Chip
                    label={currentConversation.status}
                    icon={
                      currentConversation.status === 'ACTIVE' ? (
                        <CheckCircleIcon
                          sx={{
                            fontSize: '14px !important',
                            color: '#22c55e',
                          }}
                        />
                      ) : undefined
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        currentConversation.status === 'ACTIVE'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        currentConversation.status === 'ACTIVE'
                          ? '#22c55e'
                          : '#f59e0b',
                      fontWeight: 700,
                      fontSize: '11px',
                      '& .MuiChip-icon': { color: '#22c55e' },
                    }}
                  />
                </Box>

                {/* Campaign Info */}
                <Box sx={{ px: 2, pt: 2 }}>
                  <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                    Campaign: {currentConversation.name}
                  </Typography>
                  {currentConversation.totalBudget && (
                    <Typography
                      sx={{ fontSize: '12px', color: '#6b7280', mt: 0.5 }}
                    >
                      Budget: {formatPrice(currentConversation.totalBudget)} B$
                      • {currentConversation.kpiType}:{' '}
                      {currentConversation.kpiTarget}
                    </Typography>
                  )}
                </Box>

                {/* Messages Area */}
                <Box
                  ref={chatContainerRef}
                  sx={{
                    flex: 1,
                    p: 2,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {messagesLoading && (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CircularProgress size={30} sx={{ color: '#2563eb' }} />
                    </Box>
                  )}
                  {!messagesLoading && chatMessages.length === 0 && (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <ChatBubbleOutlineIcon
                          sx={{ fontSize: 48, color: '#6b7280', mb: 2 }}
                        />
                        <Typography
                          sx={{ fontSize: '14px', color: '#9ca3af' }}
                        >
                          No messages yet
                        </Typography>
                        <Typography
                          sx={{ fontSize: '12px', color: '#6b7280', mt: 1 }}
                        >
                          Start the conversation by sending a message
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {!messagesLoading &&
                    chatMessages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            backgroundColor:
                              msg.sender === 'user'
                                ? '#2563eb'
                                : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            p: 2,
                          }}
                        >
                          <Typography sx={{ fontSize: '14px', mb: 0.5 }}>
                            {msg.message}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '11px',
                              color:
                                msg.sender === 'user'
                                  ? 'rgba(255, 255, 255, 0.6)'
                                  : '#6b7280',
                            }}
                          >
                            {msg.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>

                {/* Message Input */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      sx={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        '&:hover': { backgroundColor: '#1d4ed8' },
                        width: 48,
                        height: 48,
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 64, color: '#6b7280', mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#9ca3af', mb: 1 }}
                  >
                    Select a Conversation
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#6b7280' }}>
                    Choose a conversation from the list to start messaging
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}


      {/* Campaign Details Dialog */}
      <Dialog
        open={campaignDetailsModalOpen}
        onClose={handleCloseCampaignDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1f1f1f',
            borderRadius: '16px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InfoIcon sx={{ fontSize: 28, color: '#2563eb' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Campaign Details
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseCampaignDetails}
              sx={{ color: '#9ca3af' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCampaignDetails && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {selectedCampaignDetails.CAMPAIGN_NAME}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#d1d5db',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  {selectedCampaignDetails.DESCRIPTION}
                </Typography>
                <Box
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}
                >
                  <Chip
                    label={getCampaignBadgeFromStatus(
                      selectedCampaignDetails.STATUS
                    )}
                    size="small"
                    sx={{
                      backgroundColor: getCampaignBadgeColorFromStatus(
                        selectedCampaignDetails.STATUS
                      ),
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={selectedCampaignDetails.COMPENSATION_TYPE}
                    size="small"
                    sx={{
                      backgroundColor: getBadgeColorFromCompensation(
                        selectedCampaignDetails.COMPENSATION_TYPE
                      ),
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  />
                  {selectedCampaignDetails.ESCROW_ENABLED === 1 && (
                    <Chip
                      icon={<LockIcon sx={{ fontSize: '14px !important' }} />}
                      label="Escrow Protected"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.5)',
                        '& .MuiChip-icon': { color: '#22c55e' },
                      }}
                    />
                  )}
                  {selectedCampaignDetails.AUTO_PAYOUT_ENABLED === 1 ? (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                      label="Auto Pay Enabled"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        '& .MuiChip-icon': { color: '#3b82f6' },
                      }}
                    />
                  ) : (
                    <Chip
                      label="No Auto Payment"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(107, 114, 128, 0.2)',
                        color: '#6b7280',
                        border: '1px solid rgba(107, 114, 128, 0.5)',
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Divider
                sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                    >
                      Total Budget
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#22c55e',
                      }}
                    >
                      {formatPrice(selectedCampaignDetails.TOTAL_BUDGET)} B$
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                    >
                      Min Followers
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                      {formatPrice(selectedCampaignDetails.MIN_FOLLOWER_COUNT)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                    >
                      Avg Engagement
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                      {selectedCampaignDetails.AVG_ENGAGEMENT_RATE}%
                    </Typography>
                  </Box>
                </Grid>
                {/* <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                    >
                      Exclusivity
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                      {selectedCampaignDetails.EXCLUSIVITY_DURATION_DAYS} Days
                    </Typography>
                  </Box>
                </Grid> */}
              </Grid>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                  >
                    Creator Region
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedCampaignDetails.CREATOR_REGION}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    sx={{ fontSize: '12px', color: '#9ca3af', mb: 0.5 }}
                  >
                    Timeline
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {formatTimeline(
                      selectedCampaignDetails.START_DATE,
                      selectedCampaignDetails.END_DATE
                    )}
                  </Typography>
                </Grid>
              </Grid>
              <Divider
                sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }}
              />
              {selectedCampaignDetails.deliverables &&
                selectedCampaignDetails.deliverables.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Deliverables
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedCampaignDetails.deliverables.map(
                        (deliverable, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                p: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  mb: 1,
                                }}
                              >
                                {deliverable.type}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '13px',
                                  color: '#9ca3af',
                                  mb: 0.5,
                                }}
                              >
                                Quantity: {deliverable.quantity}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '13px',
                                  color: '#9ca3af',
                                  mb: 0.5,
                                }}
                              >
                                Price per unit:{' '}
                                {formatPrice(deliverable.pricePerUnit)} B$
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '15px',
                                  fontWeight: 700,
                                  color: '#22c55e',
                                  mt: 1,
                                }}
                              >
                                Total: {formatPrice(deliverable.total)} B$
                              </Typography>
                            </Box>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Box>
                )}
              {selectedCampaignDetails.tags &&
                selectedCampaignDetails.tags.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Campaign Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedCampaignDetails.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            color: '#8b5cf6',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Counter Offer Dialog */}
      <Dialog
        open={counterOfferDialogOpen}
        onClose={handleCloseCounterOffer}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            maxHeight: '90vh',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SendIcon sx={{ fontSize: 28, color: '#2563eb' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Make a Counter Offer
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseCounterOffer}
              sx={{ color: '#9ca3af' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: '#0a0a0a' }}>
          {selectedOffer && (
            <Box>
              {/* Original Offer Summary */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: '#1a1a1a',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    mb: 1,
                  }}
                >
                  Original Offer
                </Typography>
                <Typography
                  sx={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#22c55e',
                    mb: 1,
                  }}
                >
                  {formatPrice(selectedOffer.totalBudget)} B$
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                  {selectedOffer.deliverables.length} deliverables • {selectedOffer.kpiType}: {selectedOffer.kpiTarget}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Your Counter Offer
              </Typography>

              {/* Campaign Timeline */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    mb: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Campaign Timeline
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        mb: 0.5,
                      }}
                    >
                      Start Date
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={counterOfferData.startDate}
                      onChange={(e) =>
                        setCounterOfferData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2563eb',
                          },
                        },
                        '& input': {
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        mb: 0.5,
                      }}
                    >
                      End Date
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={counterOfferData.endDate}
                      onChange={(e) =>
                        setCounterOfferData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2563eb',
                          },
                        },
                        '& input': {
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* KPI Details */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    mb: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  KPI Requirements
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        mb: 0.5,
                      }}
                    >
                      KPI Type
                    </Typography>
                    <Select
                      fullWidth
                      value={counterOfferData.kpiType}
                      onChange={(e) =>
                        setCounterOfferData((prev) => ({
                          ...prev,
                          kpiType: e.target.value,
                        }))
                      }
                      size="small"
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563eb',
                        },
                      }}
                    >
                      <MenuItem value="ENGAGEMENT">Engagement</MenuItem>
                      <MenuItem value="VIEWS">Views</MenuItem>
                      <MenuItem value="CLICKS">Clicks</MenuItem>
                      <MenuItem value="CONVERSIONS">Conversions</MenuItem>
                      <MenuItem value="IMPRESSIONS">Impressions</MenuItem>
                      <MenuItem value="REACH">Reach</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        mb: 0.5,
                      }}
                    >
                      KPI Target
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g., 7% engagement rate"
                      value={counterOfferData.kpiTarget}
                      onChange={(e) =>
                        setCounterOfferData((prev) => ({
                          ...prev,
                          kpiTarget: e.target.value,
                        }))
                      }
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2563eb',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Total Budget */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    mb: 1,
                  }}
                >
                  Total Budget (Auto-calculated from deliverables)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={counterOfferData.totalBudget}
                  onChange={(e) =>
                    setCounterOfferData((prev) => ({
                      ...prev,
                      totalBudget: parseFloat(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      '& fieldset': { border: 'none' },
                      '& input': {
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#22c55e',
                        padding: '16px',
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Typography
                        sx={{
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#22c55e',
                          pr: 2,
                        }}
                      >
                        B$
                      </Typography>
                    ),
                  }}
                />
                <Typography sx={{ fontSize: '12px', color: '#9ca3af', mt: 1 }}>
                  Total is automatically calculated from deliverables. You can also edit it manually.
                </Typography>
              </Box>

              {/* Deliverables */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Deliverables
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {counterOfferData.deliverables.map((deliverable, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          mb: 0.5,
                        }}
                      >
                        Deliverable Type
                      </Typography>
                      <Select
                        fullWidth
                        value={deliverable.deliverableType}
                        onChange={(e) =>
                          handleDeliverableChange(
                            index,
                            'deliverableType',
                            e.target.value
                          )
                        }
                        size="small"
                        sx={{
                          backgroundColor: '#0a0a0a',
                          color: '#3b82f6',
                          borderRadius: '8px',
                          fontWeight: 700,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                          },
                        }}
                      >
                        <MenuItem value="POST">Post</MenuItem>
                        <MenuItem value="REEL">Reel</MenuItem>
                        <MenuItem value="STORY">Story</MenuItem>
                        <MenuItem value="VIDEO">Video</MenuItem>
                        <MenuItem value="LIVE_STREAM">Live Stream</MenuItem>
                        <MenuItem value="ARTICLE">Article</MenuItem>
                        <MenuItem value="TWEET">Tweet</MenuItem>
                        <MenuItem value="THREAD">Thread</MenuItem>
                      </Select>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            mb: 0.5,
                          }}
                        >
                          Quantity
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={deliverable.quantity}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              'quantity',
                              e.target.value
                            )
                          }
                          size="small"
                          inputProps={{ min: 0 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#0a0a0a',
                              color: '#ffffff',
                              borderRadius: '8px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#2563eb',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            mb: 0.5,
                          }}
                        >
                          Price Per Unit (B$)
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={deliverable.pricePerUnit}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              'pricePerUnit',
                              e.target.value
                            )
                          }
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#0a0a0a',
                              color: '#ffffff',
                              borderRadius: '8px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#2563eb',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          mb: 0.5,
                        }}
                      >
                        Subtotal
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#22c55e',
                        }}
                      >
                        {formatPrice(
                          deliverable.quantity * deliverable.pricePerUnit
                        )}{' '}
                        B$
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseCounterOffer}
                  disabled={counterOfferLoading}
                  sx={{
                    flex: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitCounterOffer}
                  disabled={counterOfferLoading}
                  sx={{
                    flex: 1,
                    backgroundColor: '#2563eb',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#1d4ed8' },
                  }}
                >
                  {counterOfferLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Submit Counter Offer'
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Deal Details Dialog */}
      <Dialog
        open={dealDetailsModalOpen}
        onClose={handleCloseDealDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            maxHeight: '90vh',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InfoIcon sx={{ fontSize: 28, color: '#2563eb' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Deal Details
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseDealDetails}
              sx={{ color: '#9ca3af' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#0a0a0a', p: 3 }}>
          {selectedDealDetails && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: '#ffffff' }}
                >
                  {selectedDealDetails.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip
                    label={getStatusText(selectedDealDetails.status)}
                    sx={{
                      backgroundColor: getStatusColor(
                        selectedDealDetails.status
                      ),
                      color: '#ffffff',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={getCompensationTypeText(
                      selectedDealDetails.compensationType
                    )}
                    sx={{
                      backgroundColor: getCompensationTypeColor(
                        selectedDealDetails.compensationType
                      ),
                      color: '#ffffff',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              {selectedDealDetails.metrics && (
                <>
                  <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    <Box
                      sx={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        p: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        flex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          mb: 0.5,
                        }}
                      >
                        Current Views
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#3b82f6',
                        }}
                      >
                        {formatPrice(selectedDealDetails.metrics.currentViews)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        p: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        flex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          mb: 0.5,
                        }}
                      >
                        Target Views
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#22c55e',
                        }}
                      >
                        {formatPrice(selectedDealDetails.metrics.targetViews)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#9ca3af',
                        }}
                      >
                        Progress
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#3b82f6',
                        }}
                      >
                        {Math.round(
                          (selectedDealDetails.metrics.currentViews /
                            selectedDealDetails.metrics.targetViews) *
                          100
                        )}
                        %
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (selectedDealDetails.metrics.currentViews /
                          selectedDealDetails.metrics.targetViews) *
                        100
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#3b82f6',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Apply Now Dialog - UPDATED */}
      <Dialog
        open={applyNowDialogOpen}
        onClose={handleCloseApplyNowDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            maxHeight: '90vh',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InfoIcon sx={{ fontSize: 28, color: '#2563eb' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Available Offers
                </Typography>
                {selectedCampaignForApply && (
                  <Typography sx={{ fontSize: '14px', color: '#9ca3af', mt: 0.5 }}>
                    {selectedCampaignForApply.name}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseApplyNowDialog}
              sx={{ color: '#9ca3af' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: '#0a0a0a' }}>
          {campaignOffersLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress size={50} sx={{ color: '#2563eb' }} />
            </Box>
          ) : campaignOffers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <InfoIcon sx={{ fontSize: 64, color: '#6b7280', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: '#9ca3af', mb: 1 }}
              >
                No Offers Available
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#6b7280' }}>
                This campaign doesn't have any active offers at the moment.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {campaignOffers.map((offer, index) => (
                <Card
                  key={offer.offerId || index}
                  sx={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'rgba(37, 99, 235, 0.3)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  {/* Offer Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Offer #{offer.offerId}
                        </Typography>
                        {offer.status && (
                          <Chip
                            label={offer.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                offer.status === 'PENDING'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(34, 197, 94, 0.2)',
                              color:
                                offer.status === 'PENDING'
                                  ? '#f59e0b'
                                  : '#22c55e',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        sx={{
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#22c55e',
                        }}
                      >
                        {formatPrice(offer.totalBudget || 0)}{' '}
                        <span style={{ fontSize: '16px' }}>B$</span>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Offer Details */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                        >
                          Timeline
                        </Typography>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                          {formatTimeline(offer.startDate, offer.endDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}
                        >
                          KPI Requirement
                        </Typography>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                          {offer.kpiType}: {offer.kpiTarget}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Deliverables */}
                  {offer.deliverables && offer.deliverables.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#9ca3af',
                          mb: 2,
                          textTransform: 'uppercase',
                        }}
                      >
                        Deliverables ({offer.deliverables.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {offer.deliverables.map((deliverable, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Box
                              sx={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                p: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: '#ffffff',
                                  mb: 1,
                                }}
                              >
                                {deliverable.deliverableType
                                  ? deliverable.deliverableType.replace('_', ' ')
                                  : 'Deliverable'}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  mb: 0.5,
                                }}
                              >
                                Quantity: {deliverable.quantity || 0}
                              </Typography>
                              <Typography
                                sx={{ fontSize: '12px', color: '#9ca3af', mb: 1 }}
                              >
                                Per Unit:{' '}
                                {formatPrice(deliverable.pricePerUnit || 0)} B$
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: '#22c55e',
                                }}
                              >
                                Total:{' '}
                                {formatPrice(
                                  (deliverable.quantity || 0) *
                                  (deliverable.pricePerUnit || 0)
                                )}{' '}
                                B$
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Apply Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleApplyForOffer(offer)}
                    disabled={acceptingOfferId === offer.offerId}
                    sx={{
                      backgroundColor: '#2563eb',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#1d4ed8' },
                    }}
                  >
                    {acceptingOfferId === offer.offerId ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Apply for This Offer'
                    )}
                  </Button>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}