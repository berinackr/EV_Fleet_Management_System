import React, { useState, useEffect } from "react";
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField, IconButton, 
  Chip, Avatar, Divider, Paper, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, FormControl, InputLabel, Select, MenuItem, Tab, Tabs,
  LinearProgress, CircularProgress, Badge, Tooltip, Switch, List, ListItem
} from "@mui/material";
import { styled, keyframes } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CircleIcon from '@mui/icons-material/Circle';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';

// Status color mapping
const statusColors = {
  "requested": "#FFC107",
  "on the way": "#2196F3",
  "delivered": "#4CAF50",
  "cancelled": "#F44336",
  "completed": "#4CAF50",
  "waiting": "#FFC107",
  "pending": "#9E9E9E",
  "processing": "#2196F3",
  "returned": "#F44336"
};

// Animation for blinking effect
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const BlinkingCircle = styled(CircleIcon)(({ status }) => ({
  color: statusColors[(status || '').toLowerCase()] || "#999",
  fontSize: "1.1rem",
  animation: (status || '').toLowerCase() === "waiting" || (status || '').toLowerCase() === "requested" ? 
    `${blink} 1.32s infinite` : "none",
}));

// Sample order data
const ordersData = [
  {
    id: "ORD-20240101",
    customer: {
      name: "Ahmet Y.",
      id: "CUST-001",
      address: "Bağcılar, İstanbul",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    vehicle: "musoshi001",
    products: [
      { name: "Laptop", quantity: 2, weight: 5 },
      { name: "Monitor", quantity: 1, weight: 7 }
    ],
    totalWeight: 17,
    status: "delivered",
    priority: "high",
    orderDate: "2024-01-01",
    deliveryDate: "2024-01-03",
    timeWindow: "09:00-12:00",
    notes: "Leave with neighbor if not home",
    payment: {
      method: "Credit Card",
      amount: 7500,
      status: "paid"
    },
    tracking: [
      { status: "requested", time: "2024-01-01 09:15", note: "Order placed" },
      { status: "processing", time: "2024-01-01 10:30", note: "Order confirmed" },
      { status: "on the way", time: "2024-01-03 08:45", note: "Out for delivery" },
      { status: "delivered", time: "2024-01-03 11:20", note: "Delivered to customer" }
    ]
  },
  {
    id: "ORD-20240105",
    customer: {
      name: "Zeynep D.",
      id: "CUST-002",
      address: "Kadıköy, İstanbul",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    vehicle: "musoshi003",
    products: [
      { name: "Smartphone", quantity: 1, weight: 0.5 },
      { name: "Tablet", quantity: 1, weight: 1 },
      { name: "Headphones", quantity: 2, weight: 0.6 }
    ],
    totalWeight: 2.1,
    status: "on the way",
    priority: "medium",
    orderDate: "2024-01-05",
    deliveryDate: "2024-01-07",
    timeWindow: "13:00-17:00",
    notes: "",
    payment: {
      method: "Online",
      amount: 3200,
      status: "paid"
    },
    tracking: [
      { status: "requested", time: "2024-01-05 14:22", note: "Order placed" },
      { status: "processing", time: "2024-01-05 15:45", note: "Order confirmed" },
      { status: "on the way", time: "2024-01-07 12:30", note: "Out for delivery" }
    ]
  },
  {
    id: "ORD-20240110",
    customer: {
      name: "Mehmet K.",
      id: "CUST-003",
      address: "Beylikdüzü, İstanbul",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    vehicle: "musoshi004",
    products: [
      { name: "Office Chair", quantity: 1, weight: 15 },
      { name: "Desk", quantity: 1, weight: 35 }
    ],
    totalWeight: 50,
    status: "waiting",
    priority: "high",
    orderDate: "2024-01-10",
    deliveryDate: "2024-01-12",
    timeWindow: "10:00-14:00",
    notes: "Building has elevator",
    payment: {
      method: "Cash on Delivery",
      amount: 4800,
      status: "pending"
    },
    tracking: [
      { status: "requested", time: "2024-01-10 10:05", note: "Order placed" },
      { status: "waiting", time: "2024-01-10 11:30", note: "Waiting for confirmation" }
    ]
  },
  {
    id: "ORD-20240115",
    customer: {
      name: "Ayşe Y.",
      id: "CUST-004",
      address: "Şişli, İstanbul",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    vehicle: "musoshi005",
    products: [
      { name: "Refrigerator", quantity: 1, weight: 70 }
    ],
    totalWeight: 70,
    status: "completed",
    priority: "medium",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-17",
    timeWindow: "12:00-16:00",
    notes: "Call before delivery",
    payment: {
      method: "Credit Card",
      amount: 9500,
      status: "paid"
    },
    tracking: [
      { status: "requested", time: "2024-01-15 09:35", note: "Order placed" },
      { status: "processing", time: "2024-01-15 10:40", note: "Order confirmed" },
      { status: "on the way", time: "2024-01-17 11:15", note: "Out for delivery" },
      { status: "delivered", time: "2024-01-17 14:50", note: "Delivered to customer" },
      { status: "completed", time: "2024-01-17 19:20", note: "Order completed" }
    ]
  },
  {
    id: "ORD-20240120",
    customer: {
      name: "Ali S.",
      id: "CUST-005",
      address: "Ataşehir, İstanbul",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg"
    },
    vehicle: "musoshi001",
    products: [
      { name: "TV", quantity: 1, weight: 25 },
      { name: "Sound System", quantity: 1, weight: 12 }
    ],
    totalWeight: 37,
    status: "cancelled",
    priority: "low",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-22",
    timeWindow: "09:00-18:00",
    notes: "Customer cancelled due to change of plans",
    payment: {
      method: "Credit Card",
      amount: 6800,
      status: "refunded"
    },
    tracking: [
      { status: "requested", time: "2024-01-20 16:10", note: "Order placed" },
      { status: "processing", time: "2024-01-20 17:25", note: "Order confirmed" },
      { status: "cancelled", time: "2024-01-21 09:15", note: "Order cancelled by customer" }
    ]
  },
  {
    id: "ORD-20240125",
    customer: {
      name: "Fatma O.",
      id: "CUST-006",
      address: "Beşiktaş, İstanbul",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg"
    },
    vehicle: "musoshi006",
    products: [
      { name: "Sofa", quantity: 1, weight: 85 },
      { name: "Coffee Table", quantity: 1, weight: 20 }
    ],
    totalWeight: 105,
    status: "requested",
    priority: "high",
    orderDate: "2024-01-25",
    deliveryDate: "2024-01-28",
    timeWindow: "10:00-15:00",
    notes: "",
    payment: {
      method: "Bank Transfer",
      amount: 12500,
      status: "pending"
    },
    tracking: [
      { status: "requested", time: "2024-01-25 11:05", note: "Order placed" }
    ]
  },
  {
    id: "ORD-20240130",
    customer: {
      name: "Emre C.",
      id: "CUST-007",
      address: "Üsküdar, İstanbul",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg"
    },
    vehicle: "musoshi007",
    products: [
      { name: "Washing Machine", quantity: 1, weight: 65 },
      { name: "Dryer", quantity: 1, weight: 55 }
    ],
    totalWeight: 120,
    status: "processing",
    priority: "medium",
    orderDate: "2024-01-30",
    deliveryDate: "2024-02-02",
    timeWindow: "14:00-18:00",
    notes: "Heavy items, need two delivery personnel",
    payment: {
      method: "Credit Card",
      amount: 11300,
      status: "paid"
    },
    tracking: [
      { status: "requested", time: "2024-01-30 13:45", note: "Order placed" },
      { status: "processing", time: "2024-01-30 15:20", note: "Order confirmed, processing" }
    ]
  }
];

// Function to get time window category
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

// Priority color mapping
const priorityColors = {
  "high": "#f44336",
  "medium": "#ff9800",
  "low": "#4caf50"
};

// Order card component
const OrderCard = ({ order, onViewDetails }) => {
  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderLeft: `4px solid ${statusColors[order.status.toLowerCase()] || "#999"}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BlinkingCircle status={order.status} sx={{ mr: 1 }} />
          <Chip 
            label={order.status.toUpperCase()} 
            size="small" 
            sx={{ 
              backgroundColor: statusColors[order.status.toLowerCase()] || "#999",
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem'
            }} 
          />
          {order.priority && (
            <Tooltip title={`Priority: ${order.priority}`}>
              <Box 
                component="span" 
                sx={{ 
                  ml: 1, 
                  display: 'flex', 
                  alignItems: 'center'
                }}
              >
                <PriorityHighIcon 
                  sx={{ 
                    color: priorityColors[order.priority], 
                    fontSize: '1.2rem',
                    animation: order.priority === 'high' ? `${blink} 2s infinite` : 'none'
                  }} 
                />
              </Box>
            </Tooltip>
          )}
        </Box>
        <Box>
          <IconButton size="small" onClick={() => onViewDetails(order)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            {order.id}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {order.vehicle}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar src={order.customer.avatar} sx={{ width: 32, height: 32, mr: 1.5 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {order.customer.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {order.customer.id}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {order.customer.address}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {order.deliveryDate}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {order.timeWindow || "Any time"}
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {order.products.length} {order.products.length > 1 ? 'items' : 'item'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {order.totalWeight} kg
            </Typography>
          </Box>
          <Box sx={{ mt: 0.5 }}>
            {order.products.slice(0, 2).map((product, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  x{product.quantity}
                </Typography>
              </Box>
            ))}
            {order.products.length > 2 && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', fontStyle: 'italic' }}>
                + {order.products.length - 2} more...
              </Typography>
            )}
          </Box>
        </Paper>
      </CardContent>
      
      <Box sx={{ p: 1.5, pt: 0.5, borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {order.payment.method}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            ₺{order.payment.amount.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// Timeline component for order tracking
const OrderTimeline = ({ events }) => {
  if (!events || events.length === 0) return null;
  
  return (
    <Box sx={{ py: 1 }}>
      {events.map((event, index) => (
        <Box 
          key={index}
          sx={{ 
            display: 'flex', 
            mb: index < events.length - 1 ? 2 : 0,
            position: 'relative'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mr: 2,
            position: 'relative',
            zIndex: 1
          }}>
            <CircleIcon 
              sx={{ 
                color: statusColors[event.status.toLowerCase()] || '#999',
                fontSize: '1rem'
              }} 
            />
            {index < events.length - 1 && (
              <Box sx={{ 
                height: '100%', 
                width: '2px', 
                backgroundColor: '#e0e0e0',
                position: 'absolute',
                top: '10px',
                bottom: '-10px',
                zIndex: 0
              }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {event.time}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {event.note}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Main Orders component
const Orders = () => {
  // State
  const [orders, setOrders] = useState(ordersData);
  const [filteredOrders, setFilteredOrders] = useState(ordersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    priority: '',
    timeWindow: '',
    minWeight: '',
    maxWeight: ''
  });

  // Count orders by status
  const orderCounts = React.useMemo(() => {
    const counts = { all: orders.length };
    orders.forEach(order => {
      const status = order.status.toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Handle search and filtering
  useEffect(() => {
    let result = [...orders];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.id.toLowerCase().includes(term) ||
        order.customer.address.toLowerCase().includes(term) ||
        order.vehicle.toLowerCase().includes(term) ||
        order.products.some(p => p.name.toLowerCase().includes(term))
      );
    }
    
    // Apply tab filter (status)
    if (currentTab !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === currentTab);
    }
    
    // Apply additional filters
    if (filterCriteria.status) {
      result = result.filter(order => order.status.toLowerCase() === filterCriteria.status);
    }
    
    if (filterCriteria.priority) {
      result = result.filter(order => order.priority === filterCriteria.priority);
    }
    
    if (filterCriteria.timeWindow) {
      const category = filterCriteria.timeWindow;
      result = result.filter(order => getTimeCategory(order.timeWindow) === category);
    }
    
    if (filterCriteria.minWeight) {
      const min = parseFloat(filterCriteria.minWeight);
      result = result.filter(order => order.totalWeight >= min);
    }
    
    if (filterCriteria.maxWeight) {
      const max = parseFloat(filterCriteria.maxWeight);
      result = result.filter(order => order.totalWeight <= max);
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, currentTab, filterCriteria]);

  // Handlers
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleViewDetails = (order) => {
    setCurrentOrder(order);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setCurrentOrder(null);
  };

  const handleFilterChange = (field, value) => {
    setFilterCriteria(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilterCriteria({
      status: '',
      priority: '',
      timeWindow: '',
      minWeight: '',
      maxWeight: ''
    });
    setSearchTerm('');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Random updates to orders (for demonstration)
      setOrders(prev => prev.map(order => {
        if (Math.random() > 0.7) {
          const statuses = ["requested", "processing", "on the way", "delivered", "completed"];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          return {
            ...order,
            status: randomStatus,
            tracking: [
              ...order.tracking,
              { 
                status: randomStatus, 
                time: new Date().toISOString().replace('T', ' ').substring(0, 16), 
                note: `Status updated to ${randomStatus}`
              }
            ]
          };
        }
        return order;
      }));
    }, 1000);
  };

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => ["requested", "processing", "on the way"].includes(o.status.toLowerCase())).length;
    const completed = orders.filter(o => ["delivered", "completed"].includes(o.status.toLowerCase())).length;
    const cancelled = orders.filter(o => o.status.toLowerCase() === "cancelled").length;
    
    const totalWeight = orders.reduce((sum, order) => sum + order.totalWeight, 0);
    const totalValue = orders.reduce((sum, order) => sum + order.payment.amount, 0);
    
    return { total, active, completed, cancelled, totalWeight, totalValue };
  }, [orders]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Order Management
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => alert('New order form would open here')}
          >
            New Order
          </Button>
        </Box>
        
        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                borderLeft: '4px solid #2196f3'
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                TOTAL ORDERS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.total}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2196f3'
                  }
                }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                borderLeft: '4px solid #ff9800'
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                ACTIVE ORDERS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.active}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.active / stats.total) * 100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  mt: 1,
                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff9800'
                  }
                }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                borderLeft: '4px solid #4caf50'
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                COMPLETED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.completed}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.completed / stats.total) * 100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  mt: 1,
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50'
                  }
                }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                borderLeft: '4px solid #f44336'
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                CANCELLED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.cancelled}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.cancelled / stats.total) * 100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  mt: 1,
                  bgcolor: 'rgba(244, 67, 54, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#f44336'
                  }
                }} 
              />
            </Paper>
          </Grid>
        </Grid>
        
        {/* Search and filter */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1 }}
              >
                Filters
              </Button>
              <Tooltip title="Refresh data">
                <IconButton 
                  color="primary" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          
          {/* Expanded filters */}
          {showFilters && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterCriteria.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="requested">Requested</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="on the way">On The Way</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filterCriteria.priority}
                      label="Priority"
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Min Weight"
                        type="number"
                        value={filterCriteria.minWeight}
                        onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Max Weight"
                        type="number"
                        value={filterCriteria.maxWeight}
                        onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    onClick={clearFilters} 
                    sx={{ mr: 1 }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
        
        {/* Status tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={`All (${orderCounts.all || 0})`} 
              value="all" 
            />
            <Tab 
              label={`Requested (${orderCounts.requested || 0})`} 
              value="requested" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors.requested }} />}
              iconPosition="start"
            />
            <Tab 
              label={`Processing (${orderCounts.processing || 0})`} 
              value="processing" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors.processing }} />}
              iconPosition="start"
            />
            <Tab 
              label={`On The Way (${orderCounts['on the way'] || 0})`} 
              value="on the way" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors['on the way'] }} />}
              iconPosition="start"
            />
            <Tab 
              label={`Delivered (${orderCounts.delivered || 0})`} 
              value="delivered" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors.delivered }} />}
              iconPosition="start"
            />
            <Tab 
              label={`Completed (${orderCounts.completed || 0})`} 
              value="completed" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors.completed }} />}
              iconPosition="start"
            />
            <Tab 
              label={`Cancelled (${orderCounts.cancelled || 0})`} 
              value="cancelled" 
              icon={<CircleIcon sx={{ fontSize: 12, color: statusColors.cancelled }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Box>
      
      {/* Orders grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length > 0 ? (
        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
              <OrderCard order={order} onViewDetails={handleViewDetails} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button variant="outlined" onClick={clearFilters}>Clear Filters</Button>
        </Box>
      )}
      
      {/* Order detail modal */}
      <Dialog
        open={detailModalOpen}
        onClose={closeDetailModal}
        maxWidth="md"
        fullWidth
      >
        {currentOrder && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `3px solid ${statusColors[currentOrder.status.toLowerCase()] || "#999"}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" component="span">
                  Order Details
                </Typography>
                <Typography variant="subtitle1" sx={{ display: 'block', fontWeight: 'bold' }}>
                  {currentOrder.id}
                </Typography>
              </Box>
              <Chip 
                label={currentOrder.status.toUpperCase()} 
                sx={{ 
                  backgroundColor: statusColors[currentOrder.status.toLowerCase()] || "#999",
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Order Information
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Customer
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={currentOrder.customer.avatar} sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {currentOrder.customer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {currentOrder.customer.id}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {currentOrder.customer.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Delivery Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Order Date:</strong> {currentOrder.orderDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Delivery Date:</strong> {currentOrder.deliveryDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Time Window:</strong> {currentOrder.timeWindow}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Assigned Vehicle:</strong> {currentOrder.vehicle}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Priority:</strong> 
                            <Chip 
                              size="small" 
                              label={currentOrder.priority.toUpperCase()} 
                              sx={{ 
                                ml: 1,
                                bgcolor: priorityColors[currentOrder.priority],
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Total Weight:</strong> {currentOrder.totalWeight} kg
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {currentOrder.notes && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Notes:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            {currentOrder.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Order Items
                      </Typography>
                      <List disablePadding>
                        {currentOrder.products.map((product, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 1 }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {product.name}
                              </Typography>
                              <Box>
                                <Typography variant="body2">
                                  x{product.quantity} ({product.weight} kg)
                                </Typography>
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                      
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            Payment Details
                          </Typography>
                          <Chip 
                            size="small" 
                            label={currentOrder.payment.status.toUpperCase()} 
                            color={currentOrder.payment.status === 'paid' ? 'success' : 'warning'} 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Method: {currentOrder.payment.method}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            ₺{currentOrder.payment.amount.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Order Timeline
                    </Typography>
                    <OrderTimeline events={currentOrder.tracking} />
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailModal}>Close</Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => alert(`Editing order ${currentOrder.id}`)}
                sx={{ mr: 1 }}
              >
                Edit Order
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => alert(`Updating status for order ${currentOrder.id}`)}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders;
