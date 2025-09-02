import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Container,
  Fade,
  Grow,
  useTheme,
  Avatar
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  History as HistoryIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const ViewResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
    } else {
      navigate('/user/quiz');
    }
  }, [location.state, navigate]);

  if (!results) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Card sx={{
            p: 6,
            textAlign: 'center',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 3,
          }}>
            <QuizIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom fontWeight="600">
              No quiz results found
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/user')}
              startIcon={<HomeIcon />}
              sx={{
                mt: 3,
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                }
              }}
            >
              Return to Dashboard
            </Button>
          </Card>
        </Fade>
      </Container>
    );
  }

  const scorePercentage = Math.round((results.score / results.total) * 100);
  const isPassing = scorePercentage >= 70;

  const getScoreColor = () => {
    if (scorePercentage >= 90) return '#4caf50';
    if (scorePercentage >= 80) return '#8bc34a';
    if (scorePercentage >= 70) return '#ffc107';
    return '#f44336';
  };

  const getScoreEmoji = () => {
    if (scorePercentage >= 90) return '🎉';
    if (scorePercentage >= 80) return '👏';
    if (scorePercentage >= 70) return '✅';
    return '📚';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 90) return 'Outstanding! You\'re a quiz master!';
    if (scorePercentage >= 80) return 'Great job! You know your stuff!';
    if (scorePercentage >= 70) return 'Good work! You passed the quiz!';
    return 'Keep practicing to improve your score!';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Fade in timeout={600}>
        <Box>
          {/* Enhanced Results Header */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              mb: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                align="center" 
                sx={{
                  fontWeight: 700,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                    : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  mb: 2
                }}
              >
                Quiz Results
              </Typography>

              {/* Time Warning Alert */}
              {results.timeUp && (
                <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 4,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 193, 7, 0.1)'
                        : 'rgba(255, 193, 7, 0.05)',
                      border: `1px solid ${theme.palette.mode === 'dark'
                        ? 'rgba(255, 193, 7, 0.3)'
                        : 'rgba(255, 193, 7, 0.2)'}`,
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimerIcon />
                      <Typography fontWeight="600">
                        Time ran out! Quiz was auto-submitted.
                      </Typography>
                    </Box>
                  </Alert>
                </Fade>
              )}

              {/* Quiz Info Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 3
                  }}
                >
                  {results.quizName}
                </Typography>

                {/* Metadata Chips */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1.5, 
                  mb: 4, 
                  flexWrap: 'wrap' 
                }}>
                  <Chip 
                    label={results.topic} 
                    icon={<SchoolIcon />}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(103, 58, 183, 0.2)' 
                        : 'rgba(103, 58, 183, 0.1)',
                      color: '#673ab7',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                  <Chip 
                    label={results.difficulty} 
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 152, 0, 0.2)' 
                        : 'rgba(255, 152, 0, 0.1)',
                      color: '#ff9800',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                  <Chip 
                    label={`${results.score}/${results.total} Correct`}
                    icon={<TrophyIcon />}
                    sx={{ 
                      backgroundColor: isPassing 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(76, 175, 80, 0.2)' 
                          : 'rgba(76, 175, 80, 0.1)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(244, 67, 54, 0.2)'
                          : 'rgba(244, 67, 54, 0.1)',
                      color: getScoreColor(),
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                </Box>
                
                {/* Score Display */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: { xs: 120, sm: 150 },
                      height: { xs: 120, sm: 150 },
                      mx: 'auto',
                      mb: 2,
                      background: `linear-gradient(45deg, ${getScoreColor()} 30%, ${getScoreColor()}aa 90%)`,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      fontWeight: 700,
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px ${getScoreColor()}33`
                        : `0 8px 32px ${getScoreColor()}22`
                    }}
                  >
                    {scorePercentage}%
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: getScoreColor(),
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {getScoreEmoji()} {getScoreMessage()}
                </Typography>
                
                {/* Enhanced Progress Bar */}
                <LinearProgress 
                  variant="determinate" 
                  value={scorePercentage} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6, 
                    mb: 3,
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(45deg, ${getScoreColor()} 30%, ${getScoreColor()}dd 90%)`,
                      borderRadius: 6
                    }
                  }} 
                />
                
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Completed on {new Date(results.date).toLocaleDateString()} at {new Date(results.date).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Enhanced Question Review Section */}
          <Grow in timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Paper
              elevation={0}
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  position: 'relative',
                  zIndex: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                📝 Question Review
              </Typography>

              <List sx={{ position: 'relative', zIndex: 1 }}>
                {results.answers.map((answer, index) => (
                  <Fade key={index} in timeout={800} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                    <Accordion 
                      sx={{ 
                        mb: 2,
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: 2,
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)',
                        },
                        '&.Mui-expanded': {
                          margin: '8px 0',
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ py: 1.5 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: answer.isCorrect ? 'success.main' : 'error.main',
                              fontSize: '1rem'
                            }}
                          >
                            {answer.isCorrect ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                          </Avatar>
                          <Typography 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              flex: 1
                            }}
                          >
                            Question {index + 1}: {answer.question.length > 60 
                              ? `${answer.question.substring(0, 60)}...` 
                              : answer.question}
                          </Typography>
                          <Chip
                            label={answer.isCorrect ? 'Correct' : 'Incorrect'}
                            color={answer.isCorrect ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(0,0,0,0.01)',
                            border: `1px solid ${theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: 2
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 600,
                                lineHeight: 1.4,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              {answer.question}
                            </Typography>
                            
                            <Divider sx={{ my: 2, opacity: 0.3 }} />
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography 
                                variant="body1" 
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Your answer:{' '}
                                <Box 
                                  component="span"
                                  sx={{ 
                                    color: answer.isCorrect ? 'success.main' : 'error.main',
                                    fontWeight: 700,
                                    p: 0.5,
                                    borderRadius: 1,
                                    background: answer.isCorrect 
                                      ? 'rgba(76, 175, 80, 0.1)' 
                                      : 'rgba(244, 67, 54, 0.1)'
                                  }}
                                >
                                  {answer.selected}
                                </Box>
                              </Typography>
                              
                              {!answer.isCorrect && (
                                <Typography 
                                  variant="body1" 
                                  gutterBottom
                                  sx={{ fontWeight: 600 }}
                                >
                                  Correct answer:{' '}
                                  <Box 
                                    component="span"
                                    sx={{ 
                                      color: 'success.main',
                                      fontWeight: 700,
                                      p: 0.5,
                                      borderRadius: 1,
                                      background: 'rgba(76, 175, 80, 0.1)'
                                    }}
                                  >
                                    {answer.correct}
                                  </Box>
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </AccordionDetails>
                    </Accordion>
                  </Fade>
                ))}
              </List>
            </Paper>
          </Grow>

          {/* Enhanced Action Buttons */}
          <Fade in timeout={1200} style={{ transitionDelay: '800ms' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center', 
                mt: 4,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'stretch'
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 180 },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(255, 64, 129, 0.4)'
                      : '0 8px 25px rgba(255, 64, 129, 0.35)',
                  }
                }}
              >
                Back to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/user/history')}
                startIcon={<HistoryIcon />}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 160 },
                  borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                  color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#4f46e5',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(187, 134, 252, 0.08)' 
                      : 'rgba(99, 102, 241, 0.08)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                View History
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/user/quiz')}
                startIcon={<QuizIcon />}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 180 },
                  borderColor: theme.palette.mode === 'dark' ? '#03dac6' : '#4caf50',
                  color: theme.palette.mode === 'dark' ? '#03dac6' : '#4caf50',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? '#03dac6' : '#2e7d32',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(3, 218, 198, 0.08)' 
                      : 'rgba(76, 175, 80, 0.08)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Take Another Quiz
              </Button>
            </Box>
          </Fade>
        </Box>
      </Fade>
    </Container>
  );
};

export default ViewResult;
