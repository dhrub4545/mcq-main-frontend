import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuizIcon from '@mui/icons-material/Quiz';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const TestHistory = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  // Add theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Load results from server
  const loadResults = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/test-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test history');
      }

      const data = await response.json();
      
      // Sort results by date in descending order (newest first)
      const sortedResults = (data.results || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setTestResults(sortedResults);

    } catch (err) {
      console.error('Error loading test results:', err);
      setError(err.message || 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const viewResultDetails = (result) => {
    navigate('/user/view-result', { state: { results: result } });
  };

  const deleteResult = async (resultId) => {
    try {
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      const response = await fetch(`${API_URL}/api/test-history/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete test result');
      }

      loadResults();
      setSnackbarMessage('Result deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting test result:', err);
      setError(err.message);
      setSnackbarMessage('Error deleting result');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // LeetCode-style heatmap data preparation
  const prepareHeatmapData = () => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const heatmapData = [];

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayResults = testResults.filter(result =>
        new Date(result.date).toISOString().split('T')[0] === dateStr
      );

      heatmapData.push({
        date: dateStr,
        count: dayResults.length,
        scores: dayResults.map(r => Math.round((r.score / r.total) * 100)),
        avgScore: dayResults.length > 0 ? Math.round(
          dayResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / dayResults.length
        ) : 0
      });
    }

    return heatmapData;
  };

  // LeetCode-style progress data
  const prepareProgressData = (quizzes) => {
    return quizzes
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((result, index) => ({
        day: index + 1,
        date: new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round((result.score / result.total) * 100),
        quizName: result.quizName,
        topic: result.topic
      }));
  };

  const isMockQuiz = (quizName) => {
    return quizName && quizName.toLowerCase().includes('mock quiz');
  };

  const regularQuizzes = testResults.filter(result => !isMockQuiz(result.quizName));
  const mockQuizzes = testResults.filter(result => isMockQuiz(result.quizName));

  const heatmapData = prepareHeatmapData();
  const regularProgressData = prepareProgressData(regularQuizzes);
  const mockProgressData = prepareProgressData(mockQuizzes);

  // Enhanced heatmap component with theme support
  const HeatmapCalendar = ({ data }) => {
    const getIntensity = (count, avgScore) => {
      if (count === 0) return 0;
      if (count === 1 && avgScore < 50) return 1;
      if (count === 1 && avgScore >= 50) return 2;
      if (count >= 2 && avgScore < 70) return 2;
      if (count >= 2 && avgScore >= 70) return 3;
      return 4;
    };

    const getColor = (intensity) => {
      const darkMode = theme.palette.mode === 'dark';
      const colors = darkMode
        ? ['rgba(255,255,255,0.05)', '#0e4429', '#006d32', '#26a641', '#39d353']
        : ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
      return colors[intensity] || colors[0];
    };

    return (
      <Box sx={{ overflowX: 'auto', py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Quiz activity over the past year
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
          minWidth: isSmallScreen ? '280px' : '600px',
          justifyContent: 'center',
          px: 2
        }}>
          {data.map((day, index) => (
            <Tooltip
              key={day.date}
              title={
                <Box>
                  <Typography variant="body2">
                    {day.count} quiz{day.count !== 1 ? 'es' : ''} on {new Date(day.date).toLocaleDateString()}
                  </Typography>
                  {day.count > 0 && (
                    <Typography variant="caption">
                      Average score: {day.avgScore}%
                    </Typography>
                  )}
                </Box>
              }
            >
              <Box
                sx={{
                  width: isSmallScreen ? 8 : 11,
                  height: isSmallScreen ? 8 : 11,
                  backgroundColor: getColor(getIntensity(day.count, day.avgScore)),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: 'scale(1.2)'
                  }
                }}
              />
            </Tooltip>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
          <Typography variant="caption" color="text.secondary">Less</Typography>
          <Box sx={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2, 3, 4].map(intensity => (
              <Box
                key={intensity}
                sx={{
                  width: 11,
                  height: 11,
                  backgroundColor: getColor(intensity),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">More</Typography>
        </Box>
      </Box>
    );
  };

  // Enhanced progress chart with theme support
  const ProgressChart = ({ data, title, color, icon: Icon }) => (
    <Card
      elevation={6}
      sx={{
        width: '100%',
        height: { xs: 400, md: 450 }, // Fixed height for consistency
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme.shadows[16]
        }
      }}
    >
      <CardContent sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Enhanced Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: `2px solid ${color}20`
        }}>
          {Icon && (
            <Box sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ fontSize: { xs: 20, md: 24 }, color: color }} />
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Track your performance over time
            </Typography>
          </Box>
        </Box>

        {data.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: { xs: 3, md: 4 },
            color: 'text.secondary',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: `${color}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <AssessmentIcon sx={{ fontSize: 32, color: `${color}60` }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
              No data available
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, maxWidth: 250, lineHeight: 1.5, fontSize: '0.9rem' }}>
              Start taking quizzes to see your progress visualization and track improvement trends
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/user/quiz')}
              size="small"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem',
                backgroundColor: color,
                '&:hover': {
                  backgroundColor: `${color}dd`
                }
              }}
            >
              START TAKING QUIZZES
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chart Statistics */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
              p: 1.5,
              backgroundColor: `${color}08`,
              borderRadius: 2,
              border: `1px solid ${color}20`
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: '1.1rem' }}>
                  {data.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Total Attempts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: '1.1rem' }}>
                  {data.length > 0 ? Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Average Score
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: '1.1rem' }}>
                  {data.length > 0 ? Math.max(...data.map(item => item.score)) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Best Score
                </Typography>
              </Box>
            </Box>

            {/* Enhanced Chart */}
            <Box sx={{ flex: 1, minHeight: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                      <stop offset="50%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="5 5"
                    stroke={theme.palette.divider}
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                      border: `2px solid ${color}`,
                      borderRadius: '12px',
                      color: theme.palette.text.primary,
                      fontSize: '13px',
                      fontWeight: 500,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`,
                    }}
                    formatter={(value, name, props) => [
                      <span style={{ color: color, fontWeight: 700 }}>{value}%</span>,
                      'Score'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return (
                          <div style={{ marginBottom: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>
                              {payload[0].payload.quizName}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                              {label} • {payload[0].payload.topic}
                            </div>
                          </div>
                        );
                      }
                      return label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={color}
                    strokeWidth={3}
                    fill={`url(#gradient-${color.replace('#', '')})`}
                    dot={{
                      fill: color,
                      strokeWidth: 2,
                      r: 4,
                      stroke: theme.palette.background.paper,
                    }}
                    activeDot={{
                      r: 6,
                      fill: color,
                      stroke: theme.palette.background.paper,
                      strokeWidth: 2,
                    }}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Centralized and Equal-Sized Statistics Component
  const StatsCard = ({ title, value, subtitle, icon: Icon, color, bgColor }) => (
    <Card
      elevation={4}
      sx={{
        textAlign: 'center',
        width: { xs: 160, sm: 180, md: 200 },
        height: { xs: 140, sm: 160, md: 180 },
        background: bgColor ? `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)` : 'background.paper',
        border: `2px solid ${color}20`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[12],
          border: `2px solid ${color}40`
        }
      }}
    >
      <CardContent sx={{
        py: { xs: 2, md: 3 },
        px: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {Icon && (
          <Icon sx={{
            fontSize: { xs: 28, md: 36 },
            color: color,
            mb: 1.5
          }} />
        )}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: color,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            mb: 1,
            lineHeight: 1
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.8rem', md: '0.9rem' },
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadResults}>
          Retry
        </Button>
      </Container>
    );
  }

  // Calculate stats
  const totalQuizzes = testResults.length;
  const avgScore = totalQuizzes > 0 ? Math.round(
    testResults.reduce((acc, result) => acc + (result.score / result.total * 100), 0) / totalQuizzes
  ) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Enhanced Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: '2.5rem', md: '4rem' },
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.error.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Progress Tracker
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            fontSize: { xs: '1.1rem', md: '1.4rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.4
          }}
        >
          Monitor your quiz performance, track improvement trends, and achieve your learning goals
        </Typography>
      </Box>

      {testResults.length === 0 ? (
        <Paper sx={{
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          maxWidth: 800,
          mx: 'auto',
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
          border: `2px solid ${theme.palette.divider}`
        }}>
          <EmojiEventsIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 3 }} />
          <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
            Take your first quiz to unlock detailed analytics, progress tracking, and performance insights
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/user/quiz')}
              startIcon={<QuizIcon />}
              size="large"
              fullWidth
              sx={{ py: 2, borderRadius: 3, fontWeight: 600 }}
            >
              Browse Quizzes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/user/mock-quiz')}
              startIcon={<SmartToyIcon />}
              size="large"
              fullWidth
              sx={{ py: 2, borderRadius: 3, fontWeight: 600 }}
            >
              Create Mock Quiz
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          {/* CENTRALIZED AND EQUAL-SIZED STATS OVERVIEW */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 2, md: 3 },
              mb: 6,
              maxWidth: 900,
              mx: 'auto'
            }}
          >
            <StatsCard
              title="Total Solved"
              value={totalQuizzes}
              icon={QuizIcon}
              color={theme.palette.primary.main}
              bgColor={theme.palette.primary.main}
            />
            <StatsCard
              title="Average Score"
              value={`${avgScore}%`}
              icon={TrendingUpIcon}
              color={theme.palette.success.main}
              bgColor={theme.palette.success.main}
            />
            <StatsCard
              title="Regular Quizzes"
              value={regularQuizzes.length}
              icon={QuizIcon}
              color={theme.palette.info.main}
              bgColor={theme.palette.info.main}
            />
            <StatsCard
              title="Mock Quizzes"
              value={mockQuizzes.length}
              icon={SmartToyIcon}
              color={theme.palette.warning.main}
              bgColor={theme.palette.warning.main}
            />
          </Box>

          {/* Enhanced Progress Charts - Increased Width Only */}
          <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                mb: 4,
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              Performance Analytics
            </Typography>
            {/* Wider Container for Charts */}
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={6} sx={{ maxWidth: { md: 650 } }}>
                <ProgressChart
                  data={regularProgressData}
                  title="Regular Quiz Progress"
                  color={theme.palette.primary.main}
                  icon={QuizIcon}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ maxWidth: { md: 650 } }}>
                <ProgressChart
                  data={mockProgressData}
                  title="Mock Quiz Progress"
                  color={theme.palette.warning.main}
                  icon={SmartToyIcon}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Enhanced Activity Heatmap */}
          <Paper sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            borderRadius: 4,
            border: `2px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
            maxWidth: 1000,
            mx: 'auto'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <CalendarTodayIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: 'text.primary'
                }}
              >
                Activity Overview
              </Typography>
            </Box>
            <HeatmapCalendar data={heatmapData} />
          </Paper>

          {/* Enhanced Recent Activity Table */}
          <Paper sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: `2px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
            maxWidth: 1200,
            mx: 'auto'
          }}>
            <Box sx={{ p: { xs: 3, md: 4 }, pb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  justifyContent: 'center'
                }}
              >
                <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
                Recent Submissions
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Your latest quiz attempts and performance
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        py: 2.5,
                        backgroundColor: theme.palette.action.hover
                      }}>
                        Quiz
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        backgroundColor: theme.palette.action.hover
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        backgroundColor: theme.palette.action.hover
                      }}>
                        Score
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        backgroundColor: theme.palette.action.hover
                      }}>
                        Date
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        backgroundColor: theme.palette.action.hover
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testResults.slice(0, 10).map((result) => {
                      const scorePercent = Math.round((result.score / result.total) * 100);
                      const isAccepted = scorePercent >= 70;
                      return (
                        <TableRow
                          key={result._id}
                          sx={{
                            '&:hover': { backgroundColor: 'action.hover' },
                            transition: 'background-color 0.3s ease-in-out'
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  mb: 0.5,
                                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                                }}
                              >
                                {result.quizName}
                              </Typography>
                              <Chip
                                label={result.topic}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: { xs: '0.65rem', md: '0.75rem' },
                                  height: { xs: 20, md: 24 }
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={isMockQuiz(result.quizName) ? <SmartToyIcon fontSize="small" /> : <QuizIcon fontSize="small" />}
                              label={isMockQuiz(result.quizName) ? "Mock" : "Quiz"}
                              size="small"
                              color={isMockQuiz(result.quizName) ? "warning" : "primary"}
                              sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${scorePercent}%`}
                              size="small"
                              color={isAccepted ? "success" : scorePercent >= 40 ? "warning" : "error"}
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.65rem', md: '0.75rem' }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                            >
                              {new Date(result.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: isMobile ? '2-digit' : 'numeric'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View details">
                                <IconButton
                                  size="small"
                                  onClick={() => viewResultDetails(result)}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete result">
                                <IconButton
                                  size="small"
                                  onClick={() => deleteResult(result._id)}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': { backgroundColor: 'error.main', color: 'white' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? 'error' : 'success'}
          sx={{ borderRadius: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TestHistory;
