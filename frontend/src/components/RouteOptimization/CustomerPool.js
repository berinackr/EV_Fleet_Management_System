import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, List, ListItem, Box, Chip, TextField,
  IconButton, Modal, Grid, FormControl, InputLabel, Select, MenuItem,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormHelperText, Tooltip, Radio, RadioGroup, FormControlLabel, FormLabel, CircularProgress,
  ListItemIcon, ListItemText, Badge, Switch
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import BugReportIcon from '@mui/icons-material/BugReport';
import { keyframes, styled } from "@mui/system";
import axios from "axios";
import { loadTaskData } from "../../services/taskService";
import { ENDPOINTS, fetchData } from "../../services/api";

// Durum renkleri - tüm durum değerleri küçük harf
const statusColors = {
  requested: "#FFC107",
  "on the way": "#2196F3",
  delivered: "#4CAF50",
  cancelled: "#F44336",
  completed: "#4CAF50",
  waiting: "#FFC107",
  unknown: "#999999"
};

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const BlinkingCircle = styled(CircleIcon)(({ status }) => ({
  color: statusColors[(status || '').toLowerCase()] || "#999",
  fontSize: "1.3rem",
  animation: (status || '').toLowerCase() === "waiting" || (status || '').toLowerCase() === "requested" ? 
    `${blink} 1.32s infinite` : "none",
}));

// Zaman penceresi kategorilendirmesi
const getTimeCategory = (timeWindow) => {
  if (!timeWindow) return "all";
  
  const startTime = timeWindow.split('-')[0];
  if (!startTime) return "all";
  
  const hour = parseInt(startTime.split(':')[0]);
  
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 || hour < 5) return "evening";
  
  return "all";
};

export default function CustomerPool({ onCustomerSelect }) { // Add onCustomerSelect prop
  // Genel state'ler
  const [customers, setCustomers] = useState([]);
  const [originalCustomers, setOriginalCustomers] = useState([]);
  const [isNewDataAdded, setIsNewDataAdded] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customerFetchError, setCustomerFetchError] = useState('');
  const [orderCounts, setOrderCounts] = useState({ waiting: 0, completed: 0, total: 0 });
  
  // Debug modu
  const [debugMode, setDebugMode] = useState(false);
  const [filterStats, setFilterStats] = useState({ total: 0, orders: 0, waiting: 0, completed: 0 });

  // Filtreleme kriterleri
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    demand: "",
    weight: "",
    timeWindow: "",
    orderStatus: "",
    showOnlyOrders: false
  });

  // Modal state'leri
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Form state'leri
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    brand: '',
    address: '',
    demand: '',
    orderDate: '',
    startTime: '',
    endTime: '',
    status: 'Requested',
    notes: ''
  });

  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [customerFormErrors, setCustomerFormErrors] = useState({});

  // API'den veri çekme - useEffect içinde bir kez çalışmalı
  useEffect(() => {
    console.log("🔄 fetchCustomersData çağrıldı (API'den veri çekiliyor)");
    fetchCustomersData();
  }, []); // Boş dependency array, sadece bileşen monte edildiğinde çalışmasını sağlar

  const fetchCustomersData = () => {
    setIsLoadingCustomers(true);
    setCustomerFetchError('');
    
    console.log('Fetching customer data...');

    axios.get('http://localhost:3001/api/direct-customers')
      .then((res) => {
        console.log('Successfully fetched customers via direct endpoint');
        const data = res.data || [];
        
        // Sipariş sayılarını hesapla
        const orders = data.filter(item => item.isOrder || item.type === 'order');
        console.log(`Order count: ${orders.length}`);
        
        // Statüleri küçük harfe çevir ve say
        const waitingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'waiting');
        const completedOrders = orders.filter(o => (o.status || '').toLowerCase() === 'completed');
        
        console.log(`Waiting orders: ${waitingOrders.length}, Completed orders: ${completedOrders.length}`);
        
        setOrderCounts({
          total: orders.length,
          waiting: waitingOrders.length,
          completed: completedOrders.length
        });
        
        setCustomers(data);
        setOriginalCustomers(data);
        setIsNewDataAdded(true);
      })
      .catch((directError) => {
        console.error("Direct endpoint failed:", directError);
        
        // Yedek uç noktasını dene 
        axios.get('http://localhost:3001/api/customers-test')
          .then((res) => {
            console.log('Successfully fetched customers via fallback endpoint');
            setCustomers(res.data);
            setOriginalCustomers(res.data);
            setIsNewDataAdded(true);
          })
          .catch((fallbackError) => {
            console.error("Fallback endpoint failed:", fallbackError);
            setCustomerFetchError(`Failed to load customer data: ${fallbackError.message}`);
            
            // Son çare olarak hardcoded veri kullan
            const hardcodedCustomers = [
              { 
                id: "hardcoded-1", 
                name: "Sample Customer 1", 
                address: "123 Main St, Sample City", 
                demand: 15, 
                timeWindow: "08:00-18:00",
                orderDate: "2024-04-10",
                status: "waiting",
                isOrder: true,
                type: 'order'
              },
              { 
                id: "hardcoded-2", 
                name: "Sample Customer 2", 
                address: "456 Oak Ave, Example Town", 
                demand: 25, 
                timeWindow: "09:00-17:00",
                orderDate: "2024-04-10",
                status: "completed",
                isOrder: true,
                type: 'order'
              }
            ];
            setCustomers(hardcodedCustomers);
            setOriginalCustomers(hardcodedCustomers);
            console.log("Using hardcoded fallback data");
          });
      })
      .finally(() => {
        setIsLoadingCustomers(false);
      });
  };

  // Gelişmiş filtreleme fonksiyonu
  const applyFilters = React.useCallback((items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];
    
    let filteredItems = [...items];
    
    // "Sadece siparişleri göster" filtresi
    if (filterCriteria.showOnlyOrders) {
      filteredItems = filteredItems.filter(item => item.isOrder || item.type === 'order');
    }
    
    // Durum (status) filtresi
    if (filterCriteria.orderStatus) {
      const requestedStatus = filterCriteria.orderStatus.toLowerCase().trim();
      
      filteredItems = filteredItems.filter(item => {
        const isOrder = item.isOrder || item.type === 'order';
        if (!isOrder) return false;
        
        const itemStatus = (item.status || '').toLowerCase().trim();
        return itemStatus === requestedStatus;
      });
    }
    
    // Arama metni filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.name?.toLowerCase() || '').includes(searchLower) ||
        (item.id?.toString() || '').includes(searchLower) ||
        (item.orderId?.toLowerCase() || '').includes(searchLower) ||
        (item.address?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Diğer filtreler (demand, weight, timeWindow)
    filteredItems = filteredItems.filter(item => {
      const demandValue = parseInt(item.demand) || 0;
      
      const matchesDemand = !filterCriteria.demand || 
        (filterCriteria.demand === "10" && demandValue >= 10) ||
        (filterCriteria.demand === "20" && demandValue >= 20) ||
        (filterCriteria.demand === "50" && demandValue >= 50);
      
      const matchesWeight = !filterCriteria.weight || 
        (filterCriteria.weight === "100" && demandValue >= 100) ||
        (filterCriteria.weight === "200" && demandValue >= 200) ||
        (filterCriteria.weight === "500" && demandValue >= 500);
      
      const timeCategory = getTimeCategory(item.timeWindow);
      const matchesTimeWindow = !filterCriteria.timeWindow || 
        filterCriteria.timeWindow === "all" || 
        timeCategory === filterCriteria.timeWindow;
      
      return matchesDemand && matchesWeight && matchesTimeWindow;
    });
    
    // İstatistikleri güncelle
    const waitingCount = filteredItems.filter(i => 
      (i.status || '').toLowerCase() === 'waiting' && (i.isOrder || i.type === 'order')).length;
    const completedCount = filteredItems.filter(i => 
      (i.status || '').toLowerCase() === 'completed' && (i.isOrder || i.type === 'order')).length;
    const ordersCount = filteredItems.filter(i => 
      i.isOrder || i.type === 'order').length;
    
    setFilterStats({
      total: filteredItems.length,
      orders: ordersCount,
      waiting: waitingCount,
      completed: completedCount
    });
    
    return filteredItems;
  }, [filterCriteria, searchTerm]);

  // Filtrelenmiş müşterileri hesapla
  const filteredCustomers = React.useMemo(() => 
    applyFilters(customers),
    [customers, applyFilters]
  );

  // Handler fonksiyonları
  const handleFilterChange = (field, value) => {
    setFilterCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Filtreleri temizle butonu için
  const clearFilters = () => {
    setFilterCriteria({
      demand: "",
      weight: "",
      timeWindow: "",
      orderStatus: "",
      showOnlyOrders: false
    });
    setSearchTerm("");
  };

  const toggleShowOnlyOrders = () => {
    setFilterCriteria(prev => ({ 
      ...prev, 
      showOnlyOrders: !prev.showOnlyOrders 
    }));
  };

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  const handleRefresh = () => {
    fetchCustomersData();
  };

  const handleCustomerSelect = (customerId) => {
    const newSelected = selectedCustomers.includes(customerId) 
      ? selectedCustomers.filter(id => id !== customerId)
      : [...selectedCustomers, customerId];
    
    setSelectedCustomers(newSelected);
    
    // Pass selected customers to parent
    const selectedCustomerObjects = customers.filter(c => newSelected.includes(c.id));
    onCustomerSelect(selectedCustomerObjects);
  };

  const handleCustomerClick = (customer) => {
    setCurrentCustomer(customer);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setCurrentCustomer(null);
  };

  // Form field handlers
  const handleTaskFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
    if (taskFormErrors[field]) {
      setTaskFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
    if (customerFormErrors[field]) {
      setCustomerFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Css stiller
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  };

  // ESOGU Task Selection modal state
  const [openEsoguModal, setOpenEsoguModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  const handleOpenEsoguModal = () => setOpenEsoguModal(true);
  const handleCloseEsoguModal = () => setOpenEsoguModal(false);

  const handleTaskSelection = (event) => {
    setSelectedTask(event.target.value);
    setTaskError('');
  };

  const handleTaskConfirm = async () => {
    if (!selectedTask) {
      setTaskError('Please select a task');
      return;
    }
    
    localStorage.setItem('selectedEsoguTask', selectedTask);
    const taskSelectedEvent = new CustomEvent('esoguTaskSelected', { 
      detail: { task: selectedTask } 
    });
    window.dispatchEvent(taskSelectedEvent);
    
    alert(`Task ${selectedTask} selected successfully! Click "Start Optimize" in the Optimization panel to process.`);
    handleCloseEsoguModal();
  };

  return (
    <Card
      sx={{
        borderRadius: "14px",
        padding: "19px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        border: "1px solid #E0E0E0",
        height: "90vh",
        width: "100%",
        maxWidth: "750px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flex: "0 1 auto", paddingBottom: "16px" }}>
        {/* Filtreleme Alanı */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Search Customer or Order"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Demand Amount</InputLabel>
                <Select
                  value={filterCriteria.demand}
                  label="Demand Amount"
                  onChange={(e) => handleFilterChange('demand', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="10">10+ adet</MenuItem>
                  <MenuItem value="20">20+ adet</MenuItem>
                  <MenuItem value="50">50+ adet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Weight</InputLabel>
                <Select
                  value={filterCriteria.weight}
                  label="Weight"
                  onChange={(e) => handleFilterChange('weight', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="100">100+ kg</MenuItem>
                  <MenuItem value="200">200+ kg</MenuItem>
                  <MenuItem value="500">500+ kg</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={filterCriteria.timeWindow}
                  label="Time Window"
                  onChange={(e) => handleFilterChange('timeWindow', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={filterCriteria.orderStatus}
                  label="Order Status"
                  onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                >
                  <MenuItem value="">All Orders ({orderCounts.total})</MenuItem>
                  <MenuItem value="waiting">
                    Waiting Orders ({orderCounts.waiting})
                  </MenuItem>
                  <MenuItem value="completed">
                    Completed Orders ({orderCounts.completed})
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Sadece siparişleri göster seçeneği */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Switch
                checked={filterCriteria.showOnlyOrders}
                onChange={toggleShowOnlyOrders}
                color="primary"
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Show orders only
              </Typography>
              {debugMode && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  sx={{ ml: 'auto', fontSize: '0.7rem' }}
                  onClick={() => console.log('Current data:', { 
                    all: customers, 
                    filtered: filteredCustomers,
                    stats: filterStats
                  })}
                >
                  Log Data
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
        {/* Başlık ve İkonlar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#222",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Customer Pool ({filteredCustomers.length})
            {isNewDataAdded && (
              <Chip 
                label="New Data Added" 
                color="success" 
                size="small" 
                sx={{ ml: 2, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
          <Box>
            <Tooltip title={debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}>
              <IconButton 
                color={debugMode ? "error" : "default"}
                onClick={toggleDebugMode}
                size="small"
                sx={{ mr: 1 }}
              >
                <BugReportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Select ESOGU Task Data">
              <IconButton 
                color="primary" 
                onClick={handleOpenEsoguModal}
                sx={{ mr: 1 }}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <span>
                <IconButton 
                  color="primary" 
                  onClick={handleRefresh}
                  disabled={isLoadingCustomers}
                  sx={{ mr: 1 }}
                >
                  {isLoadingCustomers ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Add Task">
              <IconButton 
                color="primary" 
                onClick={() => setOpenTaskModal(true)}
                sx={{ mr: 1 }}
              >
                <AddTaskIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Customer">
              <IconButton 
                color="primary" 
                onClick={() => setOpenCustomerModal(true)}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {/* Status Etiketleri */}
        <Box 
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          sx={{
            padding: "4px",
            backgroundColor: "#F9F9F9",
            borderRadius: "10px",
            fontWeight: 600,
            marginBottom: "10px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {Object.entries(statusColors).filter(([status]) => 
            status === 'waiting' || status === 'completed'
          ).map(([status, color]) => (
            <Box key={status} 
              display="flex" 
              alignItems="center" 
              gap={1}
              onClick={() => handleFilterChange('orderStatus', status)}
              sx={{
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                border: filterCriteria.orderStatus === status ? `1px solid ${color}` : '1px solid transparent',
                backgroundColor: filterCriteria.orderStatus === status ? 'rgba(0,0,0,0.05)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <CircleIcon sx={{ color: color, fontSize: "1.2rem" }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#444" }}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'waiting' ? orderCounts.waiting : orderCounts.completed})
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
      {/* Debug Bilgileri */}
      {debugMode && (
        <Box sx={{ px: 2, py: 1, backgroundColor: '#f0f8ff', borderRadius: 1, mb: 2, fontSize: '0.75rem' }}>
          <Typography variant="subtitle2">Debug Info:</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                Total items: {customers.length}
              </Typography>
              <Typography variant="caption" display="block">
                Filtered: {filteredCustomers.length}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                Orders: Total={orderCounts.total}, Waiting={orderCounts.waiting}, Completed={orderCounts.completed}
              </Typography>
              <Typography variant="caption" display="block">
                Filtered Orders: {filterStats.orders} (W:{filterStats.waiting}, C:{filterStats.completed})
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" display="block" sx={{ wordBreak: 'break-word' }}>
                Filters: {JSON.stringify(filterCriteria)}
              </Typography>
              <Button 
                size="small" 
                variant="outlined"
                onClick={clearFilters}
                sx={{ mt: 1, mr: 1, fontSize: '0.7rem' }}
              >
                Clear Filters
              </Button>
              {debugMode && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  sx={{ mt: 1, fontSize: '0.7rem' }}
                  onClick={() => console.log('Current data:', { 
                    all: customers, 
                    filtered: filteredCustomers,
                    stats: filterStats
                  })}
                >
                  Log Data
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      {/* Kaydırılabilir Müşteri Listesi */}
      <Box sx={{flex: "1 1 auto", overflowY: "auto", padding: "0 10px", scrollbarWidth: "thin", scrollbarColor: "#999 #ddd" }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            mb: 1,
            px: 3,
            py: 1,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Box sx={{ width: '5%' }}></Box>
          <Box sx={{ width: '30%', fontWeight: 600, fontSize: '0.75rem', color: '#555' }}>Time Window</Box>
          <Box sx={{ height: '20px', borderRight: '1px solid #ccc', mx: 1 }}></Box>
          <Box sx={{ width: '45%', fontWeight: 600, fontSize: '0.75rem', color: '#555' }}>Customer/Order</Box>
          <Box sx={{ height: '20px', borderRight: '1px solid #ccc', mx: 1 }}></Box>
          <Box sx={{ width: '20%', fontWeight: 600, fontSize: '0.75rem', color: '#555', textAlign: 'right' }}>Amount</Box>
        </Box>
        {isLoadingCustomers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Customers...</Typography>
          </Box>
        ) : customerFetchError ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="error">
              {customerFetchError}
            </Typography>
            <Button onClick={handleRefresh} sx={{ mt: 1 }}>Retry</Button>
          </Box>
        ) : (
          <List sx={{ paddingRight: "5px" }}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => {
                const isOrder = customer.isOrder || customer.type === 'order';
                const normalizedStatus = (customer.status || '').toLowerCase();
                const statusColor = statusColors[normalizedStatus] || "#999";
                return (
                  <ListItem key={customer.id || index} divider sx={{ padding: "6px 0" }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      width="100%"
                      sx={{
                        padding: "6px 10px",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        borderLeft: `5px solid ${statusColor}`,
                        boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": { 
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                          cursor: "pointer",
                        },
                      }}
                    >
                      <Checkbox 
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCustomerSelect(customer.id);
                        }}
                        sx={{ padding: "2px" }}
                        size="small"
                      />
                      <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        width="100%"
                        onClick={() => handleCustomerClick(customer)}
                      >
                        {/* Time Window */}
                        <Box sx={{ display: "flex", alignItems: "center", width: '30%', paddingRight: 1 }}>
                          <BlinkingCircle status={customer.status} sx={{ mr: 1, fontSize: "1rem" }} />
                          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                            {customer.timeWindow || "Any time"}
                          </Typography>
                        </Box>
                        <Box sx={{ height: '24px', borderRight: '1px solid #e0e0e0', mx: 1 }}></Box>
                        {/* Customer/Order Name & Status */}
                        <Box sx={{ width: '45%' }}>
                          <Typography 
                            variant="body2" 
                            component="div" // 'p' yerine 'div' kullan
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.8rem', 
                              display: 'flex', 
                              alignItems: 'center' 
                            }}
                          >
                            {isOrder ? (
                              <LocalShippingIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: statusColor }} />
                            ) : (
                              <PersonIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                            )}
                            {customer.name}
                            {isOrder && customer.orderId && (
                              <Typography 
                                component="span" // 'caption' yerine 'span' kullan
                                variant="caption" 
                                sx={{ ml: 1, color: 'text.secondary', fontSize: '0.65rem' }}
                              >
                                (#{customer.orderId})
                              </Typography>
                            )}
                            {isOrder && (
                              <Chip 
                                label={normalizedStatus.toUpperCase()}
                                size="small"
                                color={normalizedStatus === 'completed' ? 'success' : 'warning'}
                                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary', 
                            fontSize: '0.65rem', 
                            display: 'block', 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap',
                            pl: 2.2 
                          }}>
                            {customer.address || "No address available"}
                          </Typography>
                        </Box>
                        <Box sx={{ height: '24px', borderRight: '1px solid #e0e0e0', mx: 1 }}></Box>
                        
                        {/* Amount */}
                        <Box sx={{ width: '20%', textAlign: "right" }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                            {customer.demand} {isOrder ? 'kg' : 'adet'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                );
              })
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No customers or orders found matching your filters.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearFilters} 
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </List>
        )}
      </Box>
      {/* Müşteri Detay Modalı */}
      <Dialog
        open={detailModalOpen}
        onClose={closeDetailModal}
        maxWidth="sm"
        fullWidth
      >
        {currentCustomer && (
          <>
            <DialogTitle 
              component="div" 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',  
                borderBottom: `3px solid ${statusColors[(currentCustomer.status || '').toLowerCase()] || "#999"}`, 
                py: 1.5 
              }}
            >
              <Typography variant="h6" component="span">
                {currentCustomer.isOrder || currentCustomer.type === 'order' ? 'Order Details' : 'Customer Details'}
              </Typography>
              <Chip 
                label={(currentCustomer.status || '').toUpperCase()} 
                size="small" 
                sx={{ 
                  backgroundColor: statusColors[(currentCustomer.status || '').toLowerCase()] || "#999", 
                  color: "#fff", 
                  fontWeight: 600, 
                  fontSize: '0.7rem' 
                }} 
              />
            </DialogTitle>
            <DialogContent sx={{ mt: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                {currentCustomer.isOrder || currentCustomer.type === 'order' ? (
                  <LocalShippingIcon sx={{ mr: 1 }} />
                ) : (
                  <PersonIcon sx={{ mr: 1 }} />
                )}
                {currentCustomer.name}
                {currentCustomer.orderId && (
                  <Typography variant="caption" sx={{ ml: 1 }}>({currentCustomer.orderId})</Typography>
                )}
              </Typography>
              
              <Grid container spacing={1.5}>
                {(currentCustomer.isOrder || currentCustomer.type === 'order') ? (
                  // Order specific fields
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>🧑‍🤝‍🧑 Customer ID:</strong> {currentCustomer.customerId || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>🔖 Task ID:</strong> {currentCustomer.taskId || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Product:</strong> {currentCustomer.product || "Unknown"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>💰 Price:</strong> {currentCustomer.price || "0"} TL</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Quantity:</strong> {currentCustomer.quantity || "0"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>⚖️ Demand:</strong> {currentCustomer.demand || "0"} kg</Typography>
                    </Grid>
                    {/* Order Details */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                        Order Details
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2"><strong>Order ID:</strong> {currentCustomer.orderId}</Typography>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2"><strong>Ready Time:</strong> {currentCustomer.readyTime || "Not set"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2"><strong>Due Date:</strong> {currentCustomer.dueDate || "Not set"}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2"><strong>Service Duration:</strong> {currentCustomer.serviceTime || 0} minutes</Typography>
                          </Grid>
                        </Grid>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Product:</strong> {currentCustomer.product} ({currentCustomer.productId})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Quantity:</strong> {currentCustomer.quantity} units ({currentCustomer.demand} kg)
                        </Typography>
                        <Typography variant="body2"><strong>Price:</strong> {currentCustomer.price} TL</Typography>
                        {currentCustomer.notes && (
                          <Typography variant="body2"><strong>Notes:</strong> {currentCustomer.notes}</Typography>
                        )}
                      </Box>
                    </Grid>
                  </>
                ) : (
                  // Customer specific fields
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Brand:</strong> {currentCustomer.brand}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Demand:</strong> {currentCustomer.demand} adet</Typography>
                    </Grid>
                  </>
                )}
                {/* Common fields */}
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📆 Date:</strong> {currentCustomer.orderDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>⏱️ Time Window:</strong> {currentCustomer.timeWindow || "Any time"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📍 Address:</strong></Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', pl: 1, color: 'text.secondary', wordBreak: 'break-word' }}>
                    {currentCustomer.address || "No address available"}
                  </Typography>
                </Grid>
                {currentCustomer.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📝 Notes:</strong> {currentCustomer.notes}</Typography>
                  </Grid>
                )}
                {/* Debug info */}
                {debugMode && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f8ff', borderRadius: 1, fontSize: '0.7rem' }}>
                      <Typography variant="subtitle2">Debug Info:</Typography>
                      <Typography variant="caption" display="block">
                        ID: {currentCustomer.id}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Type: {currentCustomer.type || 'unknown'}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Status: "{currentCustomer.status}" (normalized: "{(currentCustomer.status || '').toLowerCase()}")
                      </Typography>
                      <Typography variant="caption" display="block">
                        Is Order: {(currentCustomer.isOrder || currentCustomer.type === 'order') ? 'true' : 'false'}
                      </Typography>
                      {currentCustomer._originalStatus !== undefined && (
                        <Typography variant="caption" display="block">
                          Original Status: "{currentCustomer._originalStatus}"
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailModal} size="small">Close</Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => { handleCustomerSelect(currentCustomer.id); closeDetailModal(); }}
              >
                {selectedCustomers.includes(currentCustomer.id) ? "Deselect" : "Select"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ESOGU Task Selection Modal */}
      <Dialog
        open={openEsoguModal}
        onClose={handleCloseEsoguModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select ESOGU Task Data
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Available Tasks</Typography>
            
            {/* Clustered Tasks */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Clustered Tasks (C)
              </Typography>
              <Grid container spacing={1}>
                {['C05', 'C10', 'C20', 'C40', 'C60'].map((task) => (
                  <Grid item xs={4} key={task}>
                    <Button
                      variant={selectedTask === task ? "contained" : "outlined"}
                      size="small"
                      fullWidth
                      onClick={() => handleTaskSelection({ target: { value: task } })}
                      sx={{ borderRadius: 2 }}
                    >
                      {task}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Random Tasks */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Random Tasks (R)
              </Typography>
              <Grid container spacing={1}>
                {['R05', 'R10', 'R20', 'R40', 'R60'].map((task) => (
                  <Grid item xs={4} key={task}>
                    <Button
                      variant={selectedTask === task ? "contained" : "outlined"}
                      size="small"
                      fullWidth
                      onClick={() => handleTaskSelection({ target: { value: task } })}
                      sx={{ borderRadius: 2 }}
                    >
                      {task}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Random-Clustered Tasks */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Random-Clustered Tasks (RC)
              </Typography>
              <Grid container spacing={1}>
                {['RC05', 'RC10', 'RC20', 'RC40', 'RC60'].map((task) => (
                  <Grid item xs={4} key={task}>
                    <Button
                      variant={selectedTask === task ? "contained" : "outlined"}
                      size="small"
                      fullWidth
                      onClick={() => handleTaskSelection({ target: { value: task } })}
                      sx={{ borderRadius: 2 }}
                    >
                      {task}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </FormControl>
          
          {taskError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {taskError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEsoguModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTaskConfirm}
            disabled={isLoading || !selectedTask}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Modal, Customer Modal, ESOGU Task Selection Modal - Unchanged */}
      {/* ...existing code... */}
    </Card>
  );
}