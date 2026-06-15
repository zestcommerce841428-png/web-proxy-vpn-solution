'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Language,
  Security,
  Speed,
  Visibility,
  Send,
  History,
  Settings,
  CheckCircle,
  Error as ErrorIcon,
  OpenInNew,
  Delete,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoRedirect: false,
    saveHistory: true,
    showNotifications: true,
  });

  // Check proxy server status on mount
  useEffect(() => {
    checkServerStatus();
    loadHistory();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem('proxyHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const saveToHistory = (url) => {
    if (!settings.saveHistory) return;
    
    const newHistory = [
      { url, timestamp: new Date().toISOString() },
      ...history.filter(item => item.url !== url).slice(0, 9)
    ];
    setHistory(newHistory);
    localStorage.setItem('proxyHistory', JSON.stringify(newHistory));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL format
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    try {
      new URL(targetUrl);
    } catch (err) {
      setError('Invalid URL format. Please enter a valid URL.');
      return;
    }

    setLoading(true);

    try {
      // Check if server is online first
      if (serverStatus === 'offline') {
        throw new Error('Proxy server is offline. Please start it with: npm run proxy');
      }

      const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(targetUrl)}`;
      
      // Always open in new tab for better reliability
      window.open(proxyUrl, '_blank');
      setSuccess(`✅ Opening ${targetUrl} through proxy in new tab...`);
      saveToHistory(targetUrl);
      
      // Clear the input after successful submission
      setUrl('');
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openProxiedUrl = (targetUrl) => {
    const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(targetUrl)}`;
    window.open(proxyUrl, '_blank');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('proxyHistory');
  };

  const deleteHistoryItem = (urlToDelete) => {
    const newHistory = history.filter(item => item.url !== urlToDelete);
    setHistory(newHistory);
    localStorage.setItem('proxyHistory', JSON.stringify(newHistory));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Language sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h2" component="h1" gutterBottom>
            Web Proxy
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Access blocked websites securely and privately
          </Typography>
          
          {/* Server Status */}
          <Chip
            icon={serverStatus === 'online' ? <CheckCircle /> : <ErrorIcon />}
            label={
              serverStatus === 'online'
                ? 'Proxy Server Online'
                : serverStatus === 'offline'
                ? 'Proxy Server Offline'
                : 'Checking...'
            }
            color={serverStatus === 'online' ? 'success' : 'error'}
            sx={{ fontSize: '0.9rem', py: 2.5 }}
          />
        </Box>

        {/* Main Proxy Form */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              💡 Enter a <strong>complete website URL</strong> (e.g., google.com, github.com, wikipedia.org)
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter full website URL (e.g., example.com or https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || serverStatus === 'offline'}
                  helperText="Protocol (http/https) is optional - will be added automatically"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginLeft: 0,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || serverStatus === 'offline'}
                  sx={{
                    minWidth: 120,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  {loading ? 'Loading' : 'Access'}
                </Button>
              </Box>
            </form>

            {/* Alert Messages */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Security sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Secure Browsing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse blocked websites securely with encrypted connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Speed sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Fast Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High-speed proxy servers for seamless browsing experience
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Visibility sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Anonymous
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse anonymously without exposing your identity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Settings and History Section */}
        <Grid container spacing={3}>
          {/* Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings color="primary" />
                  <Typography variant="h6">Settings</Typography>
                </Box>
                <IconButton onClick={() => setShowSettings(!showSettings)}>
                  {showSettings ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={showSettings}>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoRedirect}
                      onChange={(e) => setSettings({ ...settings, autoRedirect: e.target.checked })}
                    />
                  }
                  label="Auto-open in new tab"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.saveHistory}
                      onChange={(e) => setSettings({ ...settings, saveHistory: e.target.checked })}
                    />
                  }
                  label="Save browsing history"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showNotifications}
                      onChange={(e) => setSettings({ ...settings, showNotifications: e.target.checked })}
                    />
                  }
                  label="Show notifications"
                />
              </Collapse>
            </Paper>
          </Grid>

          {/* History */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History color="primary" />
                  <Typography variant="h6">Recent History</Typography>
                </Box>
                {history.length > 0 && (
                  <Button size="small" onClick={clearHistory} startIcon={<Delete />}>
                    Clear
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No history yet
                </Typography>
              ) : (
                <List dense>
                  {history.map((item, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => openProxiedUrl(item.url)}
                            sx={{ mr: 1 }}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => deleteHistoryItem(item.url)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <Language fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.url}
                        secondary={new Date(item.timestamp).toLocaleString()}
                        primaryTypographyProps={{
                          sx: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Note: Make sure to start the proxy server before using the app
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Run: <code style={{ background: '#334155', padding: '2px 8px', borderRadius: '4px' }}>npm run proxy</code> in a separate terminal
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
