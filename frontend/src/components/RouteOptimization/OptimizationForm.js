import React, { useState, useEffect } from "react";
import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Box,
  Card,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
// Updated imports for academic-style icons
import DeleteIcon from "@mui/icons-material/Delete";
import DataObjectIcon from "@mui/icons-material/DataObject";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FunctionsIcon from '@mui/icons-material/Functions';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';

// Create an academic-focused theme with improved readability and customer-friendly colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005b96', // Clear blue - easier to distinguish
      light: '#428bca',
      dark: '#003d66',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c7c3e', // Forest green - clear contrast with blue
      light: '#4c9e5e',
      dark: '#1e5a2c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#111111', // Darker text for better readability
      secondary: '#333333', // Darker secondary text
    },
    error: {
      main: '#d32f2f', // Brighter red for better visibility
    },
    warning: {
      main: '#ed6c02', // Brighter orange for warnings
    },
    info: {
      main: '#0288d1', // Brighter blue for information
    },
    success: {
      main: '#2e7d32', // Brighter green for success
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif', // More readable fonts
    h4: {
      fontWeight: 700,
      fontSize: '2rem', // Larger heading
      letterSpacing: '0.01em',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.6rem', // Larger subheading
      letterSpacing: '0.01em',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.3rem', // Larger h6
      letterSpacing: '0.01em',
    },
    subtitle1: {
      fontWeight: 700, // Bolder
      fontSize: '1.2rem', // Larger
      color: '#333333',
    },
    body1: {
      fontSize: '1.1rem', // Larger body text
      lineHeight: 1.7, // Improved line spacing
      fontWeight: 500, // Slightly bolder for better readability
    },
    body2: {
      fontSize: '1rem', // Larger secondary body text
      lineHeight: 1.6,
      fontWeight: 500, // Slightly bolder
    },
    button: {
      fontWeight: 600, // Bolder buttons
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontSize: '0.95rem', // Larger button text
    },
    caption: {
      fontSize: '0.9rem', // Larger caption text
      fontWeight: 500, // Slightly bolder
    },
  },
  shape: {
    borderRadius: 4, // More noticeable corners
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // More visible shadow
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', // Light shadow for depth
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // More visible button shadow
          padding: '12px 28px', // Larger button padding
          fontWeight: 600,
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#005b96',
            '&:hover': {
              backgroundColor: '#003d66',
            }
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: '#2c7c3e',
            '&:hover': {
              backgroundColor: '#1e5a2c',
            }
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem', // Larger input text
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#005b96',
            borderWidth: '2px', // Thicker border on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#005b96',
            borderWidth: '2px', // Thicker border when focused
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '1.05rem', // Larger label text
          fontWeight: 500, // Bolder label
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#cccccc', // More visible divider
          margin: '28px 0', // More space around dividers
          borderBottomWidth: '2px', // Thicker divider
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f4f8', // More visible table header
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '1rem', // Larger header text
          color: '#111111',
          backgroundColor: '#e6f0fa', // More visible header background
          borderBottom: '2px solid #b3d1e6',
          padding: '16px',
        },
        body: {
          padding: '16px',
          borderColor: '#eeeeee',
          fontSize: '1rem', // Larger cell text
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: '12px',
          '& .MuiSvgIcon-root': {
            fontSize: '1.3rem', // Larger radio buttons
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '1.1rem', // Larger radio labels
          fontWeight: 500, // Bolder labels
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            fontSize: '1.3rem', // Larger checkboxes
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontSize: '1.05rem', // Larger alert text
          '& .MuiAlert-icon': {
            fontSize: '1.5rem', // Larger alert icon
          },
        },
      },
    },
  },
});

// Input validation for parameter fields with more academic error messages
const validateParameter = (key, value) => {
  if (typeof value === 'number' && value < 0) {
    return `Parameter "${key}" requires a non-negative value.`;
  }
  return '';
};

export default function OptimizationForm({ onClose }) {
  // Default parameters for algorithms - Updated with duplicate Deep Q-Learning
  const defaultParams = {
    "SA": {
      max_iteration: 1000,
      initial_temperature: 1000,
      cooling_rate: 0.003,
    },
    "TS": {
      iterationNumber: 100,
      tabuListLength: 10,
      candidateSolutionCount: 20,
    },
    "ALNS": {
      cooling_rate: 0.9995,
      initial_temperature: 10000,
      N: 4,
      K: 15,
      Z: 1,
      max_iteration: 1000, // Ensure this parameter is present
    },
    "OR-Tools": {},
    "Q-Learning": {
      alpha: 0.4,
      gama: 0.6,
      initial_epsilon: 1.0,
      min_epsilon: 0.2,
      epsilon_decay: 0.9999,
      max_iteration: 2000,
      tank_capacity: 3000,
      load_capacity: 350,
      fuel_consumption_rate: 1.0,
      charging_rate: 0.18,
      velocity: 12.5,
      vehicle_mass: 1000,
      max_load_volume: 0,
    },
    "Deep Q-Learning": {
      alpha: 0.4,
      gama: 0.6,
      initial_epsilon: 1.0,
      min_epsilon: 0.2,
      epsilon_decay: 0.9999,
      max_iteration: 2000,
      tank_capacity: 3000,
      load_capacity: 350,
      fuel_consumption_rate: 1.0,
      charging_rate: 0.18,
      velocity: 12.5,
      vehicle_mass: 1000,
      max_load_volume: 0,
      batch_size: 64, // Additional parameter
      memory_capacity: 10000, // Additional parameter
      copy_weight_interval: 10, // Additional parameter
    },
    "Deep Q-Learning v2": {
      alpha: 0.4,
      gama: 0.6,
      initial_epsilon: 1.0,
      min_epsilon: 0.2,
      epsilon_decay: 0.9999,
      max_iteration: 2000,
      tank_capacity: 3000,
      load_capacity: 350,
      fuel_consumption_rate: 1.0,
      charging_rate: 0.18,
      velocity: 12.5,
      vehicle_mass: 1000,
      max_load_volume: 0,
      batch_size: 64,
      memory_capacity: 10000,
      copy_weight_interval: 10,
    },
  };

  // Algorithm warning messages - Updated with v2
  const algorithmWarnings = {
    "SA": "This method solves the CEVRP problem. Customer time windows are not taken into account.",
    "TS": "This method solves the CEVRP problem. Customer time windows are not taken into account.",
    "OR": "This method solves the CEVRP problem. Customer time windows are not taken into account.",
    "Q-Learning": "Q-Learning algorithm solves the CEVRP problem. Time windows are not considered.",
    "Deep Q-Learning": "Deep Q-Learning algorithm solves the CEVRP-TW problem. Time windows are considered. It also supports Pickup and Delivery Problems (PDP).",
    "Deep Q-Learning v2": "Deep Q-Learning v2 algorithm solves the CEVRP-TW problem with enhanced backhaul support. Time windows are considered with more precision.",
  };

  // Current scenario in the form
  const [currentScenario, setCurrentScenario] = useState({
    id: Date.now(),
    algorithm: "Deep Q-Learning",
    objectiveFunction: "MinDistance",
    chargeStrategy: "FullCharge",
    parameters: defaultParams["Deep Q-Learning"],
  });

  // Updated algorithm groups with duplicate Deep Q-Learning
  const algorithmGroups = [
    {
      title: "C-EVRP",
      algorithms: ["TS", "SA", "Q-Learning"]
    },
    {
      title: "C-EVRP-TW",
      algorithms: ["ALNS", "Deep Q-Learning"]
    },
    {
      title: "C-EVRP with Time Window and Backhaul",
      algorithms: ["Deep Q-Learning v2"]
    }
  ];

  // Determine the index of the group containing the selected algorithm
  const getActiveGroupIndex = (algorithm) =>
    algorithmGroups.findIndex(group => group.algorithms.includes(algorithm));

  // Determine if an algorithm is a Deep Q-Learning variant or Q-Learning
  const isDeepQLearning = (algo) => ["Deep Q-Learning", "Deep Q-Learning v2", "Q-Learning"].includes(algo);

  // Get algorithm icon - simplified to use a single icon for all algorithms
  const getAlgorithmIcon = (algo) => {
    return <DataObjectIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />;
  };

  // List of saved scenarios
  const [scenarios, setScenarios] = useState([]);
  // Status indicators
  const [saveStatus, setSaveStatus] = useState({ show: false, message: "", severity: "info" });

  // Event handlers
  const handleAlgorithmChangeManual = (algorithmKey) => {
    setCurrentScenario((prev) => ({
      ...prev,
      algorithm: algorithmKey,
      parameters: { ...defaultParams[algorithmKey] },
      objectiveFunction: isDeepQLearning(algorithmKey) ? "MinDistance" : prev.objectiveFunction,
      chargeStrategy: isDeepQLearning(algorithmKey) ? "FullCharge" : prev.chargeStrategy,
    }));
    console.log("Selected:", algorithmKey, defaultParams[algorithmKey]);
  };

  const handleObjectiveFunctionChange = (e) => {
    setCurrentScenario((prev) => ({
      ...prev,
      objectiveFunction: e.target.value,
    }));
  };

  const handleChargeStrategyChange = (e) => {
    setCurrentScenario((prev) => ({
      ...prev,
      chargeStrategy: e.target.value,
    }));
  };

  const handleParameterChange = (key, value) => {
    setCurrentScenario((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }));
  };

  // Save scenario and reset form
  const handleSaveScenario = () => {
    setScenarios((prev) => [...prev, { ...currentScenario, id: Date.now() }]);
    setCurrentScenario({
      id: Date.now(),
      algorithm: "OR-Tools",
      objectiveFunction: "Distance",
      chargeStrategy: "Full",
      parameters: {},
    });
    
    setSaveStatus({
      show: true,
      message: "Scenario successfully added",
      severity: "success"
    });
  };

  // Delete saved scenario
  const handleDeleteScenario = (id) => {
    try {
      // Remove from state
      setScenarios(prev => prev.filter(s => s.id !== id));
      
      // Also remove from localStorage
      const savedScenarios = localStorage.getItem('optimizationScenarios');
      if (savedScenarios) {
        const parsedData = JSON.parse(savedScenarios);
        
        // Search and remove in all algorithm groups
        Object.keys(parsedData).forEach(algorithm => {
          parsedData[algorithm] = parsedData[algorithm].filter(s => s.id !== id);
          // If group is empty, remove it completely
          if (parsedData[algorithm].length === 0) {
            delete parsedData[algorithm];
          }
        });
        
        // Save updated data to localStorage
        localStorage.setItem('optimizationScenarios', JSON.stringify(parsedData));
      }
      
      setSaveStatus({
        show: true,
        message: "Scenario successfully deleted",
        severity: "success"
      });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setSaveStatus({
        show: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSaveStatus({ ...saveStatus, show: false });
  };

  // Load saved scenarios from localStorage (on component mount)
  useEffect(() => {
    loadScenariosFromLocalStorage();
  }, []);

  // Load scenarios from localStorage
  const loadScenariosFromLocalStorage = () => {
    try {
      const savedScenarios = localStorage.getItem('optimizationScenarios');
      if (savedScenarios) {
        // Parse with JSON.parse and flatten arrays for each algorithm group
        const parsedData = JSON.parse(savedScenarios);
        // Use Object.values to get scenarios from each algorithm group and flatten into a single array
        const allScenarios = Object.values(parsedData).flat();
        setScenarios(allScenarios);
      }
    } catch (error) {
      console.error("Error loading scenarios:", error);
      setSaveStatus({
        show: true,
        message: `Error: Failed to load saved scenarios - ${error.message}`,
        severity: "error"
      });
    }
  };

  // Save scenarios to localStorage
  const saveScenarios = () => {
    try {
      // Add currentScenario to existing scenarios (if it contains parameters)
      const allScenarios = [...scenarios];
      
      // If current scenario has parameters and is not already added, add it
      if (currentScenario.algorithm && Object.keys(currentScenario.parameters).length > 0) {
        // Check if the same scenario was already added
        const scenarioExists = scenarios.some(s => 
          s.algorithm === currentScenario.algorithm && 
          s.objectiveFunction === currentScenario.objectiveFunction &&
          s.chargeStrategy === currentScenario.chargeStrategy
        );
        
        if (!scenarioExists) {
          allScenarios.push({ ...currentScenario, id: Date.now() });
        }
      }
      
      // If no scenarios exist, show an error
      if (allScenarios.length === 0) {
        setSaveStatus({
          show: true,
          message: "No scenario to save!",
          severity: "warning"
        });
        return;
      }
      
      // Clean up each scenario (for a cleaner JSON)
      const cleanScenarios = allScenarios.map(scenario => ({
        id: scenario.id,
        algorithm: scenario.algorithm,
        objectiveFunction: scenario.objectiveFunction,
        chargeStrategy: scenario.chargeStrategy,
        parameters: scenario.parameters,
        createdAt: scenario.createdAt || new Date().toISOString() // Keep existing createdAt if present
      }));
      
      // Group by algorithms
      const scenariosByAlgorithm = {};
      cleanScenarios.forEach(scenario => {
        if (!scenariosByAlgorithm[scenario.algorithm]) {
          scenariosByAlgorithm[scenario.algorithm] = [];
        }
        scenariosByAlgorithm[scenario.algorithm].push(scenario);
      });
      
      // Save to localStorage
      localStorage.setItem('optimizationScenarios', JSON.stringify(scenariosByAlgorithm));
      
      // Also update scenarios state
      setScenarios(cleanScenarios);
      
      setSaveStatus({
        show: true,
        message: "Scenarios successfully saved!",
        severity: "success"
      });
      
      // Close modal after 1 second
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving scenarios:", error);
      setSaveStatus({
        show: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    }
    console.log("Scenarios:", scenarios);
  };

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ 
        p: 5, 
        maxHeight: '85vh', 
        overflowY: 'auto',
        bgcolor: 'background.paper',
      }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ 
          mb: 4, 
          letterSpacing: '0.02em',
          fontWeight: 700,
          textShadow: '0 1px 2px rgba(0,0,0,0.05)' // Subtle shadow for better visibility
        }}>
          Electric Vehicle Routing Optimization Parameters
        </Typography>
        
        <Box sx={{ mt: 4, px: 2 }}>
          {/* Algorithm Selection - With improved readability */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 3, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              borderBottom: `3px solid ${theme.palette.primary.main}`, // Thicker border
              pb: 1,
              display: 'inline-block',
              fontSize: '1.3rem', // Larger section title
              fontWeight: 700 // Bolder title
            }}>
              Algorithm Selection
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
              Select an appropriate algorithm based on the routing problem variant. Each algorithm is optimized for different constraints and considerations.
            </Typography>
          </Box>
          
          {/* Improved card layout with better spacing and alignment */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            justifyContent: 'center',
            mb: 6
          }}>
            {algorithmGroups.map((group, index) => {
              const isActiveGroup = index === getActiveGroupIndex(currentScenario.algorithm);
              return (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    width: 280,
                    height: 'auto',
                    p: 3,
                    border: isActiveGroup ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                    backgroundColor: isActiveGroup ? alpha(theme.palette.primary.main, 0.03) : 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{
                      textAlign: 'center',
                      color: isActiveGroup ? 'primary.main' : 'text.primary',
                      pb: 1,
                      borderBottom: `1px solid ${isActiveGroup ? theme.palette.primary.main : '#e0e0e0'}`
                    }}>
                      {group.title}
                    </Typography>
                    
                    <Box component="ul" sx={{ 
                      listStyle: 'none', 
                      p: 0, 
                      m: 0,
                      mt: 2
                    }}>
                      {group.algorithms.map((algo) => {
                        const isSelected = algo === currentScenario.algorithm;
                        return (
                          <Box
                            component="li"
                            key={algo}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1.5,
                              mb: 1,
                              border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                              backgroundColor: isSelected 
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              color: isSelected ? 'primary.main' : 'text.primary',
                              fontWeight: isSelected ? '600' : '400',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: isSelected 
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : alpha(theme.palette.grey[100], 0.5),
                              },
                            }}
                            onClick={() => handleAlgorithmChangeManual(algo)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-label={`Select ${algo} algorithm`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleAlgorithmChangeManual(algo);
                                e.preventDefault();
                              }
                            }}
                          >
                            <Box component="span" sx={{ 
                              mr: 1.5, 
                              display: 'flex', 
                              alignItems: 'center',
                              minWidth: '24px'
                            }}>
                              {getAlgorithmIcon(algo)}
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                              {algo}
                            </Typography>
                            {isSelected && (
                              <CheckCircleOutlineIcon 
                                fontSize="small" 
                                color="primary" 
                                sx={{ ml: 'auto' }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  
                  {isActiveGroup && (
                    <Box sx={{ mt: 3, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Optimized for {group.title.toLowerCase()} problems
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {/* Algorithm Notes - Enhanced academic style without references */}
          {algorithmWarnings[currentScenario.algorithm] && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                mb: 5,
                p: 3,
                backgroundColor: alpha(theme.palette.info.light, 0.04),
                border: `1px solid ${theme.palette.info.light}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ 
                color: theme.palette.info.main, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                pb: 1
              }}>
                <ArticleIcon sx={{ mr: 1 }} fontSize="small" />
                Algorithm Specifications
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ 
                lineHeight: 1.7,
                fontFamily: '"Roboto Slab", "Times New Roman", serif',
                pl: 1,
                mt: 1
              }}>
                {algorithmWarnings[currentScenario.algorithm]}
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Objective Function & Charge Strategy - Academic Style */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2,
                  pb: 1, 
                  borderBottom: `1px solid ${theme.palette.grey[300]}`,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Objective Function Parameter
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the optimization criterion for the algorithm:
                </Typography>
                
                <RadioGroup 
                  value={currentScenario.objectiveFunction} 
                  onChange={handleObjectiveFunctionChange} 
                  name={`objective-${currentScenario.algorithm}`}
                >
                  {isDeepQLearning(currentScenario.algorithm) ? (
                    <FormControlLabel value="MinDistance" control={<Radio color="primary" />} label="Minimum Distance" />
                  ) : (
                    <>
                      <FormControlLabel value="MinDistance" control={<Radio color="primary" />} label="Minimum Distance" />
                      <FormControlLabel value="MinTime" control={<Radio color="primary" />} label="Minimum Time" />
                      <FormControlLabel value="MinEnergy" control={<Radio color="primary" />} label="Minimum Energy" />
                      <FormControlLabel value="MinTardiness" control={<Radio color="primary" />} label="Minimum Tardiness" />
                    </>
                  )}
                </RadioGroup>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2,
                  pb: 1, 
                  borderBottom: `1px solid ${theme.palette.grey[300]}`,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Charging Strategy Parameter
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the appropriate charging strategy:
                </Typography>
                
                <RadioGroup 
                  value={currentScenario.chargeStrategy} 
                  onChange={handleChargeStrategyChange} 
                  name={`strategy-${currentScenario.algorithm}`}
                >
                  {isDeepQLearning(currentScenario.algorithm) ? (
                    <FormControlLabel value="FullCharge" control={<Radio color="primary" />} label="Full Charge" />
                  ) : (
                    <>
                      <FormControlLabel value="FullCharge" control={<Radio color="primary" />} label="Full Charge" />
                      <FormControlLabel value="PartialCharge" control={<Radio color="primary" />} label="Partial Charge" />
                      <FormControlLabel value="%20-%80" control={<Radio color="primary" />} label="%20-%80 Charge" />
                    </>
                  )}
                </RadioGroup>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Parameter Fields - Academic Style */}
          {Object.keys(currentScenario.parameters || {}).length > 0 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 1, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  pb: 1,
                  display: 'inline-block'
                }}>
                  Algorithm Parameters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
                  Configure the parameters for the {currentScenario.algorithm} algorithm. These values directly influence the optimization process.
                </Typography>
              </Box>
              
              <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3}>
                  {Object.entries(currentScenario.parameters).map(([key, value]) => {
                    const errorMessage = validateParameter(key, value);
                    const formattedLabel = key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, c => c.toUpperCase());
                      
                    return (
                      <Grid item xs={12} md={4} key={key}>
                        <TextField
                          label={formattedLabel}
                          type={typeof value === 'number' ? 'number' : 'text'}
                          fullWidth
                          value={value !== null && value !== undefined ? value : ''}
                          onChange={(e) =>
                            handleParameterChange(key, typeof value === 'number' ? parseFloat(e.target.value) : e.target.value)
                          }
                          variant="outlined"
                          error={!!errorMessage}
                          helperText={errorMessage || `${formattedLabel} parameter`}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.9rem',
                            },
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme.palette.background.paper,
                            },
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </>
          )}

          {/* Buttons - Academic Style */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 5 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<LibraryAddIcon />} 
              onClick={handleSaveScenario}
              sx={{ px: 4, py: 1.2 }}
            >
              Add Scenario
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={saveScenarios}
              sx={{ px: 4, py: 1.2 }}
            >
              Save and Exit
            </Button>
          </Box>
        </Box>

        {/* Saved Scenarios Table - Academic Style */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600, 
            color: theme.palette.primary.main,
            borderBottom: `2px solid ${theme.palette.primary.light}`,
            pb: 1,
            mb: 3
          }}>
            Saved Optimization Scenarios
          </Typography>
          
          {scenarios.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No optimization scenarios have been saved yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Use the "Add Scenario" button to create optimization configurations.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Algorithm</TableCell>
                    <TableCell>Objective Function</TableCell>
                    <TableCell>Charge Strategy</TableCell>
                    <TableCell>Parameters</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scenarios.map((scenario) => (
                    <TableRow key={scenario.id} hover>
                      <TableCell><strong>{scenario.algorithm}</strong></TableCell>
                      <TableCell>{scenario.objectiveFunction}</TableCell>
                      <TableCell>{scenario.chargeStrategy}</TableCell>
                      <TableCell sx={{ maxWidth: '300px' }}>
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem' }}>
                          {Object.entries(scenario.parameters || {}).map(([key, value]) => (
                            <Box key={key} sx={{ mb: 0.5 }}>
                              <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                                {key}:
                              </Typography>{' '}
                              <Typography variant="body2" component="span">
                                {value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteScenario(scenario.id)}
                          title="Delete Scenario"
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'right', fontStyle: 'italic' }}>
            Note: All scenarios will be stored in your browser's local storage.
          </Typography>
        </Box>
        
        {/* Status Snackbar - Academic Style */}
        <Snackbar
          open={saveStatus.show}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={saveStatus.severity}
            sx={{ width: '100%', border: `1px solid ${theme.palette[saveStatus.severity].main}` }}
          >
            {saveStatus.message}
          </Alert>
        </Snackbar>
      </Card>
    </ThemeProvider>
  );
}