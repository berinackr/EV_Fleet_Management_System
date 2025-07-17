import React, { useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, ButtonGroup, Button,
  List, ListItem, ListItemText, Chip, LinearProgress, Paper, Avatar,
  Divider, Stack, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  LocalShipping as LocalShippingIcon,
  Opacity as OpacityIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  ArrowDownward as ArrowDownwardIcon,
  Store as StoreIcon,
  Warning as WarningIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';

// Import vehicle images
import musoshi001Img from '../assets/icons/musoshi001.jpg';
import musoshi002Img from '../assets/icons/musoshi002.jpg';
import musoshi003Img from '../assets/icons/musoshi003.jpg';
import musoshi004Img from '../assets/icons/musoshi004.jpg';
import musoshi005Img from '../assets/icons/musoshi005.jpg';

// Water bottle image (placeholder URL - replace with actual image)
const waterBottleImg = 'https://5.imimg.com/data5/SELLER/Default/2021/6/ZY/SH/UX/122848150/whatsapp-image-2021-06-02-at-11-41-57-am-jpeg-500x500.jpeg';
const waterDeliveryImg = 'https://5.imimg.com/data5/SELLER/Default/2021/6/ZY/SH/UX/122848150/whatsapp-image-2021-06-02-at-11-41-57-am-jpeg-500x500.jpeg';
const chartImagePlaceholder = 'https://heavesi.ee/cdn/shop/files/Esmatellimusel_1080x1080_Locked_6.png?v=1746039099';
const mapImagePlaceholder = 'https://heavesi.ee/cdn/shop/files/Esmatellimusel_1080x1080_Locked_6.png?v=1746039099';

// Vehicle data from existing setup
const vehiclesData = [
  {
    id: 'musoshi001',
    image: musoshi001Img,
    driver: 'Ahmet Y.',
    currentDeliveries: 48,
    capacity: 60,
    utilizationRate: 80,
    region: 'Istanbul - North',
    bottlesDelivered: 1250,
    status: 'on-route'
  },
  {
    id: 'musoshi003',
    image: musoshi003Img,
    driver: 'Mehmet K.',
    currentDeliveries: 36,
    capacity: 60,
    utilizationRate: 60,
    region: 'Istanbul - South',
    bottlesDelivered: 980,
    status: 'stopped'
  },
  {
    id: 'musoshi004',
    image: musoshi004Img,
    driver: 'Zeynep D.',
    currentDeliveries: 52,
    capacity: 65,
    utilizationRate: 80,
    region: 'Istanbul - East',
    bottlesDelivered: 1100,
    status: 'on-route'
  },
  {
    id: 'musoshi005',
    image: musoshi005Img,
    driver: 'Ali S.',
    currentDeliveries: 30,
    capacity: 65,
    utilizationRate: 46,
    region: 'Istanbul - West',
    bottlesDelivered: 780,
    status: 'maintenance'
  },
  {
    id: 'musoshi006',
    image: musoshi002Img,
    driver: 'Ayşe Y.',
    currentDeliveries: 58,
    capacity: 70,
    utilizationRate: 82,
    region: 'Ankara',
    bottlesDelivered: 1420,
    status: 'on-route'
  }
];

// Regional water delivery data
const regionalData = [
  { 
    region: 'Istanbul - North', 
    currentDemand: 1350, 
    forecast: 1620, 
    growth: 20.0, 
    confidence: 95,
    residentialPercentage: 65,
    businessPercentage: 35
  },
  { 
    region: 'Istanbul - South', 
    currentDemand: 980, 
    forecast: 1100, 
    growth: 12.2, 
    confidence: 92,
    residentialPercentage: 70,
    businessPercentage: 30
  },
  { 
    region: 'Istanbul - East', 
    currentDemand: 1100, 
    forecast: 1250, 
    growth: 13.6, 
    confidence: 91,
    residentialPercentage: 60,
    businessPercentage: 40
  },
  { 
    region: 'Istanbul - West', 
    currentDemand: 870, 
    forecast: 950, 
    growth: 9.2, 
    confidence: 90,
    residentialPercentage: 75,
    businessPercentage: 25
  },
  { 
    region: 'Ankara', 
    currentDemand: 1420, 
    forecast: 1600, 
    growth: 12.7, 
    confidence: 93,
    residentialPercentage: 55,
    businessPercentage: 45
  }
];

// Customer types data
const customerTypes = [
  { type: 'Residential', percentage: 65, bottlesPerWeek: 1850, growth: 18.5 },
  { type: 'Small Business', percentage: 20, bottlesPerWeek: 850, growth: 12.3 },
  { type: 'Corporate', percentage: 10, bottlesPerWeek: 650, growth: 15.7 },
  { type: 'Educational', percentage: 5, bottlesPerWeek: 320, growth: -3.5 }
];

// AI recommendations for water delivery
const recommendations = [
  {
    title: "Increase North Istanbul Capacity",
    confidence: "High Confidence",
    description: "Add 2 more Musoshi vehicles for 19L bottle deliveries",
    info: "Based on 20% projected demand growth",
    vehicleId: "musoshi001"
  },
  {
    title: "Reallocate South Istanbul Resources",
    confidence: "Medium Confidence",
    description: "Shift 3 vehicles from South to East on Thursdays",
    info: "East region shows 13.6% higher Thursday demand",
    vehicleId: "musoshi003"
  },
  {
    title: "Optimize Ankara Delivery Routes",
    confidence: "High Confidence",
    description: "Reconfigure delivery sequence to reduce distance by 15%",
    info: "AI route optimization shows potential fuel savings",
    vehicleId: "musoshi006"
  },
  {
    title: "Residential Focus Campaign",
    confidence: "Information",
    description: "Promote subscription model for residential customers",
    info: "18.5% growth potential in residential segment",
    vehicleId: null
  }
];

// Status colors for vehicle status
const statusColors = {
  'on-route': '#4caf50',
  'stopped': '#ff9800',
  'maintenance': '#f44336',
  'charging': '#2196f3'
};

// Metric card component with water delivery styling
const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Vehicle utilization card component
const VehicleCard = ({ vehicle }) => (
  <Paper elevation={2} sx={{ 
    p: 3, 
    borderRadius: 2, 
    height: '100%',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Avatar 
        src={vehicle.image} 
        variant="rounded" 
        sx={{ width: 70, height: 70, mr: 2, boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }} 
      />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {vehicle.id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {vehicle.driver}
        </Typography>
        <Chip 
          label={vehicle.status} 
          size="small" 
          sx={{ 
            mt: 0.5,
            bgcolor: statusColors[vehicle.status], 
            color: 'white',
            fontWeight: 'bold' 
          }} 
        />
      </Box>
    </Box>
    
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" fontWeight="medium" color="text.secondary">
          Water Bottle Capacity
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          {vehicle.currentDeliveries}/{vehicle.capacity} bottles
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={vehicle.utilizationRate} 
        sx={{ 
          height: 12, 
          borderRadius: 2,
          bgcolor: 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': {
            bgcolor: vehicle.utilizationRate > 80 ? '#f44336' : 
                    vehicle.utilizationRate > 60 ? '#ff9800' : '#4caf50'
          }
        }} 
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
        {vehicle.utilizationRate}% utilized
      </Typography>
    </Box>
    
    <Divider sx={{ my: 2 }} />
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Box>
        <Typography variant="body2" color="text.secondary">Region</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'medium', mt: 0.5 }}>
          {vehicle.region}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', bgcolor: 'primary.light', p: 1.5, borderRadius: 2 }}>
        <Typography variant="body2" color="primary.dark">Delivered</Typography>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          {vehicle.bottlesDelivered}
        </Typography>
        <Typography variant="caption" color="primary.dark">bottles</Typography>
      </Box>
    </Box>
  </Paper>
);

// Recommendation item component
const RecommendationItem = ({ item, vehicles }) => {
  const getConfidenceColor = (conf) => {
    if (conf === 'High Confidence') return 'success';
    if (conf === 'Medium Confidence') return 'warning';
    return 'info';
  };

  const relatedVehicle = item.vehicleId ? vehicles.find(v => v.id === item.vehicleId) : null;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        borderLeft: `4px solid ${getConfidenceColor(item.confidence) === 'success' ? '#4caf50' : 
                             getConfidenceColor(item.confidence) === 'warning' ? '#ff9800' : '#2196f3'}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
        <Chip 
          label={item.confidence} 
          color={getConfidenceColor(item.confidence)}
          size="small" 
        />
      </Box>
      <Typography variant="body2" paragraph sx={{ mb: 1 }}>
        {item.description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">{item.info}</Typography>
        {relatedVehicle && (
          <Chip 
            avatar={<Avatar src={relatedVehicle.image} />}
            label={relatedVehicle.id}
            variant="outlined" 
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};

export default function DemandPlanning() {
  const [timeRange, setTimeRange] = useState('week');
  
  // Calculate summary statistics
  const totalBottles = regionalData.reduce((sum, region) => sum + region.currentDemand, 0);
  const forecastBottles = regionalData.reduce((sum, region) => sum + region.forecast, 0);
  const growthPercentage = ((forecastBottles - totalBottles) / totalBottles * 100).toFixed(1);
  const activeVehicles = vehiclesData.filter(v => v.status === 'on-route').length;
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          Water Delivery Demand Planning
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box 
            component="img" 
            src={waterBottleImg} 
            alt="19L Water Bottle"
            sx={{ height: 60, mr: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'normal' }}>
            Optimize delivery routes and resource allocation for your 19L water bottle delivery service
          </Typography>
        </Box>
        
        {/* Metrics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Weekly Bottle Demand"
              value={totalBottles.toLocaleString()}
              subtitle={`${growthPercentage}% forecasted growth`}
              icon={<OpacityIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Delivery Accuracy"
              value="94.8%"
              subtitle="On-time delivery rate"
              icon={<AccessTimeIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Customer Satisfaction"
              value="4.7/5"
              subtitle="Based on 3,256 reviews"
              icon={<StarIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Vehicles"
              value={`${activeVehicles}/${vehiclesData.length}`}
              subtitle="Musoshi electric delivery vehicles"
              icon={<LocalShippingIcon />}
              color="info"
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {/* Main Content - Demand Forecast & Regional Analysis */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <OpacityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="medium">
                      Water Bottle Delivery Forecast
                    </Typography>
                  </Box>
                  <ButtonGroup size="small">
                    <Button 
                      variant={timeRange === 'week' ? "contained" : "outlined"}
                      onClick={() => setTimeRange('week')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant={timeRange === 'month' ? "contained" : "outlined"}
                      onClick={() => setTimeRange('month')}
                    >
                      Monthly
                    </Button>
                    <Button 
                      variant={timeRange === 'quarter' ? "contained" : "outlined"}
                      onClick={() => setTimeRange('quarter')}
                    >
                      Quarterly
                    </Button>
                  </ButtonGroup>
                </Box>
                
                {/* Chart placeholder - would be replaced with actual chart component */}
                <Box 
                  component="img"
                  src={chartImagePlaceholder}
                  alt="Water Bottle Delivery Forecast Chart"
                  sx={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: 300,
                    objectFit: 'contain',
                    mb: 2
                  }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Current Weekly</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{totalBottles.toLocaleString()}</Typography>
                      <Typography variant="caption">19L Bottles</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Next Week Forecast</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{forecastBottles.toLocaleString()}</Typography>
                      <Typography variant="caption">19L Bottles</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Growth</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>+{growthPercentage}%</Typography>
                      <Typography variant="caption">Week over week</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">New Customers</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>185</Typography>
                      <Typography variant="caption">Last 7 days</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Regional Analysis */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Regional Delivery Analysis
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    {/* Map placeholder - would be replaced with actual map component */}
                    <Box 
                      component="img"
                      src={mapImagePlaceholder}
                      alt="Regional Analysis Map"
                      sx={{ 
                        width: '100%', 
                        height: 'auto',
                        maxHeight: 250,
                        objectFit: 'contain',
                        mb: 2
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Region</TableCell>
                            <TableCell align="right">Current</TableCell>
                            <TableCell align="right">Forecast</TableCell>
                            <TableCell align="right">Growth</TableCell>
                            <TableCell align="right">Residential</TableCell>
                            <TableCell align="right">Business</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {regionalData.map((row) => (
                            <TableRow key={row.region} hover>
                              <TableCell>{row.region}</TableCell>
                              <TableCell align="right">{row.currentDemand}</TableCell>
                              <TableCell align="right">{row.forecast}</TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <ArrowUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2" color="success.main">
                                    {row.growth.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{row.residentialPercentage}%</TableCell>
                              <TableCell align="right">{row.businessPercentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Vehicle Fleet Utilization - ENHANCED SECTION */}
            <Card sx={{ mb: 3, overflow: 'visible' }}>
              <CardContent sx={{ pb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Water Delivery Fleet Status
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  Current status of your delivery vehicles and their utilization for 19L water bottle deliveries
                </Typography>
                
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Chip 
                    icon={<DirectionsCarIcon />} 
                    label={`${vehiclesData.length} Total Vehicles`} 
                    color="primary" 
                    sx={{ px: 2 }}
                  />
                  <Box>
                    <Chip 
                      label={`${activeVehicles} On Route`} 
                      sx={{ bgcolor: '#4caf50', color: 'white', mr: 1 }}
                    />
                    <Chip 
                      label={`${vehiclesData.filter(v => v.status === 'maintenance').length} In Maintenance`} 
                      sx={{ bgcolor: '#f44336', color: 'white' }}
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  {vehiclesData.map(vehicle => (
                    <Grid item xs={12} sm={6} key={vehicle.id}>
                      <VehicleCard vehicle={vehicle} />
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="large"
                    onClick={() => alert('View detailed fleet management')}
                    sx={{ px: 4 }}
                  >
                    View Detailed Fleet Status
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
          </Grid>
          
          {/* Right Column - Analytics and Recommendations */}
          <Grid item xs={12} lg={4}>
            {/* Customer Type Analysis */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Customer Segment Analysis
                  </Typography>
                </Box>
                
                <Box 
                  component="img"
                  src={waterDeliveryImg}
                  alt="Water Delivery"
                  sx={{ 
                    width: '60%', 
                    height: 'auto',
                    display: 'block',
                    mx: 'auto',
                    mb: 2
                  }}
                />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer Type</TableCell>
                        <TableCell align="right">Share</TableCell>
                        <TableCell align="right">Weekly Volume</TableCell>
                        <TableCell align="right">Growth</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerTypes.map((type) => (
                        <TableRow key={type.type} hover>
                          <TableCell>{type.type}</TableCell>
                          <TableCell align="right">{type.percentage}%</TableCell>
                          <TableCell align="right">{type.bottlesPerWeek}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {type.growth > 0 ? (
                                <>
                                  <ArrowUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2" color="success.main">
                                    {type.growth}%
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2" color="error.main">
                                    {type.growth}%
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
            
            {/* Delivery Insights */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <OpacityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Water Delivery Insights
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h3">92%</Typography>
                      <Typography variant="body2" color="text.secondary">Delivery Efficiency</Typography>
                    </Box>
                    <Box sx={{ color: 'success.main' }}>
                      <InventoryIcon sx={{ fontSize: 40 }} />
                    </Box>
                  </Box>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={92} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50'
                        }
                      }} 
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Bottles delivered within scheduled time window
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Key Performance Metrics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Avg. Delivery Time</Typography>
                        <Typography variant="h6">28 min</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Daily Deliveries</Typography>
                        <Typography variant="h6">845</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Subscription Rate</Typography>
                        <Typography variant="h6">68%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Reorder Rate</Typography>
                        <Typography variant="h6">78%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
            
            {/* AI Recommendations */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Delivery Optimization Recommendations
                  </Typography>
                </Box>
                
                {recommendations.map((recommendation, index) => (
                  <RecommendationItem 
                    key={index}
                    item={recommendation}
                    vehicles={vehiclesData}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}