'use client';

import { Box, Card, Typography, Button, ButtonGroup, Select, FormControl, MenuItem, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService/dashboard';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Map API month codes to display names
const apiMonthToDisplay = {
  'JAN': 'Jan', 'FEB': 'Feb', 'MAR': 'Mar', 'APR': 'Apr',
  'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul', 'AUG': 'Aug',
  'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov', 'DEC': 'Dec'
};

// Map API day codes to display names
const apiDayToDisplay = {
  'MON': 'Mon', 'TUE': 'Tue', 'WED': 'Wed', 'THU': 'Thu',
  'FRI': 'Fri', 'SAT': 'Sat', 'SUN': 'Sun'
};

// Helper to format currency value for display
const formatValue = (value) => {
  if (value === null || value === undefined) return '0';
  const num = Number(value);

  if (num === 0) return '0';

  // Show up to 6 decimal places for small values
  if (num < 0.01) {
    return num.toFixed(8).replace(/\.?0+$/, '');
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

export default function RevenueBreakdown({ onError }) {
  const [period, setPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [period, selectedYear, selectedMonth]);

  const fetchRevenueData = async () => {
    setLoading(true);
    const creatorId = localStorage.getItem('childUserId');

    if (!creatorId) {
      if (onError) onError('User ID not found. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      let url = `${API_BASE_URL}/revenueBreakdown/${creatorId}`;

      if (period === 'week') {
        url += '/week';
      } else if (period === 'month') {
        url += `/month?range=${selectedMonth + 1}`;
      } else if (period === 'year') {
        url += `/year?range=${selectedYear}`;
      }

      const response = await apiClient.get(url);

      if (response.data && response.data.success) {
        const apiData = response.data.data;

        console.log('API Response for', period, ':', apiData); // Debug log

        // Transform API data to match component format
        const transformedData = apiData.map(item => {
          let label = item.revenueType;

          // Convert API labels to display format
          if (period === 'year' && apiMonthToDisplay[item.revenueType]) {
            label = apiMonthToDisplay[item.revenueType];
          } else if (period === 'week' && apiDayToDisplay[item.revenueType]) {
            label = apiDayToDisplay[item.revenueType];
          } else if (period === 'month') {
            label = item.revenueType; // Week 1, Week 2, etc.
          }

          return {
            label,
            value: item.revenueAmount || 0,
            displayValue: formatValue(item.revenueAmount)
          };
        });

        setData(transformedData);

        // Show info message if all values are 0
        const allZero = transformedData.every(item => item.value === 0);
        if (allZero && transformedData.length > 0) {
          if (onError) onError(`No revenue data found for ${period} view`, 'info');
        }
      } else {
        if (onError) onError(response.data?.message || 'Failed to fetch revenue data', 'error');
      }
    } catch (error) {
      console.error('Revenue Breakdown Fetch Error:', error);
      if (onError) onError('Error connecting to revenue service', 'error');

      // Fallback to mock data if API fails
      const mockData = getMockData();
      setData(mockData.map(item => ({
        ...item,
        displayValue: formatValue(item.value)
      })));
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data generator for when API fails
  const getMockData = () => {
    if (period === 'week') {
      return [
        { label: 'Mon', value: 85 },
        { label: 'Tue', value: 65 },
        { label: 'Wed', value: 72 },
        { label: 'Thu', value: 58 },
        { label: 'Fri', value: 90 },
        { label: 'Sat', value: 75 },
        { label: 'Sun', value: 68 },
      ];
    } else if (period === 'month') {
      return [
        { label: 'Week 1', value: 0 },
        { label: 'Week 2', value: 0 },
        { label: 'Week 3', value: 0.000016 },
        { label: 'Week 4', value: 0.000136 },
        { label: 'Week 5', value: 0 },
      ];
    } else {
      return [
        { label: 'Jan', value: 65 },
        { label: 'Feb', value: 75 },
        { label: 'Mar', value: 85 },
        { label: 'Apr', value: 70 },
        { label: 'May', value: 95 },
        { label: 'Jun', value: 88 },
        { label: 'Jul', value: 78 },
        { label: 'Aug', value: 92 },
        { label: 'Sep', value: 85 },
        { label: 'Oct', value: 80 },
        { label: 'Nov', value: 90 },
        { label: 'Dec', value: 95 },
      ];
    }
  };

  const maxValue = data.length > 0 ? Math.max(...data.map(item => item.value), 1) : 1;

  return (
    <Card
      sx={{
        backgroundColor: '#2d2d2d',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        p: { xs: 2, sm: 3 },
        // Increased height for mobile only
        minHeight: { xs: '450px', sm: 'auto' },
        height: { xs: 'auto', sm: '100%' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '18px', sm: '20px' },
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          Revenue Breakdown
        </Typography>

        {/* Show button group only on desktop */}
        <ButtonGroup
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexWrap: 'wrap',
            '& .MuiButtonGroup-grouped': {
              minWidth: 'auto',
            },
          }}
        >
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              sx={{
                backgroundColor: period === p ? '#2563eb' : 'transparent',
                color: period === p ? '#ffffff' : '#9ca3af',
                textTransform: 'capitalize',
                px: 2.5,
                py: 0.75,
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: period === p ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Mobile: Filters in Same Row */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Filter Buttons */}
        <ButtonGroup size="small">
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              sx={{
                backgroundColor: period === p ? '#2563eb' : 'transparent',
                color: period === p ? '#ffffff' : '#9ca3af',
                textTransform: 'capitalize',
                px: 1.5,
                py: 0.5,
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: '50px',
                '&:hover': {
                  backgroundColor: period === p ? '#1d4ed8' : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </ButtonGroup>

        {/* Dropdown - Only show if month or year is selected */}
        {(period === 'month' || period === 'year') && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={period === 'month' ? selectedMonth : selectedYear}
              onChange={(e) => period === 'month' ? setSelectedMonth(e.target.value) : setSelectedYear(e.target.value)}
              sx={{
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '11px',
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1.5,
                },
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
              {period === 'month' ? (
                months.map((month, index) => (
                  <MenuItem
                    key={month}
                    value={index}
                    sx={{
                      color: '#ffffff',
                      backgroundColor: '#2d2d2d',
                      fontSize: '11px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {month.substring(0, 3)}
                  </MenuItem>
                ))
              ) : (
                years.map((year) => (
                  <MenuItem
                    key={year}
                    value={year}
                    sx={{
                      color: '#ffffff',
                      backgroundColor: '#2d2d2d',
                      fontSize: '11px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {year}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Desktop: Dropdowns Container */}
      {(period === 'month' || period === 'year') && (
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'flex-end',
            mb: 3,
            flexShrink: 0,
          }}
        >
          {period === 'month' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                p: 2,
                minWidth: '300px',
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Select Month:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      py: 0.75,
                      px: 2,
                    },
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
                  {months.map((month, index) => (
                    <MenuItem
                      key={month}
                      value={index}
                      sx={{
                        color: '#ffffff',
                        backgroundColor: '#2d2d2d',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {month} {currentYear}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {period === 'year' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                p: 2,
                minWidth: '300px',
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Select Year:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      py: 0.75,
                      px: 2,
                    },
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
                  {years.map((year) => (
                    <MenuItem
                      key={year}
                      value={year}
                      sx={{
                        color: '#ffffff',
                        backgroundColor: '#2d2d2d',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )}

      {/* Chart Container with Horizontal Scroll on Mobile */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress sx={{ color: '#2563eb' }} />
          </Box>
        ) : (
          <>
            {data.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  No revenue data available
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowX: { xs: 'auto', lg: 'hidden' },
                  overflowY: 'hidden',
                  pb: { xs: 1, sm: 0 },
                  // Custom scrollbar styling for better mobile experience
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: {
                      xs: `${Math.max(data.length * 75, 300)}px`,
                      sm: `${Math.max(data.length * 90, 400)}px`,
                      md: `${Math.max(data.length * 100, 500)}px`,
                      lg: '100%'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  {/* Chart Bars */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      // Increased height significantly for mobile
                      height: { xs: '280px', sm: '220px', md: '240px' },
                      flex: 1,
                      px: { xs: 1, sm: 1.5 },
                      mb: { xs: 1.5, sm: 2 },
                    }}
                  >
                    {data.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: { xs: '55px', sm: '70px', md: '80px' },
                          gap: 1,
                          height: '100%',
                          position: 'relative',
                        }}
                      >
                        {/* Value Tooltip (shown on hover - hidden on mobile) */}
                        <Box
                          className="value-tooltip"
                          sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'absolute',
                            bottom: '100%',
                            mb: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            color: '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            pointerEvents: 'none',
                            zIndex: 10,
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              borderWidth: '6px',
                              borderStyle: 'solid',
                              borderColor: 'rgba(0, 0, 0, 0.9) transparent transparent transparent',
                            }
                          }}
                        >
                          B$ {item.displayValue}
                        </Box>

                        {/* Bar Container */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '100%',
                            width: '100%',
                            '&:hover .value-tooltip': {
                              opacity: 1,
                            },
                          }}
                        >
                          {/* Bar */}
                          <Box
                            sx={{
                              width: '100%',
                              height: `${(item.value / maxValue) * 100}%`,
                              minHeight: '4px',
                              backgroundColor: period === 'month' ? '#10b981' : period === 'year' ? '#8b5cf6' : '#2563eb',
                              borderRadius: '8px 8px 0 0',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: period === 'month' ? '#0da271' : period === 'year' ? '#7c4dff' : '#1d4ed8',
                                transform: { xs: 'none', md: 'translateY(-4px)' },
                              },
                              // Show value on tap for mobile
                              '&:active::after': {
                                content: { xs: `"B$ ${item.displayValue}"`, md: '""' },
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                color: '#ffffff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                marginBottom: '4px',
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Labels */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      px: { xs: 1, sm: 1.5 },
                      mt: { xs: 1, sm: 1.5 },
                      mb: { xs: 1, sm: 1.5 },
                    }}
                  >
                    {data.map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          flex: 1,
                          minWidth: { xs: '55px', sm: '70px', md: '80px' },
                          color: '#9ca3af',
                          fontSize: { xs: '11px', sm: '12px', md: '13px' },
                          fontWeight: 500,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.label}
                      </Typography>
                    ))}
                  </Box>

                  {/* Period Info */}
                  {(period === 'month' || period === 'year') && (
                    <Typography
                      sx={{
                        mt: { xs: 2, sm: 2.5, md: 3 },
                        color: '#9ca3af',
                        fontSize: { xs: '10px', sm: '11px', md: '12px' },
                        textAlign: 'center',
                        fontStyle: 'italic',
                        px: 1,
                      }}
                    >
                      {period === 'month'
                        ? `Showing weekly data for ${months[selectedMonth]} ${currentYear}`
                        : `Showing monthly data for ${selectedYear}`}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}