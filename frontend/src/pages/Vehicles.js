import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia, 
  Chip, Avatar, Divider, Paper, LinearProgress, Stack, IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Import vehicle images
import musoshi001Img from '../assets/icons/musoshi001.jpg';
import musoshi002Img from '../assets/icons/musoshi002.jpg';
import musoshi003Img from '../assets/icons/musoshi003.jpg';
import musoshi004Img from '../assets/icons/musoshi004.jpg';
import musoshi005Img from '../assets/icons/musoshi005.jpg';

// Mock data for vehicles based on the provided backend code
const vehiclesData = [
  {
    id: 'musoshi001',
    image: musoshi001Img,
    driver: {
      name: 'Ahmet Y.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      phone: '+90 (555) 123-4567',
      status: 'active'
    },
    data: {
      latitude: 41.0082,
      longitude: 28.9784,
      speed: 65,
      soc: 78, // Battery level
      range_km: 180,
      route_id: 'R1001',
      routeName: 'Istanbul - Ankara Express',
      vehicle_load_kg: 850,
      lastUpdate: '2 minutes ago',
      status: 'on-route'
    }
  },
  {
    id: 'musoshi003',
    image: musoshi003Img,
    driver: {
      name: 'Mehmet K.',
      avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
      phone: '+90 (555) 987-6543',
      status: 'break'
    },
    data: {
      latitude: 40.9923,
      longitude: 29.1244,
      speed: 0,
      soc: 45,
      range_km: 110,
      route_id: 'R1002',
      routeName: 'Istanbul City Distribution',
      vehicle_load_kg: 1200,
      lastUpdate: '15 minutes ago',
      status: 'stopped'
    }
  },
  {
    id: 'musoshi004',
    image: musoshi004Img,
    driver: {
      name: 'Zeynep D.',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      phone: '+90 (555) 456-7890',
      status: 'active'
    },
    data: {
      latitude: 41.1034,
      longitude: 29.0246,
      speed: 45,
      soc: 62,
      range_km: 145,
      route_id: 'R1003',
      routeName: 'Northern Logistics Route',
      vehicle_load_kg: 950,
      lastUpdate: '5 minutes ago',
      status: 'on-route'
    }
  },
  {
    id: 'musoshi005',
    image: musoshi005Img,
    driver: {
      name: 'Ali S.',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      phone: '+90 (555) 234-5678',
      status: 'active'
    },
    data: {
      latitude: 40.9867,
      longitude: 29.0287,
      speed: 55,
      soc: 28,
      range_km: 75,
      route_id: 'R1004',
      routeName: 'Eastern Express',
      vehicle_load_kg: 1100,
      lastUpdate: '8 minutes ago',
      status: 'on-route'
    }
  },
  {
    id: 'musoshi006',
    image: musoshi002Img, // Using musoshi002 image for musoshi006
    driver: {
      name: 'Ayşe Y.',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      phone: '+90 (555) 345-6789',
      status: 'inactive'
    },
    data: {
      latitude: 41.0532,
      longitude: 28.9872,
      speed: 0,
      soc: 93,
      range_km: 220,
      route_id: 'R1005',
      routeName: 'Maintenance Schedule',
      vehicle_load_kg: 0,
      lastUpdate: '2 hours ago',
      status: 'maintenance'
    }
  }
];

// Status color mapping
const statusColors = {
  'on-route': '#4caf50',
  'stopped': '#ff9800',
  'maintenance': '#f44336',
  'charging': '#2196f3'
};

// Driver status color mapping
const driverStatusColors = {
  'active': '#4caf50',
  'break': '#ff9800',
  'inactive': '#9e9e9e'
};

// Battery level color function
const getBatteryColor = (level) => {
  if (level > 60) return '#4caf50';
  if (level > 30) return '#ff9800';
  return '#f44336';
};

const VehicleStatusChip = ({ status }) => {
  const getStatusLabel = (status) => {
    switch(status) {
      case 'on-route': return 'On Route';
      case 'stopped': return 'Stopped';
      case 'maintenance': return 'Maintenance';
      case 'charging': return 'Charging';
      default: return 'Unknown';
    }
  };
  
  return (
    <Chip 
      label={getStatusLabel(status)} 
      size="small" 
      sx={{ 
        bgcolor: statusColors[status] || '#9e9e9e', 
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};

const VehicleCard = ({ vehicle }) => {
  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
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
          <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="subtitle2">{vehicle.id}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <VehicleStatusChip status={vehicle.data.status} />
        </Box>
      </Box>
      
      <CardContent sx={{ pt: 2, pb: 1, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={vehicle.driver.avatar} sx={{ mr: 1.5 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {vehicle.driver.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: driverStatusColors[vehicle.driver.status], 
                  mr: 0.5 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {vehicle.driver.status.charAt(0).toUpperCase() + vehicle.driver.status.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RouteIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {vehicle.data.routeName}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ID: {vehicle.data.route_id}
          </Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Speed</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {vehicle.data.speed} km/h
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Load</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {vehicle.data.vehicle_load_kg} kg
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" color="text.secondary">Battery</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <BatteryChargingFullIcon 
                  fontSize="small" 
                  sx={{ mr: 0.5, color: getBatteryColor(vehicle.data.soc) }} 
                />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {vehicle.data.soc}% • {vehicle.data.range_km} km range
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={vehicle.data.soc} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getBatteryColor(vehicle.data.soc)
                  }
                }} 
              />
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon fontSize="small" color="error" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {vehicle.data.latitude.toFixed(4)}, {vehicle.data.longitude.toFixed(4)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Updated {vehicle.data.lastUpdate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState(vehiclesData);

  // You would replace this with actual WebSocket or API calls to get real-time data
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        // Make some random changes to simulate real-time updates
        if (Math.random() > 0.7) {
          const newSpeed = vehicle.data.status === 'on-route' 
            ? Math.max(35, Math.min(80, vehicle.data.speed + (Math.random() > 0.5 ? 5 : -5)))
            : vehicle.data.speed;
          
          const newSoc = vehicle.data.status === 'charging'
            ? Math.min(100, vehicle.data.soc + 1)
            : Math.max(5, vehicle.data.soc - (Math.random() > 0.8 ? 1 : 0));
          
          return {
            ...vehicle,
            data: {
              ...vehicle.data,
              speed: newSpeed,
              soc: newSoc,
              lastUpdate: 'Just now'
            }
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
            Fleet Management
          </Typography>
          <Box>
            <Chip 
              icon={<DirectionsCarIcon />} 
              label={`${vehicles.length} Vehicles`}
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip 
              icon={<PersonIcon />} 
              label={`${vehicles.filter(v => v.driver.status === 'active').length} Active Drivers`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 4, 
            bgcolor: '#f8f9fa', 
            borderLeft: '4px solid #2196f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="body1">
            Real-time tracking and monitoring of your MUSOSHI electric delivery vehicles.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              size="small"
              label={`${vehicles.filter(v => v.data.status === 'on-route').length} On Route`}
              sx={{ bgcolor: statusColors['on-route'], color: 'white' }}
            />
            <Chip 
              size="small"
              label={`${vehicles.filter(v => v.data.status === 'stopped').length} Stopped`}
              sx={{ bgcolor: statusColors['stopped'], color: 'white' }}
            />
            <Chip 
              size="small"
              label={`${vehicles.filter(v => v.data.status === 'maintenance').length} Maintenance`}
              sx={{ bgcolor: statusColors['maintenance'], color: 'white' }}
            />
          </Stack>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <VehicleCard vehicle={vehicle} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Vehicles;
