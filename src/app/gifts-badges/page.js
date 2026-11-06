'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import GiftStatsHero from '@/components/gifts/GiftStatsHero';
import GiftTabs from '@/components/gifts/GiftTabs';
import RecentGifts from '@/components/gifts/RecentGifts';
import TopSupporters from '@/components/gifts/TopSupporters';
import GiftAnalytics from '@/components/gifts/GiftAnalytics';
import LeaderboardModal from '@/components/gifts/LeaderboardModal';
import ThankModal from '@/components/gifts/ThankModal';
import GiftSettingsModal from '@/components/gifts/GiftSettingsModal';

export default function GiftsAndBadgesPage() {
  const [activeTab, setActiveTab] = useState('recent');
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [thankModalOpen, setThankModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedSupporter, setSelectedSupporter] = useState(null);
  const [refreshRecentKey, setRefreshRecentKey] = useState(0);
  const [refreshSupportersKey, setRefreshSupportersKey] = useState(0);

  const handleThankClick = (supporter) => {
    // Don't open modal if already thanked/celebrated
    if (supporter.type === 'gift' && supporter.isThanked === 'Y') {
      return;
    }
    if (supporter.type === 'badge' && supporter.celebrateStatus === 'Y') {
      return;
    }

    // Determine the type based on the data structure
    let supporterType = supporter.type;

    // If no type property exists, determine it from the data
    if (!supporterType) {
      if (supporter.totalSupport !== undefined || supporter.rank !== undefined) {
        // This is from TopSupporters component
        supporterType = 'supporter';
      } else if (supporter.badgeLevel || supporter.badgeEmoji) {
        // This is a badge
        supporterType = 'badge';
      } else if (supporter.amount || supporter.giftType) {
        // This is a gift
        supporterType = 'gift';
      }
    }

    setSelectedSupporter({
      ...supporter,
      type: supporterType
    });
    setThankModalOpen(true);
  };

  const handleThankSuccess = () => {
    // Refresh both recent gifts and top supporters
    setRefreshRecentKey(prev => prev + 1);
    setRefreshSupportersKey(prev => prev + 1);
  };

  const handleViewLeaderboard = () => {
    setLeaderboardOpen(true);
  };

  const handleSettingsClick = () => {
    setSettingsModalOpen(true);
  };

  return (
    <Box>
      {/* Hero Section */}
      <GiftStatsHero onSettingsClick={handleSettingsClick} />

      {/* Tabs */}
      <GiftTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content - Always render all tabs but show only active one */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: activeTab === 'recent' ? 'block' : 'none' }}>
          <RecentGifts
            key={refreshRecentKey}
            onThankClick={handleThankClick}
            isActive={activeTab === 'recent'}
          />
        </Box>

        <Box sx={{ display: activeTab === 'supporters' ? 'block' : 'none' }}>
          <TopSupporters
            key={refreshSupportersKey}
            onThankClick={handleThankClick}
            onViewLeaderboard={handleViewLeaderboard}
            isActive={activeTab === 'supporters'}
          />
        </Box>

        <Box sx={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
          <GiftAnalytics isActive={activeTab === 'analytics'} />
        </Box>
      </Box>

      {/* Modals */}
      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      <ThankModal
        open={thankModalOpen}
        onClose={() => setThankModalOpen(false)}
        supporter={selectedSupporter}
        onSuccess={handleThankSuccess}
      />

      <GiftSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </Box>
  );
}