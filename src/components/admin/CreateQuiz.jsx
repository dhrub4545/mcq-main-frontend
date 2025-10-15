import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Chip,
  Snackbar,
  Card,
  CardContent,
  Slider,
  Paper,
  Fade,
  Grow,
  useTheme,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import SpeedIcon from '@mui/icons-material/Speed';
import QuizIcon from '@mui/icons-material/Quiz';

// API URL configuration for environment support - UNCHANGED
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const CreateQuiz = () => {
  const theme = useTheme();
  
  // ALL ORIGINAL STATE - UNCHANGED
  const [quizData, setQuizData] = useState({
    name: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wikipediaText, setWikipediaText] = useState('');
  const [showWikipedia, setShowWikipedia] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Enhanced number input handlers for mobile
  const handleQuestionCountChange = (newValue) => {
    const count = Math.min(50, Math.max(1, newValue));
    setQuizData({ ...quizData, questionCount: count });
  };

  const incrementQuestions = () => {
    if (quizData.questionCount < 50) {
      handleQuestionCountChange(quizData.questionCount + 1);
    }
  };

  const decrementQuestions = () => {
    if (quizData.questionCount > 1) {
      handleQuestionCountChange(quizData.questionCount - 1);
    }
  };

  const quickSelectCounts = [5, 10, 15, 20, 30, 50];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  // ALL ORIGINAL FUNCTIONS - COMPLETELY UNCHANGED
  const fetchWikipedia = async (topic) => {
    const endpoint = "https://en.wikipedia.org/w/api.php";
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts",
      exintro: true,
      explaintext: true,
      titles: topic,
      origin: "*"
    });

    try {
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia API returned ${response.status}`);

      const data = await response.json();
      const pages = data.query.pages;
      for (const pageId in pages) {
        if (pages[pageId].extract) {
          return pages[pageId].extract;
        }
      }
      return "No extract found for this topic.";
    } catch (error) {
      console.error("Wikipedia fetch error:", error);
      return `Error fetching data: ${error.message}`;
    }
  };

  const buildPrompt = (topic, difficulty, count, context = null) => {
    return `Generate exactly ${count} multiple-choice questions based on:
${context ? `Context:\n${context.substring(0, 2000)}\n\n` : ''}
Topic: ${topic}
Difficulty: ${difficulty}
Format each as: ["question", ["option1", "option2", "option3", "option4"], correctIndex]
Only return a valid JSON array, no other text or markdown.`;
  };

  const handleGenerateQuestions = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setGeneratedQuestions([]);

      if (!quizData.topic.trim()) throw new Error('Please enter a topic');

      const count = Math.max(1, Math.min(50, quizData.questionCount));

      let wikiContext = '';
      try {
        wikiContext = await fetchWikipedia(quizData.topic);
        if (wikiContext && !wikiContext.startsWith('Error')) {
          setWikipediaText(wikiContext);
          setShowWikipedia(true);
        }
      } catch (wikiError) {
        // console.log("Proceeding without Wikipedia context", wikiError);
      }

      const prompt = buildPrompt(
        quizData.topic,
        quizData.difficulty,
        count,
        wikiContext.startsWith('Error') ? null : wikiContext
      );

      const response = await fetch(`${API_URL}/api/generate-mcqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count })
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();
      const questions = Array.isArray(result) ? result :
        Array.isArray(result?.mcqs) ? result.mcqs :
          [];

      setGeneratedQuestions(
        questions.map(q => ({
          question: q[0] || 'No question text',
          options: Array.isArray(q[1]) ? q[1] : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: q[1]?.[q[2]] || q[1]?.[0] || 'Option 1',
          status: 'pending' // 'pending', 'accepted', or 'rejected'
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionStatus = (index, status) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index].status = status;
    setGeneratedQuestions(updatedQuestions);
  };

  const handleAddQuiz = async () => {
    try {
      if (!quizData.name.trim()) throw new Error('Quiz name is required');

      // Filter only accepted questions
      const acceptedQuestions = generatedQuestions.filter(q => q.status === 'accepted');
      if (acceptedQuestions.length === 0) throw new Error('No accepted questions to save');

      const quizToSave = {
        ...quizData,
        questionCount: acceptedQuestions.length,
        questions: acceptedQuestions
      };

      // Get auth token from localStorage
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizToSave)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save quiz');
      }

      setSnackbarMessage(`Quiz "${quizData.name}" saved successfully with ${acceptedQuestions.length} questions!`);
      setSnackbarOpen(true);

      // Reset form after successful save
      handleReset();

    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    setQuizData({
      name: '',
      topic: '',
      difficulty: 'medium',
      questionCount: 5
    });
    setGeneratedQuestions([]);
    setWikipediaText('');
    setShowWikipedia(false);
    setError(null);
  };

  // ALL ORIGINAL RENDER FUNCTIONS - UNCHANGED
  const renderWikipediaPanel = () => (
    <Collapse in={showWikipedia}>
      <Box sx={{ p: 2, mb: 3, border: '1px solid #ddd', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            <Chip label="Context" color="info" sx={{ mr: 1 }} />
            Wikipedia Content
          </Typography>
          <IconButton size="small" onClick={() => setShowWikipedia(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {wikipediaText.length > 500 ? `${wikipediaText.substring(0, 500)}...` : wikipediaText}
        </Typography>
      </Box>
    </Collapse>
  );

  const renderQuestions = () => (
    generatedQuestions.map((q, i) => (
      <Box
        key={i}
        sx={{
          mb: 3,
          p: 2,
          border: '1px solid #eee',
          borderRadius: 1,
          backgroundColor: q.status === 'accepted' ? '#f0fff0' :
            q.status === 'rejected' ? '#fff0f0' : 'inherit'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight="bold">{i + 1}. {q.question}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleQuestionStatus(i, 'accepted')}
              sx={{
                backgroundColor: q.status === 'accepted' ? '#4caf50' : 'inherit',
                color: q.status === 'accepted' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#4caf50',
                  color: 'white'
                }
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleQuestionStatus(i, 'rejected')}
              sx={{
                backgroundColor: q.status === 'rejected' ? '#f44336' : 'inherit',
                color: q.status === 'rejected' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#f44336',
                  color: 'white'
                }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box component="ul" sx={{ pl: 2, mt: 1, listStyleType: 'none' }}>
          {q.options.map((opt, j) => (
            <li
              key={j}
              style={{
                color: opt === q.correctAnswer ? 'green' : 'inherit',
                fontWeight: opt === q.correctAnswer ? 'bold' : 'normal'
              }}
            >
              {String.fromCharCode(97 + j)}. {opt}
            </li>
          ))}
        </Box>
        {q.status !== 'pending' && (
          <Typography
            variant="caption"
            color={q.status === 'accepted' ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
          >
            {q.status === 'accepted' ? <CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> :
              <ClearIcon fontSize="small" sx={{ mr: 0.5 }} />}
            {q.status.toUpperCase()}
          </Typography>
        )}
      </Box>
    ))
  );

  const acceptedCount = generatedQuestions.filter(q => q.status === 'accepted').length;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        
        {/* Enhanced Header */}
        <Fade in timeout={600}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 }, 
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  mr: 3, 
                  width: 56, 
                  height: 56,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <PsychologyIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{
                      fontWeight: 700,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                        : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: { xs: '2rem', sm: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Quiz Generator
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Create AI-powered quizzes with intelligent questions
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Enhanced Form */}
        <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
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
              mb: 4
            }}
          >
            <Box component="form" onSubmit={handleGenerateQuestions}>
              
              {/* Quiz Name */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <QuizIcon sx={{ mr: 1, color: '#ff4081' }} />
                  Quiz Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter a descriptive name for your quiz"
                  value={quizData.name}
                  onChange={(e) => setQuizData({ ...quizData, name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
                {/* Topic */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1, color: '#673ab7' }} />
                    Topic *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g., Cancer Biology, Machine Learning, World History"
                    value={quizData.topic}
                    onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Box>

                {/* Difficulty */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: getDifficultyColor(quizData.difficulty) }} />
                    Difficulty Level
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={quizData.difficulty}
                      onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                      sx={{ borderRadius: 3, fontSize: '1.1rem' }}
                    >
                      <MenuItem value="easy">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Easy</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Medium</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="hard">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Hard</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Enhanced Question Count Section */}
              <Card 
                variant="outlined"
                sx={{
                  mb: 4,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 3
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                    📊 Number of Questions (1-50)
                  </Typography>

                  {/* Enhanced Counter */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(187, 134, 252, 0.1) 0%, rgba(3, 218, 198, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                        borderRadius: 4,
                        minWidth: 280
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <IconButton 
                          onClick={decrementQuestions}
                          disabled={quizData.questionCount <= 1}
                          sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                            },
                            '&:disabled': { 
                              background: 'rgba(0,0,0,0.12)',
                              color: 'rgba(0,0,0,0.26)'
                            }
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 3 }}>
                          <Typography 
                            variant="h2" 
                            sx={{ 
                              fontWeight: 800,
                              fontSize: '3rem',
                              background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                                : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              lineHeight: 1
                            }}
                          >
                            {quizData.questionCount}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                            QUESTIONS
                          </Typography>
                        </Box>
                        
                        <IconButton 
                          onClick={incrementQuestions}
                          disabled={quizData.questionCount >= 50}
                          sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                            },
                            '&:disabled': { 
                              background: 'rgba(0,0,0,0.12)',
                              color: 'rgba(0,0,0,0.26)'
                            }
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Box>

                  {/* Quick Select */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2, fontWeight: 600 }}>
                      ⚡ QUICK SELECT
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                      {quickSelectCounts.map((count) => (
                        <Chip
                          key={count}
                          label={count}
                          onClick={() => handleQuestionCountChange(count)}
                          color={quizData.questionCount === count ? "primary" : "default"}
                          variant={quizData.questionCount === count ? "filled" : "outlined"}
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1rem',
                            px: 2,
                            py: 0.5,
                            height: 36,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.palette.mode === 'dark'
                                ? '0 4px 20px rgba(187, 134, 252, 0.3)'
                                : '0 4px 20px rgba(99, 102, 241, 0.25)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Slider */}
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={quizData.questionCount}
                      onChange={(e, newValue) => handleQuestionCountChange(newValue)}
                      min={1}
                      max={50}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 25, label: '25' },
                        { value: 50, label: '50' }
                      ]}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 24,
                          height: 24,
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #bb86fc 0%, #03dac6 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        },
                        '& .MuiSlider-track': {
                          height: 6,
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #bb86fc 0%, #03dac6 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading || !quizData.topic.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{
                    background: 'linear-gradient(135deg, #ff4081 0%, #f50057 100%)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 3,
                    minWidth: 200,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f50057 0%, #c51162 100%)',
                    }
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Questions'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grow>

        {/* ORIGINAL Wikipedia Panel - UNCHANGED */}
        {renderWikipediaPanel()}

        {/* ORIGINAL Questions Section - UNCHANGED */}
        {generatedQuestions.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h5">
                Generated Questions ({acceptedCount}/{generatedQuestions.length} accepted)
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleAddQuiz}
                disabled={!quizData.name.trim() || acceptedCount === 0}
              >
                Save Quiz
              </Button>
            </Box>
            {renderQuestions()}
          </Box>
        )}

        {/* ORIGINAL Snackbar - UNCHANGED */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Box>
    </Box>
  );
};

export default CreateQuiz;
