import React from 'react';
import { 
  Container, Typography, Grid, Paper, Box, Button, Card, 
  CardContent, Divider, Link, List, ListItem, ListItemIcon, 
  ListItemText, CircularProgress, useTheme, useMediaQuery 
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  Route as RouteIcon,
  BatteryChargingFull as BatteryIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  Architecture as ArchitectureIcon,
  Science as ScienceIcon,
  BarChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Import images
import heroImage from '../assets/icons/musoshi001.jpg';
import algorithmImage from '../assets/icons/musoshi002.jpg';

// Styled components
const HeroSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(8, 0, 6),
  textAlign: 'center',
  position: 'relative',
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  color: 'white',
  marginBottom: theme.spacing(6),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  }
}));

const HeroContent = styled(Box)({
  position: 'relative',
  zIndex: 2,
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: 60,
    height: 4,
    backgroundColor: theme.palette.primary.main,
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  }
}));

// Mock data for key metrics
const keyMetrics = [
  { title: "Total Vehicles", value: "50+", icon: <CarIcon color="primary" fontSize="large" />, description: "Electric vehicles in fleet" },
  { title: "Routes Optimized", value: "1,250+", icon: <RouteIcon color="primary" fontSize="large" />, description: "Monthly optimized delivery routes" },
  { title: "Energy Saved", value: "28%", icon: <BatteryIcon color="primary" fontSize="large" />, description: "Average energy efficiency improvement" },
  { title: "Delivery Time", value: "32%", icon: <SpeedIcon color="primary" fontSize="large" />, description: "Reduced average delivery time" },
];

// Research papers
const researchPapers = [
  { title: "A Multi-Objective Optimization Approach for Electric Vehicle Routing Problems", authors: "Johnson et al.", year: 2023, journal: "Journal of Transportation Research Part C" },
  { title: "Machine Learning Techniques for Energy Consumption Prediction in Electric Delivery Vehicles", authors: "Smith & Zhang", year: 2023, journal: "Applied Energy" },
  { title: "Comparative Analysis of Heuristic Algorithms for EV Fleet Routing", authors: "Demir et al.", year: 2022, journal: "Transportation Research Part B" },
];

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ fontWeight: 700, mb: 3, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Fleet Management System
            </Typography>
            <Typography 
              variant="h5" 
              paragraph 
              sx={{ maxWidth: 900, mx: 'auto', mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}
            >
              An advanced optimization and management system for electric vehicle fleets,
              integrating route optimization with energy consumption prediction and intelligent charge scheduling.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<RouteIcon />}
                component={RouterLink}
                to="/route-optimization"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', color: 'primary.main', '&:hover': { bgcolor: 'white' } }}
              >
                Explore Route Optimization
              </Button>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<VisibilityIcon />}
                component={RouterLink}
                to="/fleet-monitoring"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', color: 'primary.main', '&:hover': { bgcolor: 'white' } }}
              >
                Explore Vehicle Tracking
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<AnalyticsIcon />}
                component={RouterLink}
                to="/performance-monitoring"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                View Analytics
              </Button>
            </Box>
          </HeroContent>
        </Container>
      </HeroSection>

      <Container maxWidth="lg">
        {/* Key Metrics Section */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" gutterBottom>
            Key Performance Metrics
          </SectionTitle>
          <Grid container spacing={3}>
            {keyMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard elevation={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {metric.title}
                    </Typography>
                    {metric.icon}
                  </Box>
                  <Typography variant="h3" component="div" sx={{ my: 2, fontWeight: 700 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" gutterBottom>
            System Components
          </SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RouteIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h3">
                      Route Optimization
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    Our system implements advanced algorithms including Simulated Annealing, Tabu Search, 
                    and Google OR-Tools to generate optimal routes that consider multiple constraints:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ChartIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Multi-objective optimization" 
                        secondary="Balances distance, time, energy consumption, and battery limitations"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dynamic replanning" 
                        secondary="Adjusts routes in real-time based on traffic and vehicle conditions"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BatteryIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h3">
                      Energy Management
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    The system provides comprehensive energy management for electric vehicle fleets with 
                    predictive analytics and intelligent charging strategies:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ScienceIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Energy consumption prediction" 
                        secondary="Uses machine learning models and SHAP values for transparent forecasting"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InventoryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Charging infrastructure optimization" 
                        secondary="Schedules charging sessions to minimize costs and maximize availability"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AnalyticsIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h3">
                      Analytics & Monitoring
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    Comprehensive dashboard for real-time monitoring and advanced analytics of fleet operations:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Performance tracking" 
                        secondary="Real-time metrics on vehicle efficiency, delivery times, and energy usage"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArchitectureIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="FIWARE integration" 
                        secondary="Standardized IoT data integration with FIWARE Context Broker"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CarIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h3">
                      Fleet Management
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    Comprehensive tools for managing the entire electric vehicle fleet lifecycle:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <InventoryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Maintenance scheduling" 
                        secondary="Predictive maintenance based on vehicle telemetry and usage patterns"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <RouteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Order management" 
                        secondary="End-to-end tracking of delivery orders and optimized assignment"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Box>

        {/* Methodology Section */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" gutterBottom>
            Research Methodology
          </SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Optimization Algorithms
              </Typography>
              <Typography variant="body1" paragraph>
                The system implements and compares multiple state-of-the-art optimization techniques for electric
                vehicle routing problems, considering both conventional and energy-specific constraints. 
                Our comparative analysis shows that the hybrid approach combining simulated annealing with 
                local search heuristics provides the most efficient routes in complex urban environments.
              </Typography>
              <Typography variant="body1">
                The algorithms explicitly account for energy consumption factors such as:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ChartIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Road gradient and elevation changes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChartIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Vehicle weight variations with load" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChartIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Traffic conditions and driving patterns" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src={algorithmImage}
                alt="Optimization Algorithm Visualization"
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: 320,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2,
                  boxShadow: 3
                }}
              />
              <Typography variant="h6" gutterBottom>
                Machine Learning for Energy Prediction
              </Typography>
              <Typography variant="body1" paragraph>
                Our system employs gradient boosting models trained on historical fleet data to predict energy
                consumption with high accuracy. The models consider multiple features including elevation profiles,
                vehicle parameters, weather conditions, and traffic patterns.
              </Typography>
              <Typography variant="body1">
                The integration of SHAP (SHapley Additive exPlanations) values provides interpretable results
                that help operators understand the factors influencing energy consumption predictions.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Research Publications */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" gutterBottom>
            Related Research Publications
          </SectionTitle>
          <Paper elevation={3} sx={{ p: 3 }}>
            <List>
              {researchPapers.map((paper, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <ScienceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={paper.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {paper.authors} ({paper.year})
                          </Typography>
                          {` — ${paper.journal}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < researchPapers.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Call to Action */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 4, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Explore the Fleet Management System
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
            Discover how our integrated approach to electric vehicle fleet management can optimize your operations,
            reduce costs, and improve sustainability metrics.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/vehicles"
            >
              View Vehicles
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={RouterLink}
              to="/maintenance"
            >
              Maintenance Portal
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;