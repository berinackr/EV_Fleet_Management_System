import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, CardMedia, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Chip, List, ListItem, ListItemText, LinearProgress, 
  Paper, Divider, Stack, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Avatar, Tabs, Tab, CircularProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as TruckIcon,
  Build as ToolsIcon,
  Warning as WarningIcon,
  BatteryChargingFull as BatteryIcon,
  Speed as SpeedIcon,
  Check as CheckIcon,
  Timeline as TimelineIcon,
  RouteOutlined as RouteIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Import vehicle images
import musoshi001Img from '../assets/icons/musoshi001.jpg';
import musoshi002Img from '../assets/icons/musoshi002.jpg';
import musoshi003Img from '../assets/icons/musoshi003.jpg';
import musoshi004Img from '../assets/icons/musoshi004.jpg';
import musoshi005Img from '../assets/icons/musoshi005.jpg';

// Vehicle inventory data
const vehicleInventory = [
  {
    id: 'musoshi001',
    image: musoshi001Img,
    model: 'MUSOSHI EV-X1',
    status: 'active',
    batteryHealth: 92,
    mileage: 12450,
    lastService: '2024-02-15',
    nextService: '2024-05-15',
    purchaseDate: '2023-01-10',
    warranty: '2026-01-10',
    specs: {
      maxRange: 320,
      maxLoad: 1500,
      maxSpeed: 110,
      batteryCapacity: '80 kWh'
    },
    maintenanceHistory: [
      { date: '2024-02-15', type: 'Regular', description: 'Routine inspection and software update', cost: 450 },
      { date: '2023-08-20', type: 'Regular', description: 'Battery cells check and cooling system maintenance', cost: 550 },
      { date: '2023-03-05', type: 'Repair', description: 'Replaced front suspension component', cost: 780 }
    ],
    alerts: [
      { type: 'info', message: 'Scheduled maintenance in 30 days' }
    ]
  },
  {
    id: 'musoshi003',
    image: musoshi003Img,
    model: 'MUSOSHI EV-X1',
    status: 'active',
    batteryHealth: 89,
    mileage: 18970,
    lastService: '2024-01-10',
    nextService: '2024-04-10',
    purchaseDate: '2022-11-05',
    warranty: '2025-11-05',
    specs: {
      maxRange: 320,
      maxLoad: 1500,
      maxSpeed: 110,
      batteryCapacity: '80 kWh'
    },
    maintenanceHistory: [
      { date: '2024-01-10', type: 'Regular', description: 'Complete inspection and tire replacement', cost: 820 },
      { date: '2023-07-15', type: 'Regular', description: 'Battery diagnostic and cooling system cleaning', cost: 480 },
      { date: '2023-04-22', type: 'Repair', description: 'Replaced charging port component', cost: 520 }
    ],
    alerts: [
      { type: 'warning', message: 'Brake pads at 25% - replacement recommended' }
    ]
  },
  {
    id: 'musoshi004',
    image: musoshi004Img,
    model: 'MUSOSHI EV-X2',
    status: 'active',
    batteryHealth: 94,
    mileage: 9850,
    lastService: '2024-03-05',
    nextService: '2024-06-05',
    purchaseDate: '2023-03-20',
    warranty: '2026-03-20',
    specs: {
      maxRange: 350,
      maxLoad: 1800,
      maxSpeed: 120,
      batteryCapacity: '90 kWh'
    },
    maintenanceHistory: [
      { date: '2024-03-05', type: 'Regular', description: 'Routine maintenance and software upgrade', cost: 520 },
      { date: '2023-09-15', type: 'Regular', description: 'Battery check and tire rotation', cost: 380 }
    ],
    alerts: []
  },
  {
    id: 'musoshi005',
    image: musoshi005Img,
    model: 'MUSOSHI EV-X2',
    status: 'maintenance',
    batteryHealth: 78,
    mileage: 23150,
    lastService: '2024-03-25',
    nextService: '2024-06-25',
    purchaseDate: '2022-08-15',
    warranty: '2025-08-15',
    specs: {
      maxRange: 350,
      maxLoad: 1800,
      maxSpeed: 120,
      batteryCapacity: '90 kWh'
    },
    maintenanceHistory: [
      { date: '2024-03-25', type: 'Repair', description: 'Battery cell replacement and system recalibration', cost: 3450 },
      { date: '2023-11-10', type: 'Regular', description: 'Routine maintenance and brake inspection', cost: 520 },
      { date: '2023-06-20', type: 'Regular', description: 'Full inspection and motor controller check', cost: 620 },
      { date: '2023-01-15', type: 'Repair', description: 'Replaced cabin HVAC components', cost: 890 }
    ],
    alerts: [
      { type: 'critical', message: 'Battery cell #12 requires replacement' },
      { type: 'warning', message: 'Motor controller reports intermittent errors' }
    ]
  },
  {
    id: 'musoshi006',
    image: musoshi002Img,
    model: 'MUSOSHI EV-X3',
    status: 'inactive',
    batteryHealth: 65,
    mileage: 35780,
    lastService: '2024-02-28',
    nextService: '2024-05-28',
    purchaseDate: '2022-04-10',
    warranty: '2025-04-10',
    specs: {
      maxRange: 380,
      maxLoad: 2000,
      maxSpeed: 130,
      batteryCapacity: '100 kWh'
    },
    maintenanceHistory: [
      { date: '2024-02-28', type: 'Major', description: 'Complete battery pack replacement', cost: 12500 },
      { date: '2023-10-15', type: 'Repair', description: 'Motor replacement and drivetrain repair', cost: 4800 },
      { date: '2023-07-05', type: 'Regular', description: 'Routine maintenance and software update', cost: 580 },
      { date: '2023-03-20', type: 'Repair', description: 'Replaced suspension components', cost: 1250 },
      { date: '2022-11-10', type: 'Regular', description: 'First maintenance check', cost: 420 }
    ],
    alerts: [
      { type: 'critical', message: 'Vehicle requires complete battery system evaluation' },
      { type: 'critical', message: 'Drivetrain fault detected - do not operate' }
    ]
  }
];

// Status definitions with colors
const statusColors = {
  'active': '#4caf50',
  'maintenance': '#ff9800',
  'inactive': '#f44336',
  'charging': '#2196f3'
};

// Alert type colors
const alertColors = {
  'info': '#2196f3',
  'warning': '#ff9800',
  'critical': '#f44336'
};

// Battery health indicator color
const getBatteryHealthColor = (health) => {
  if (health >= 85) return '#4caf50';
  if (health >= 70) return '#ff9800';
  return '#f44336';
};

// Vehicle Status Chip Component
const VehicleStatusChip = ({ status }) => {
  const statusLabels = {
    'active': 'Active',
    'maintenance': 'In Maintenance',
    'inactive': 'Inactive',
    'charging': 'Charging'
  };

  return (
    <Chip 
      label={statusLabels[status] || 'Unknown'} 
      size="small" 
      sx={{ 
        bgcolor: statusColors[status] || '#9e9e9e', 
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};

// Vehicle Card Component
const VehicleCard = ({ vehicle, onViewDetails }) => {
  const daysSinceLastService = Math.floor((new Date() - new Date(vehicle.lastService)) / (1000 * 60 * 60 * 24));
  const daysToNextService = Math.floor((new Date(vehicle.nextService) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card elevation={3} sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={vehicle.image}
          alt={vehicle.id}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          bgcolor: 'rgba(0,0,0,0.6)', 
          color: 'white',
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <CarIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="subtitle2">{vehicle.id}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <VehicleStatusChip status={vehicle.status} />
        </Box>
      </Box>
      
      <CardContent sx={{ pt: 2, pb: 1, flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {vehicle.model}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Battery Health</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <BatteryIcon 
                fontSize="small" 
                sx={{ mr: 0.5, color: getBatteryHealthColor(vehicle.batteryHealth) }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {vehicle.batteryHealth}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={vehicle.batteryHealth} 
              sx={{ 
                height: 6, 
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getBatteryHealthColor(vehicle.batteryHealth)
                }
              }} 
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Mileage</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {vehicle.mileage.toLocaleString()} km
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Maintenance Status</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="body2">
              Last: {vehicle.lastService} ({daysSinceLastService} days ago)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              Next: {vehicle.nextService} (in {daysToNextService} days)
            </Typography>
          </Box>
        </Box>
        
        {vehicle.alerts.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Alerts ({vehicle.alerts.length})
            </Typography>
            {vehicle.alerts.map((alert, index) => (
              <Chip 
                key={index}
                label={alert.message}
                size="small"
                icon={alert.type === 'critical' ? <WarningIcon /> : <InfoIcon />}
                sx={{ 
                  mb: 0.5, 
                  mr: 0.5,
                  bgcolor: alertColors[alert.type],
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          size="small" 
          variant="outlined"
          endIcon={<SettingsIcon fontSize="small" />}
          onClick={() => onViewDetails(vehicle)}
        >
          Details
        </Button>
      </Box>
    </Card>
  );
};

// Main Inventory Component
const Inventory = () => {
  const [vehicles, setVehicles] = useState(vehicleInventory);
  const [filteredVehicles, setFilteredVehicles] = useState(vehicleInventory);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate inventory stats
  const inventoryStats = React.useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      inactive: vehicles.filter(v => v.status === 'inactive').length,
      alerts: vehicles.reduce((count, vehicle) => count + vehicle.alerts.length, 0),
      averageBatteryHealth: Math.round(
        vehicles.reduce((sum, vehicle) => sum + vehicle.batteryHealth, 0) / vehicles.length
      )
    };
  }, [vehicles]);

  // Handle view details
  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailModalOpen(true);
  };

  // Handle modal close
  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedVehicle(null);
    setCurrentTab(0);
  };

  // Handle tab change in detail modal
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate API refresh with small random changes
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        batteryHealth: Math.max(1, Math.min(100, vehicle.batteryHealth + (Math.random() > 0.7 ? -1 : Math.random() > 0.5 ? 1 : 0))),
        alerts: Math.random() > 0.9 
          ? [...vehicle.alerts, { 
              type: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'info', 
              message: 'New diagnostic alert - check vehicle' 
            }] 
          : vehicle.alerts
      })));
      setIsRefreshing(false);
    }, 1000);
  };

  // Update filtered vehicles when all vehicles change
  useEffect(() => {
    setFilteredVehicles(vehicles);
  }, [vehicles]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Vehicle Inventory Management
          </Typography>
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{ border: '1px solid', borderColor: 'primary.main' }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#fff', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Vehicles
                </Typography>
                <TruckIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                {inventoryStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All vehicles in the inventory
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#fff', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Active Vehicles
                </Typography>
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                {inventoryStats.active}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((inventoryStats.active / inventoryStats.total) * 100)}% of fleet operational
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#fff', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  In Maintenance
                </Typography>
                <ToolsIcon sx={{ color: '#ff9800', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                {inventoryStats.maintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vehicles currently under maintenance
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#fff', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Alerts & Warnings
                </Typography>
                <WarningIcon sx={{ color: '#f44336', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                {inventoryStats.alerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active issues requiring attention
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Battery Health Overview */}
        <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fleet Battery Health Overview</Typography>
            <Chip 
              label={`Fleet Average: ${inventoryStats.averageBatteryHealth}%`}
              color={
                inventoryStats.averageBatteryHealth >= 85 ? "success" : 
                inventoryStats.averageBatteryHealth >= 70 ? "warning" : "error"
              }
            />
          </Box>
          <Grid container spacing={2}>
            {vehicles.map(vehicle => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={vehicle.id}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderLeft: `4px solid ${getBatteryHealthColor(vehicle.batteryHealth)}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {vehicle.id}
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={vehicle.batteryHealth}
                        size={60}
                        thickness={4}
                        sx={{
                          color: getBatteryHealthColor(vehicle.batteryHealth),
                          circle: {
                            strokeLinecap: 'round',
                          }
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" fontWeight="bold">
                          {vehicle.batteryHealth}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    {vehicle.batteryHealth >= 85 ? "Excellent" : 
                     vehicle.batteryHealth >= 70 ? "Good" : 
                     vehicle.batteryHealth >= 50 ? "Fair" : "Poor"}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
      
      {/* Vehicle Cards */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Vehicle Inventory
      </Typography>
      <Grid container spacing={3}>
        {filteredVehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <VehicleCard vehicle={vehicle} onViewDetails={handleViewDetails} />
          </Grid>
        ))}
      </Grid>
      
      {/* Vehicle Details Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={closeDetailModal}
        maxWidth="md"
        fullWidth
      >
        {selectedVehicle && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `3px solid ${statusColors[selectedVehicle.status]}`,
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6">
                  Vehicle Details: {selectedVehicle.id}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedVehicle.model}
                </Typography>
              </Box>
              <VehicleStatusChip status={selectedVehicle.status} />
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" />
                <Tab label="Specifications" icon={<SettingsIcon />} iconPosition="start" />
                <Tab label="Maintenance History" icon={<HistoryIcon />} iconPosition="start" />
                <Tab 
                  label={`Alerts (${selectedVehicle.alerts.length})`} 
                  icon={<WarningIcon />} 
                  iconPosition="start"
                  sx={{ color: selectedVehicle.alerts.length > 0 ? 'error.main' : 'inherit' }}
                />
              </Tabs>
              
              {/* Overview Tab */}
              {currentTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedVehicle.image}
                        alt={selectedVehicle.id}
                        sx={{ borderRadius: 2, objectFit: 'cover' }}
                      />
                    </Box>
                    
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Battery Health Status
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BatteryIcon 
                          sx={{ 
                            mr: 1, 
                            color: getBatteryHealthColor(selectedVehicle.batteryHealth),
                            fontSize: 28
                          }} 
                        />
                        <Typography variant="h5" fontWeight="bold">
                          {selectedVehicle.batteryHealth}%
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedVehicle.batteryHealth} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 2,
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getBatteryHealthColor(selectedVehicle.batteryHealth)
                          }
                        }} 
                      />
                      
                      <Typography variant="body2" color="text.secondary">
                        {selectedVehicle.batteryHealth >= 85 
                          ? "Battery in excellent condition" 
                          : selectedVehicle.batteryHealth >= 70 
                          ? "Battery in good condition, monitor regularly" 
                          : selectedVehicle.batteryHealth >= 50 
                          ? "Battery deteriorating, plan for replacement" 
                          : "Battery requires immediate attention"}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Vehicle Information
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            <VehicleStatusChip status={selectedVehicle.status} />
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Mileage</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedVehicle.mileage.toLocaleString()} km
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Purchase Date</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedVehicle.purchaseDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Warranty Until</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedVehicle.warranty}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Maintenance Schedule
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Last Service</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedVehicle.lastService} ({Math.floor((new Date() - new Date(selectedVehicle.lastService)) / (1000 * 60 * 60 * 24))} days ago)
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Next Service</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedVehicle.nextService} (in {Math.floor((new Date(selectedVehicle.nextService) - new Date()) / (1000 * 60 * 60 * 24))} days)
                        </Typography>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, (Math.floor((new Date() - new Date(selectedVehicle.lastService)) / (1000 * 60 * 60 * 24)) / 90) * 100)} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 1,
                            mt: 1,
                            bgcolor: 'rgba(0,0,0,0.1)'
                          }} 
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}
              
              {/* Specifications Tab */}
              {currentTab === 1 && (
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedVehicle.model} Specifications
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Maximum Range
                          </TableCell>
                          <TableCell>{selectedVehicle.specs.maxRange} km</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Maximum Load Capacity
                          </TableCell>
                          <TableCell>{selectedVehicle.specs.maxLoad} kg</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Maximum Speed
                          </TableCell>
                          <TableCell>{selectedVehicle.specs.maxSpeed} km/h</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Battery Capacity
                          </TableCell>
                          <TableCell>{selectedVehicle.specs.batteryCapacity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Current Battery Health
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ mr: 1 }}>
                                {selectedVehicle.batteryHealth}%
                              </Typography>
                              <Chip 
                                label={
                                  selectedVehicle.batteryHealth >= 85 ? "Excellent" : 
                                  selectedVehicle.batteryHealth >= 70 ? "Good" : 
                                  selectedVehicle.batteryHealth >= 50 ? "Fair" : "Poor"
                                }
                                size="small"
                                color={
                                  selectedVehicle.batteryHealth >= 85 ? "success" : 
                                  selectedVehicle.batteryHealth >= 70 ? "warning" : 
                                  "error"
                                }
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Current Mileage
                          </TableCell>
                          <TableCell>{selectedVehicle.mileage.toLocaleString()} km</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Purchase Date
                          </TableCell>
                          <TableCell>{selectedVehicle.purchaseDate}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Warranty Expiration
                          </TableCell>
                          <TableCell>{selectedVehicle.warranty}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
              
              {/* Maintenance History Tab */}
              {currentTab === 2 && (
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Maintenance History
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Cost (₺)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedVehicle.maintenanceHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              <Chip 
                                label={record.type} 
                                size="small"
                                color={
                                  record.type === 'Regular' ? "success" : 
                                  record.type === 'Repair' ? "warning" : 
                                  record.type === 'Major' ? "error" : "default"
                                }
                              />
                            </TableCell>
                            <TableCell>{record.description}</TableCell>
                            <TableCell align="right">{record.cost.toLocaleString()} ₺</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Maintenance Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Total Services</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedVehicle.maintenanceHistory.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Repairs</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedVehicle.maintenanceHistory.filter(r => r.type === 'Repair' || r.type === 'Major').length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedVehicle.maintenanceHistory.reduce((sum, record) => sum + record.cost, 0).toLocaleString()} ₺
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              )}
              
              {/* Alerts Tab */}
              {currentTab === 3 && (
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Vehicle Alerts & Warnings
                  </Typography>
                  
                  {selectedVehicle.alerts.length > 0 ? (
                    <List>
                      {selectedVehicle.alerts.map((alert, index) => (
                        <ListItem 
                          key={index}
                          sx={{ 
                            mb: 1, 
                            borderLeft: `4px solid ${alertColors[alert.type]}`,
                            bgcolor: alert.type === 'critical' ? 'rgba(244, 67, 54, 0.08)' : 'inherit',
                            borderRadius: 1
                          }}
                        >
                          <ListItemText
                            primary={alert.message}
                            secondary={`Alert Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`}
                          />
                          <Chip 
                            label={alert.type.toUpperCase()}
                            size="small"
                            sx={{ 
                              bgcolor: alertColors[alert.type],
                              color: 'white'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No alerts for this vehicle
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vehicle is operating normally without any warnings
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={closeDetailModal}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => alert(`Maintenance request submitted for ${selectedVehicle.id}`)}
              >
                Schedule Maintenance
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Inventory;