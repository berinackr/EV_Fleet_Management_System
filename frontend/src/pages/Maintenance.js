import React, { useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, LinearProgress, Paper, Avatar, Divider, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, FormControl, InputLabel, Select, Tabs, Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  DirectionsCar as VehicleIcon,
  Engineering as TechnicianIcon,
  Inventory as PartsIcon,
  Assessment as ReportIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import vehicle images
import musoshi001Img from '../assets/icons/musoshi001.jpg';
import musoshi003Img from '../assets/icons/musoshi003.jpg';
import musoshi004Img from '../assets/icons/musoshi004.jpg';
import musoshi005Img from '../assets/icons/musoshi005.jpg';

// Custom lightest colors to replace undefined theme values
const customColors = {
  error: {
    lightest: 'rgba(244, 67, 54, 0.08)'
  },
  warning: {
    lightest: 'rgba(255, 152, 0, 0.08)'
  }
};

// Mock maintenance data
const maintenanceData = {
  vehicles: [
    {
      id: 'MUSOSHI001',
      model: 'MUSOSHI EV-X1',
      image: musoshi001Img,
      status: 'Operational',
      batteryHealth: 92,
      lastService: '15.03.2024',
      nextService: '15.06.2024',
      mileage: 15420,
      alerts: []
    },
    {
      id: 'MUSOSHI003',
      model: 'MUSOSHI EV-X1',
      image: musoshi003Img,
      status: 'In Maintenance',
      batteryHealth: 68,
      lastService: '20.01.2024',
      nextService: '20.04.2024',
      mileage: 22100,
      alerts: [
        { type: 'warning', message: 'Brake system inspection required' },
        { type: 'critical', message: 'Tire replacement needed' }
      ]
    },
    {
      id: 'MUSOSHI004',
      model: 'MUSOSHI EV-X2',
      image: musoshi004Img,
      status: 'Operational',
      batteryHealth: 89,
      lastService: '20.03.2024',
      nextService: '20.06.2024',
      mileage: 8950,
      alerts: []
    },
    {
      id: 'MUSOSHI005',
      model: 'MUSOSHI EV-X2',
      image: musoshi005Img,
      status: 'Repair Required',
      batteryHealth: 45,
      lastService: '10.12.2023',
      nextService: '10.04.2024',
      mileage: 28750,
      alerts: [
        { type: 'critical', message: 'Brake system repair required' },
        { type: 'critical', message: 'Suspension system failure' }
      ]
    }
  ],
  workOrders: [
    {
      id: 'WO-2024-001',
      vehicleId: 'MUSOSHI003',
      type: 'Preventive Maintenance',
      status: 'In Progress',
      startDate: '01.04.2024',
      estimatedCompletion: '03.04.2024',
      technician: 'Ali Y.',
      details: 'Brake system inspection and tire replacement'
    },
    {
      id: 'WO-2024-002',
      vehicleId: 'MUSOSHI005',
      type: 'Corrective Maintenance',
      status: 'Scheduled',
      startDate: '05.04.2024',
      estimatedCompletion: '08.04.2024',
      technician: 'Kemal Y.',
      details: 'Brake system and suspension repair'
    },
    {
      id: 'WO-2024-003',
      vehicleId: 'MUSOSHI001',
      type: 'Scheduled Service',
      status: 'Scheduled',
      startDate: '15.06.2024',
      estimatedCompletion: '16.06.2024',
      technician: 'Mehmet Ö.',
      details: 'Regular service inspection'
    }
  ],
  technicians: [
    { id: 'T001', name: 'Mehmet Ö.', specialization: 'EV Systems', availability: 'Available', completedJobs: 14 },
    { id: 'T002', name: 'Ali Y.', specialization: 'Brake Systems', availability: 'Busy', completedJobs: 23 },
    { id: 'T003', name: 'Kemal Y.', specialization: 'Mechanical Repairs', availability: 'Available', completedJobs: 18 },
    { id: 'T004', name: 'Ayşe K.', specialization: 'Battery Systems', availability: 'Available', completedJobs: 9 }
  ],
  parts: [
    { id: 'P001', name: 'Brake Pads', category: 'Brakes', inStock: 24, reserved: 4, price: 250 },
    { id: 'P002', name: 'Battery Cell', category: 'Battery', inStock: 8, reserved: 0, price: 1200 },
    { id: 'P003', name: 'Motor Controller', category: 'Motor', inStock: 3, reserved: 1, price: 2500 },
    { id: 'P004', name: 'Suspension Strut', category: 'Suspension', inStock: 12, reserved: 2, price: 800 }
  ]
};

// Status chip component
const StatusChip = ({ status }) => {
  let color;
  switch (status) {
    case 'Operational':
      color = 'success';
      break;
    case 'In Maintenance':
      color = 'warning';
      break;
    case 'Repair Required':
      color = 'error';
      break;
    case 'In Progress':
      color = 'primary';
      break;
    case 'Scheduled':
      color = 'info';
      break;
    default:
      color = 'default';
  }
  
  return <Chip label={status} color={color} size="small" />;
};

// Main Maintenance component
const Maintenance = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenWorkOrderDialog = () => {
    setWorkOrderDialogOpen(true);
  };

  const handleCloseWorkOrderDialog = () => {
    setWorkOrderDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Maintenance Management
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenWorkOrderDialog}
          >
            New Work Order
          </Button>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<VehicleIcon />} label="Fleet Status" />
            <Tab icon={<CalendarIcon />} label="Work Orders" />
            <Tab icon={<TechnicianIcon />} label="Technicians" />
            <Tab icon={<PartsIcon />} label="Parts Inventory" />
            <Tab icon={<ReportIcon />} label="Reports" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        {/* Tab 1: Fleet Status */}
        {currentTab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Vehicle ID</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Battery Health</TableCell>
                    <TableCell>Last Service</TableCell>
                    <TableCell>Next Service</TableCell>
                    <TableCell>Mileage</TableCell>
                    <TableCell>Alerts</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceData.vehicles.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: vehicle.alerts.some(a => a.type === 'critical') ? customColors.error.lightest : 'inherit'
                      }}
                    >
                      <TableCell>{vehicle.id}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell><StatusChip status={vehicle.status} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={vehicle.batteryHealth} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 5,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: 
                                    vehicle.batteryHealth > 75 ? 'success.main' :
                                    vehicle.batteryHealth > 50 ? 'warning.main' : 'error.main'
                                }
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{vehicle.batteryHealth}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{vehicle.lastService}</TableCell>
                      <TableCell>{vehicle.nextService}</TableCell>
                      <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                      <TableCell>
                        {vehicle.alerts.length > 0 ? (
                          <Chip 
                            label={`${vehicle.alerts.length} ${vehicle.alerts.length === 1 ? 'alert' : 'alerts'}`}
                            color={vehicle.alerts.some(a => a.type === 'critical') ? 'error' : 'warning'}
                            size="small"
                          />
                        ) : (
                          <Chip label="No alerts" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          onClick={() => handleVehicleSelect(vehicle)}
                          variant="outlined"
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Tab 2: Work Orders */}
        {currentTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell>Work Order ID</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Est. Completion</TableCell>
                  <TableCell>Technician</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceData.workOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.vehicleId}</TableCell>
                    <TableCell>{order.type}</TableCell>
                    <TableCell><StatusChip status={order.status} /></TableCell>
                    <TableCell>{order.startDate}</TableCell>
                    <TableCell>{order.estimatedCompletion}</TableCell>
                    <TableCell>{order.technician}</TableCell>
                    <TableCell>{order.details}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 3: Technicians */}
        {currentTab === 2 && (
          <Grid container spacing={3}>
            {maintenanceData.technicians.map((tech) => (
              <Grid item xs={12} sm={6} lg={3} key={tech.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {tech.name}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>ID:</strong> {tech.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Specialization:</strong> {tech.specialization}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Status:</strong> {' '}
                      <Chip 
                        label={tech.availability} 
                        color={tech.availability === 'Available' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Completed Jobs:</strong> {tech.completedJobs}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tab 4: Parts Inventory */}
        {currentTab === 3 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell>Part ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">In Stock</TableCell>
                  <TableCell align="right">Reserved</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Price (₺)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceData.parts.map((part) => {
                  const available = part.inStock - part.reserved;
                  return (
                    <TableRow 
                      key={part.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{part.id}</TableCell>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>{part.category}</TableCell>
                      <TableCell align="right">{part.inStock}</TableCell>
                      <TableCell align="right">{part.reserved}</TableCell>
                      <TableCell align="right">{available}</TableCell>
                      <TableCell align="right">{part.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={available < 5 ? "Low Stock" : "In Stock"} 
                          color={available < 5 ? "warning" : "success"} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 5: Reports */}
        {currentTab === 4 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Maintenance Reports</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Operational Vehicles
                    </Typography>
                    <Typography variant="h4">
                      {maintenanceData.vehicles.filter(v => v.status === 'Operational').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of {maintenanceData.vehicles.length} total vehicles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Open Work Orders
                    </Typography>
                    <Typography variant="h4">
                      {maintenanceData.workOrders.filter(w => w.status !== 'Completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      requiring attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Average Battery Health
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(maintenanceData.vehicles.reduce((acc, v) => acc + v.batteryHealth, 0) / maintenanceData.vehicles.length)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      across all vehicles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Critical Alerts
                    </Typography>
                    <Typography variant="h4">
                      {maintenanceData.vehicles.flatMap(v => v.alerts).filter(a => a.type === 'critical').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      requiring immediate attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Vehicle Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedVehicle && (
            <>
              <DialogTitle>
                {selectedVehicle.id} - Maintenance Details
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box component="img" src={selectedVehicle.image} alt={selectedVehicle.id} sx={{ width: '100%', borderRadius: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {selectedVehicle.model}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell><StatusChip status={selectedVehicle.status} /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Battery Health</TableCell>
                            <TableCell>{selectedVehicle.batteryHealth}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Last Service</TableCell>
                            <TableCell>{selectedVehicle.lastService}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Next Service</TableCell>
                            <TableCell>{selectedVehicle.nextService}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Mileage</TableCell>
                            <TableCell>{selectedVehicle.mileage.toLocaleString()} km</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {selectedVehicle.alerts.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Active Alerts
                        </Typography>
                        {selectedVehicle.alerts.map((alert, index) => (
                          <Paper 
                            key={index} 
                            sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              bgcolor: alert.type === 'critical' ? customColors.error.lightest : customColors.warning.lightest,
                              borderLeft: 4, 
                              borderColor: alert.type === 'critical' ? 'error.main' : 'warning.main'
                            }}
                          >
                            <Typography variant="body2">
                              {alert.message}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
                
                {/* Maintenance History Section */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Maintenance History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Technician</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Cost (₺)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              Maintenance history would be displayed here
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenWorkOrderDialog();
                  }}
                >
                  Create Work Order
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* New Work Order Dialog */}
        <Dialog
          open={workOrderDialogOpen}
          onClose={handleCloseWorkOrderDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Create New Work Order
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle</InputLabel>
                  <Select label="Vehicle">
                    {maintenanceData.vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.id} - {vehicle.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Maintenance Type</InputLabel>
                  <Select label="Maintenance Type">
                    <MenuItem value="preventive">Preventive Maintenance</MenuItem>
                    <MenuItem value="corrective">Corrective Maintenance</MenuItem>
                    <MenuItem value="scheduled">Scheduled Service</MenuItem>
                    <MenuItem value="inspection">Inspection</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Completion"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assigned Technician</InputLabel>
                  <Select label="Assigned Technician">
                    {maintenanceData.technicians.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.name} - {tech.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Details"
                  multiline
                  rows={4}
                  placeholder="Enter detailed description of the work to be performed"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWorkOrderDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleCloseWorkOrderDialog}>
              Create Work Order
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Maintenance;