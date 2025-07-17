import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, CardMedia, Typography, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, 
  ButtonGroup, List, ListItem, LinearProgress, Paper, Avatar, Divider,
  Stack, IconButton, Tooltip, Tab, Tabs, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl,
  InputLabel, Select, Switch, FormControlLabel
} from '@mui/material';
import {
  Battery90 as BatteryIcon,
  BatteryChargingFull as BatteryChargingIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Bolt as BoltIcon,
  Speed as SpeedIcon,
  LocalGasStation as ChargingStationIcon,
  EvStation as EvStationIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Nature as EcoIcon, // Changed from Eco to Nature which is available
  Warning as WarningIcon,
  Check as CheckIcon,
  Add as AddIcon,
  FlashOn as FlashOnIcon,
  DirectionsCar as CarIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import vehicle images
import musoshi001Img from '../assets/icons/musoshi001.jpg';
import musoshi002Img from '../assets/icons/musoshi002.jpg';
import musoshi003Img from '../assets/icons/musoshi003.jpg';
import musoshi004Img from '../assets/icons/musoshi004.jpg';
import musoshi005Img from '../assets/icons/musoshi005.jpg';

// Map placeholder
const mapPlaceholder = 'https://i.ibb.co/vwPRFsk/charging-map-placeholder.png';
// Chart placeholder for usage
const usageChartPlaceholder = 'https://i.ibb.co/BVDcRrQ/energy-usage-chart.png';
// Power grid status image
const powerGridImage = 'https://i.ibb.co/vXjnvMb/power-grid-status.png';

// EV Charging station images from provided links
const chargingStationImage1 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5jxgffkruzQDynX4OrR158XkyhsFiov96FA&s';
const chargingStationImage2 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmPpgXxAHTOkn7jdu5Y9figBRT3lBEiBoUFg&s';
const chargingStationImage3 = 'https://cdn.motor1.com/images/mgl/kol04R/275:0:4440:3333/electrify-america-ev-chargers.webp';

// Custom styled components
const ChargingIndicator = styled(Box)(({ theme, status }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  backgroundColor: 
    status === 'charging' ? theme.palette.success.main :
    status === 'waiting' ? theme.palette.warning.main :
    status === 'complete' ? theme.palette.primary.main :
    status === 'error' ? theme.palette.error.main :
    theme.palette.grey[500]
}));

const ProgressWithLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%'
}));

// Vehicles data
const vehiclesData = [
  {
    id: 'musoshi001',
    image: musoshi001Img,
    model: 'MUSOSHI EV-X1',
    driver: 'Ahmet Y.',
    batteryLevel: 35,
    batteryCapacity: 80,
    range: 115,
    chargingStatus: 'charging',
    chargingStation: 'Station A',
    startTime: '14:30',
    estimatedEndTime: '15:45',
    chargingRate: 75,
    chargingPower: '50 kW',
    lastFullCharge: '2 days ago'
  },
  {
    id: 'musoshi003',
    image: musoshi003Img,
    model: 'MUSOSHI EV-X1',
    driver: 'Mehmet K.',
    batteryLevel: 65,
    batteryCapacity: 80,
    range: 210,
    chargingStatus: 'idle',
    chargingStation: null,
    startTime: null,
    estimatedEndTime: null,
    chargingRate: 0,
    chargingPower: '0 kW',
    lastFullCharge: '1 day ago'
  },
  {
    id: 'musoshi004',
    image: musoshi004Img,
    model: 'MUSOSHI EV-X2',
    driver: 'Zeynep D.',
    batteryLevel: 22,
    batteryCapacity: 90,
    range: 80,
    chargingStatus: 'waiting',
    chargingStation: 'Station C',
    startTime: '16:00',
    estimatedEndTime: '17:30',
    chargingRate: 0,
    chargingPower: '0 kW',
    lastFullCharge: '3 days ago'
  },
  {
    id: 'musoshi005',
    image: musoshi005Img,
    model: 'MUSOSHI EV-X2',
    driver: 'Ali S.',
    batteryLevel: 92,
    batteryCapacity: 90,
    range: 315,
    chargingStatus: 'complete',
    chargingStation: 'Station B',
    startTime: '12:15',
    estimatedEndTime: '13:45',
    chargingRate: 0,
    chargingPower: '0 kW',
    lastFullCharge: 'Today'
  },
  {
    id: 'musoshi006',
    image: musoshi002Img,
    model: 'MUSOSHI EV-X3',
    driver: 'Ayşe Y.',
    batteryLevel: 8,
    batteryCapacity: 100,
    range: 30,
    chargingStatus: 'error',
    chargingStation: 'Station D',
    startTime: '13:00',
    estimatedEndTime: null,
    chargingRate: 0,
    chargingPower: '0 kW',
    lastFullCharge: '4 days ago'
  }
];

// Charging stations data
const chargingStationsData = [
  {
    id: 'Station A',
    name: 'Main Depot Fast Charger 1',
    type: '150kW DC Fast Charger',
    status: 'in-use',
    availability: 'In Use',
    currentVehicle: 'musoshi001',
    power: 50,
    location: 'Main Depot',
    coordinates: {lat: 41.0082, lng: 28.9784},
    uptime: 98.5,
    lastMaintenance: '2024-02-15',
    energySource: 'Renewable',
    image: chargingStationImage1
  },
  {
    id: 'Station B',
    name: 'Main Depot Fast Charger 2',
    type: '150kW DC Fast Charger',
    status: 'available',
    availability: 'Available',
    currentVehicle: null,
    power: 0,
    location: 'Main Depot',
    coordinates: {lat: 41.0082, lng: 28.9784},
    uptime: 99.2,
    lastMaintenance: '2024-03-10',
    energySource: 'Renewable',
    image: chargingStationImage2
  },
  {
    id: 'Station C',
    name: 'Distribution Center Charger',
    type: '50kW DC Charger',
    status: 'reserved',
    availability: 'Reserved',
    currentVehicle: null,
    power: 0,
    location: 'Distribution Center',
    coordinates: {lat: 41.0252, lng: 29.0250},
    uptime: 95.8,
    lastMaintenance: '2024-01-20',
    energySource: 'Mixed',
    image: chargingStationImage3
  },
  {
    id: 'Station D',
    name: 'Remote Facility Charger',
    type: '50kW DC Charger',
    status: 'maintenance',
    availability: 'Maintenance',
    currentVehicle: null,
    power: 0,
    location: 'Remote Facility',
    coordinates: {lat: 40.9923, lng: 29.1244},
    uptime: 87.5,
    lastMaintenance: '2024-03-25',
    energySource: 'Grid',
    image: chargingStationImage1
  },
  {
    id: 'Station E',
    name: 'Satellite Office Charger',
    type: '22kW AC Charger',
    status: 'available',
    availability: 'Available',
    currentVehicle: null,
    power: 0,
    location: 'Satellite Office',
    coordinates: {lat: 41.0422, lng: 29.0093},
    uptime: 99.7,
    lastMaintenance: '2024-02-28',
    energySource: 'Renewable',
    image: chargingStationImage2
  }
];

// Scheduled charging data
const scheduledChargingData = [
  {
    id: 'SCH-001',
    vehicleId: 'musoshi003',
    stationId: 'Station A',
    date: '2024-04-01',
    startTime: '18:30',
    duration: 60,
    priority: 'high',
    targetBatteryLevel: 90,
    status: 'scheduled'
  },
  {
    id: 'SCH-002',
    vehicleId: 'musoshi004',
    stationId: 'Station C',
    date: '2024-04-01',
    startTime: '16:00',
    duration: 90,
    priority: 'medium',
    targetBatteryLevel: 80,
    status: 'scheduled'
  },
  {
    id: 'SCH-003',
    vehicleId: 'musoshi006',
    stationId: 'Station B',
    date: '2024-04-01',
    startTime: '20:00',
    duration: 120,
    priority: 'high',
    targetBatteryLevel: 100,
    status: 'scheduled'
  }
];

// Historical charging data for charts
const historicalChargingData = {
  daily: [
    { day: 'Monday', energyUsed: 480, cost: 1344 },
    { day: 'Tuesday', energyUsed: 520, cost: 1456 },
    { day: 'Wednesday', energyUsed: 550, cost: 1540 },
    { day: 'Thursday', energyUsed: 510, cost: 1428 },
    { day: 'Friday', energyUsed: 490, cost: 1372 },
    { day: 'Saturday', energyUsed: 420, cost: 1176 },
    { day: 'Sunday', energyUsed: 400, cost: 1120 }
  ],
  monthly: 12500,
  averageCost: 2.8,
  greenEnergy: 85
};

// Energy cost data
const energyCostData = {
  currentRate: 2.8,
  peakRate: 3.5,
  offPeakRate: 2.2,
  peakHours: '14:00 - 21:00',
  offPeakHours: '21:00 - 06:00'
};

// Helper function to get battery color based on level
const getBatteryColor = (level) => {
  if (level >= 60) return 'success.main';
  if (level >= 30) return 'warning.main';
  return 'error.main';
};

// Helper function to get charging status text and color
const getChargingStatusInfo = (status) => {
  switch(status) {
    case 'charging':
      return { text: 'Charging', color: 'success.main', icon: <BatteryChargingIcon /> };
    case 'waiting':
      return { text: 'Waiting', color: 'warning.main', icon: <ScheduleIcon /> };
    case 'complete':
      return { text: 'Complete', color: 'primary.main', icon: <CheckIcon /> };
    case 'error':
      return { text: 'Error', color: 'error.main', icon: <WarningIcon /> };
    default:
      return { text: 'Idle', color: 'text.secondary', icon: <BatteryIcon /> };
  }
};

// Helper function to get station status color
const getStationStatusColor = (status) => {
  switch(status) {
    case 'available':
      return 'success.main';
    case 'in-use':
      return 'primary.main';
    case 'reserved':
      return 'warning.main';
    case 'maintenance':
      return 'error.main';
    default:
      return 'text.secondary';
  }
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
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

// Vehicle Charging Card Component
const VehicleChargingCard = ({ vehicle, onScheduleCharging }) => {
  const { text: statusText, color: statusColor, icon: statusIcon } = getChargingStatusInfo(vehicle.chargingStatus);
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease-in-out',
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
          <Chip 
            label={statusText} 
            size="small" 
            icon={statusIcon}
            sx={{ 
              bgcolor: statusColor, 
              color: statusColor === 'text.secondary' ? 'inherit' : 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ pt: 2, flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {vehicle.model}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Driver: {vehicle.driver}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Battery Level
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {vehicle.batteryLevel}% • {vehicle.range} km range
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={vehicle.batteryLevel} 
            sx={{ 
              height: 8, 
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: getBatteryColor(vehicle.batteryLevel)
              }
            }} 
          />
        </Box>
        
        {vehicle.chargingStatus === 'charging' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BoltIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Charging
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {vehicle.chargingPower} • {vehicle.chargingRate} kWh
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Station:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {vehicle.chargingStation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Time:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {vehicle.startTime} - {vehicle.estimatedEndTime}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last Full Charge:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {vehicle.lastFullCharge}
          </Typography>
        </Box>
      </CardContent>
      
      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button 
          variant="outlined" 
          fullWidth 
          startIcon={<ScheduleIcon />}
          onClick={() => onScheduleCharging(vehicle)}
          disabled={vehicle.chargingStatus === 'charging'}
        >
          {vehicle.chargingStatus === 'waiting' ? 'View Schedule' : 'Schedule Charging'}
        </Button>
      </Box>
    </Card>
  );
};

// Charging Station Component
const ChargingStationCard = ({ station }) => {
  const isAvailable = station.status === 'available';
  const isInUse = station.status === 'in-use';
  const isReserved = station.status === 'reserved';
  const isMaintenance = station.status === 'maintenance';
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `4px solid ${getStationStatusColor(station.status)}`,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Add station image */}
      <Box sx={{ mb: 2, overflow: 'hidden', borderRadius: 1 }}>
        <Box
          component="img"
          src={station.image}
          alt={station.name}
          sx={{ 
            width: '100%', 
            height: '120px', 
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">{station.name}</Typography>
          <Typography variant="body2" color="text.secondary">{station.type}</Typography>
        </Box>
        <Chip 
          label={station.availability} 
          size="small" 
          sx={{ 
            bgcolor: getStationStatusColor(station.status), 
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Location</Typography>
          <Typography variant="body2">{station.location}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Energy Source</Typography>
          <Typography variant="body2">
            <Box component="span" sx={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              color: station.energySource === 'Renewable' ? 'success.main' : 'text.primary'
            }}>
              {station.energySource === 'Renewable' && <EcoIcon fontSize="inherit" sx={{ mr: 0.5 }} />}
              {station.energySource}
            </Box>
          </Typography>
        </Grid>
      </Grid>
      
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Uptime</Typography>
          <Typography variant="body2">{station.uptime}%</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Last Maintenance</Typography>
          <Typography variant="body2">{station.lastMaintenance}</Typography>
        </Grid>
      </Grid>
      
      {isInUse && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(33, 150, 243, 0.08)', borderRadius: 1 }}>
          <Typography variant="caption" color="primary">Currently Charging</Typography>
          <Typography variant="body2" fontWeight="medium">{station.currentVehicle}</Typography>
          <Typography variant="caption" color="text.secondary">
            Power output: {station.power} kW
          </Typography>
        </Box>
      )}
      
      {isMaintenance && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(244, 67, 54, 0.08)', borderRadius: 1 }}>
          <Typography variant="caption" color="error">Under Maintenance</Typography>
          <Typography variant="body2">
            Station undergoing scheduled maintenance.
          </Typography>
        </Box>
      )}
      
      {isReserved && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255, 152, 0, 0.08)', borderRadius: 1 }}>
          <Typography variant="caption" color="warning.main">Reserved</Typography>
          <Typography variant="body2">
            Reserved for upcoming charging session.
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Button 
          variant="text" 
          size="small" 
          startIcon={<LocationIcon />}
          fullWidth
        >
          View on Map
        </Button>
      </Box>
    </Paper>
  );
};

// Schedule Item Component
const ScheduleItem = ({ schedule, vehicles, stations }) => {
  const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
  const station = stations.find(s => s.id === schedule.stationId);
  
  if (!vehicle || !station) return null;
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      default: return 'success.main';
    }
  };
  
  return (
    <Paper sx={{ p: 1.5, mb: 1, borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar src={vehicle.image} sx={{ width: 32, height: 32, mr: 1 }} />
        <Box>
          <Typography variant="subtitle2">{vehicle.id}</Typography>
          <Typography variant="caption" color="text.secondary">{vehicle.model}</Typography>
        </Box>
        <Chip 
          label={schedule.priority.toUpperCase()} 
          size="small" 
          sx={{ 
            ml: 'auto', 
            bgcolor: getPriorityColor(schedule.priority), 
            color: 'white',
            height: 20,
            fontSize: '0.6rem'
          }} 
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Date</Typography>
          <Typography variant="body2">{schedule.date}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Station</Typography>
          <Typography variant="body2">{station.id}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Time</Typography>
          <Typography variant="body2">{schedule.startTime} ({schedule.duration} min)</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Target</Typography>
          <Typography variant="body2">{schedule.targetBatteryLevel}%</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

// EVCharging Component
const EVCharging = () => {
  // State management
  const [vehicles, setVehicles] = useState(vehiclesData);
  const [stations, setStations] = useState(chargingStationsData);
  const [schedules, setSchedules] = useState(scheduledChargingData);
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    stationId: '',
    date: '',
    startTime: '',
    duration: 60,
    priority: 'medium',
    targetBatteryLevel: 80
  });
  
  // Metrics calculations
  const activeChargingSessions = vehicles.filter(v => v.chargingStatus === 'charging').length;
  const availableStations = stations.filter(s => s.status === 'available').length;
  const totalEnergyToday = historicalChargingData.daily[new Date().getDay() - 1]?.energyUsed || 0;
  const totalCostToday = historicalChargingData.daily[new Date().getDay() - 1]?.cost || 0;
  
  // Handlers
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleScheduleCharging = (vehicle) => {
    setSelectedVehicle(vehicle);
    setScheduleForm({
      stationId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      duration: 60,
      priority: 'medium',
      targetBatteryLevel: 80
    });
    setChargeModalOpen(true);
  };
  
  const handleCloseChargeModal = () => {
    setChargeModalOpen(false);
    setSelectedVehicle(null);
  };
  
  const handleScheduleSubmit = () => {
    if (!selectedVehicle || !scheduleForm.stationId || !scheduleForm.date || !scheduleForm.startTime) {
      alert('Please fill all required fields');
      return;
    }
    
    const newSchedule = {
      id: `SCH-${Math.floor(Math.random() * 1000)}`,
      vehicleId: selectedVehicle.id,
      ...scheduleForm,
      status: 'scheduled'
    };
    
    setSchedules([...schedules, newSchedule]);
    setChargeModalOpen(false);
    
    // Update vehicle status to waiting if it's not already charging
    if (selectedVehicle.chargingStatus !== 'charging') {
      setVehicles(vehicles.map(v => 
        v.id === selectedVehicle.id 
          ? { ...v, chargingStatus: 'waiting', chargingStation: scheduleForm.stationId } 
          : v
      ));
    }
    
    // Update station status to reserved
    setStations(stations.map(s => 
      s.id === scheduleForm.stationId 
        ? { ...s, status: 'reserved', availability: 'Reserved' } 
        : s
    ));
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate real-time updates
      setVehicles(vehicles.map(vehicle => {
        if (vehicle.chargingStatus === 'charging') {
          const newBatteryLevel = Math.min(100, vehicle.batteryLevel + Math.floor(Math.random() * 5));
          const newRange = Math.round(newBatteryLevel / 100 * (vehicle.model === 'MUSOSHI EV-X3' ? 380 : vehicle.model === 'MUSOSHI EV-X2' ? 350 : 320));
          
          return {
            ...vehicle,
            batteryLevel: newBatteryLevel,
            range: newRange,
            chargingStatus: newBatteryLevel >= 100 ? 'complete' : 'charging'
          };
        }
        return vehicle;
      }));
      
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Simulate real-time updates for charging vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle.chargingStatus === 'charging') {
          const increase = Math.floor(Math.random() * 2) + 1; // 1-2% increase
          const newBatteryLevel = Math.min(100, vehicle.batteryLevel + increase);
          const newRange = Math.round(newBatteryLevel / 100 * (vehicle.model === 'MUSOSHI EV-X3' ? 380 : vehicle.model === 'MUSOSHI EV-X2' ? 350 : 320));
          
          // If charging is complete, update status
          if (newBatteryLevel >= 100) {
            // Also update station to be available
            setStations(prev => prev.map(station => 
              station.id === vehicle.chargingStation 
                ? { ...station, status: 'available', availability: 'Available', currentVehicle: null, power: 0 } 
                : station
            ));
            
            return {
              ...vehicle,
              batteryLevel: 100,
              range: newRange,
              chargingStatus: 'complete',
              chargingRate: 0,
              chargingPower: '0 kW',
              lastFullCharge: 'Just now'
            };
          }
          
          return {
            ...vehicle,
            batteryLevel: newBatteryLevel,
            range: newRange
          };
        }
        return vehicle;
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            EV Charging Management
          </Typography>
          <Box>
            <Tooltip title="Refresh data">
              <IconButton 
                color="primary" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'primary.main',
                  mr: 1
                }}
              >
                {isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => alert('Add charging station')}
            >
              Add Station
            </Button>
          </Box>
        </Box>
        
        {/* Metrics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Charging"
              value={activeChargingSessions}
              subtitle={`${activeChargingSessions} of ${vehicles.length} vehicles`}
              icon={<BatteryChargingIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Available Stations"
              value={availableStations}
              subtitle={`${availableStations} of ${stations.length} stations`}
              icon={<EvStationIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Green Energy"
              value={`${historicalChargingData.greenEnergy}%`}
              subtitle="Renewable energy usage"
              icon={<EcoIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Energy Cost"
              value={`₺${energyCostData.currentRate}`}
              subtitle="per kWh"
              icon={<MoneyIcon />}
              color="warning"
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {/* Main content area */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="charging tabs">
                  <Tab label="Vehicle Status" icon={<CarIcon />} iconPosition="start" />
                  <Tab label="Charging Stations" icon={<EvStationIcon />} iconPosition="start" />
                  <Tab label="Energy Usage" icon={<BoltIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              
              {/* Tab 1: Vehicle Status */}
              {currentTab === 0 && (
                <CardContent>
                  <Grid container spacing={3}>
                    {vehicles.map(vehicle => (
                      <Grid item xs={12} sm={6} key={vehicle.id}>
                        <VehicleChargingCard 
                          vehicle={vehicle} 
                          onScheduleCharging={handleScheduleCharging}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              )}
              
              {/* Tab 2: Charging Stations */}
              {currentTab === 1 && (
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box 
                        component="img"
                        src={chargingStationImage3}
                        alt="Charging Stations"
                        sx={{ 
                          width: '100%', 
                          height: 'auto',
                          maxHeight: 250,
                          borderRadius: 2,
                          mb: 2
                        }}
                      />
                    </Grid>
                    
                    {stations.map(station => (
                      <Grid item xs={12} sm={6} md={4} key={station.id}>
                        <ChargingStationCard station={station} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              )}
              
              {/* Tab 3: Energy Usage */}
              {currentTab === 2 && (
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Energy Consumption</Typography>
                    <Box 
                      component="img"
                      src={chargingStationImage2}
                      alt="Energy Usage"
                      sx={{ 
                        width: '100%', 
                        height: 'auto',
                        maxHeight: 250,
                        borderRadius: 2,
                        mb: 2
                      }}
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Today's Consumption</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {totalEnergyToday} kWh
                          </Typography>
                          <Typography variant="caption">₺{totalCostToday}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Monthly Consumption</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {historicalChargingData.monthly} kWh
                          </Typography>
                          <Typography variant="caption">₺{historicalChargingData.monthly * historicalChargingData.averageCost}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Peak Rate</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            ₺{energyCostData.peakRate}
                          </Typography>
                          <Typography variant="caption">{energyCostData.peakHours}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Off-Peak Rate</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ₺{energyCostData.offPeakRate}
                          </Typography>
                          <Typography variant="caption">{energyCostData.offPeakHours}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" gutterBottom>Power Grid Status</Typography>
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                      <Box 
                        component="img"
                        src={chargingStationImage1}
                        alt="Power Grid Status"
                        sx={{ 
                          width: '100%', 
                          height: 'auto',
                          maxHeight: 200,
                          borderRadius: 1
                        }}
                      />
                    </Paper>
                    
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Smart Charging Recommendations</Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <FlashOnIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2">Schedule off-peak charging</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Schedule charging sessions during 21:00 - 06:00 to save 37% on energy costs.
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <EcoIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2">Use renewable energy stations</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Prioritize stations with renewable energy to reduce carbon footprint.
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <BatteryChargingIcon sx={{ color: 'warning.main', mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2">Battery health optimization</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Maintain 20-80% charge range for optimal battery lifespan.
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <TimerIcon sx={{ color: 'warning.main', mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2">Charge time optimization</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Reduce charge time by prioritizing fast chargers for vehicles below 30%.
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </CardContent>
              )}
            </Card>
          </Grid>
          
          {/* Right sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Charging Schedule */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Charging Schedule</Typography>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => handleScheduleCharging(vehicles[0])}
                  >
                    New Schedule
                  </Button>
                </Box>
                
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="subtitle1">Today's Schedule</Typography>
                  </Box>
                  
                  {schedules.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {schedules.map(schedule => (
                        <ScheduleItem 
                          key={schedule.id} 
                          schedule={schedule} 
                          vehicles={vehicles}
                          stations={stations}
                        />
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No charging sessions scheduled for today.
                    </Typography>
                  )}
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ButtonGroup size="small">
                    <Button>Today</Button>
                    <Button>Tomorrow</Button>
                    <Button>Week</Button>
                  </ButtonGroup>
                </Box>
              </CardContent>
            </Card>
            
            {/* Fleet Battery Status */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fleet Battery Status</Typography>
                
                {vehicles.map(vehicle => (
                  <Box key={vehicle.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Avatar src={vehicle.image} sx={{ width: 24, height: 24, mr: 1 }} />
                      <Typography variant="body2">{vehicle.id}</Typography>
                      <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'medium' }}>
                        {vehicle.batteryLevel}%
                      </Typography>
                    </Box>
                    <ProgressWithLabel>
                      <LinearProgress 
                        variant="determinate" 
                        value={vehicle.batteryLevel} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          flexGrow: 1,
                          mr: 1,
                          bgcolor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getBatteryColor(vehicle.batteryLevel)
                          }
                        }} 
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: getBatteryColor(vehicle.batteryLevel)
                      }}>
                        <BatteryIcon fontSize="small" />
                      </Box>
                    </ProgressWithLabel>
                    <Typography variant="caption" color="text.secondary">
                      Range: {vehicle.range} km
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
            
            {/* Energy Rate Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Energy Management</Typography>
                
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Smart Charging Settings</Typography>
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Optimize for cost savings"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Prioritize renewable energy"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Vehicle-to-grid (V2G) enabled"
                  />
                </Paper>
                
                <Typography variant="subtitle2" gutterBottom>Current Rate Plan</Typography>
                <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Standard Rate</Typography>
                    <Typography variant="body2" fontWeight="medium">₺{energyCostData.currentRate}/kWh</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Peak Hours (14:00-21:00)</Typography>
                    <Typography variant="body2" fontWeight="medium">₺{energyCostData.peakRate}/kWh</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Off-Peak Hours (21:00-06:00)</Typography>
                    <Typography variant="body2" fontWeight="medium">₺{energyCostData.offPeakRate}/kWh</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Schedule Charging Modal */}
      <Dialog
        open={chargeModalOpen}
        onClose={handleCloseChargeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedVehicle?.chargingStatus === 'waiting' 
            ? `View Scheduled Charging: ${selectedVehicle?.id}` 
            : `Schedule Charging: ${selectedVehicle?.id}`}
        </DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Avatar 
                    src={selectedVehicle.image} 
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="subtitle1">{selectedVehicle.model}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <BatteryIcon 
                      fontSize="small" 
                      sx={{ mr: 0.5, color: getBatteryColor(selectedVehicle.batteryLevel) }} 
                    />
                    <Typography variant="body2">
                      Current Battery: {selectedVehicle.batteryLevel}% • {selectedVehicle.range} km range
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              {selectedVehicle.chargingStatus === 'waiting' ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Scheduled Charging Session</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Station</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedVehicle.chargingStation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Start Time</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {schedules.find(s => s.vehicleId === selectedVehicle.id)?.date || 'Today'}, {schedules.find(s => s.vehicleId === selectedVehicle.id)?.startTime || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {schedules.find(s => s.vehicleId === selectedVehicle.id)?.duration || 60} minutes
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Target Level</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {schedules.find(s => s.vehicleId === selectedVehicle.id)?.targetBatteryLevel || 80}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Charging Station</InputLabel>
                      <Select
                        name="stationId"
                        value={scheduleForm.stationId}
                        onChange={handleFormChange}
                        label="Charging Station"
                      >
                        {stations
                          .filter(station => station.status === 'available')
                          .map(station => (
                            <MenuItem key={station.id} value={station.id}>
                              {station.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      name="date"
                      value={scheduleForm.date}
                      onChange={handleFormChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      name="startTime"
                      value={scheduleForm.startTime}
                      onChange={handleFormChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration (minutes)"
                      type="number"
                      name="duration"
                      value={scheduleForm.duration}
                      onChange={handleFormChange}
                      InputProps={{ inputProps: { min: 15, max: 240 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={scheduleForm.priority}
                        onChange={handleFormChange}
                        label="Priority"
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Target Battery Level (%)"
                      type="number"
                      name="targetBatteryLevel"
                      value={scheduleForm.targetBatteryLevel}
                      onChange={handleFormChange}
                      InputProps={{ inputProps: { min: selectedVehicle.batteryLevel, max: 100 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Optimize for off-peak hours (save up to 37%)"
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChargeModal}>Cancel</Button>
          {selectedVehicle?.chargingStatus !== 'waiting' && (
            <Button 
              variant="contained" 
              onClick={handleScheduleSubmit}
              disabled={!scheduleForm.stationId || !scheduleForm.date || !scheduleForm.startTime}
            >
              Schedule Charging
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EVCharging;