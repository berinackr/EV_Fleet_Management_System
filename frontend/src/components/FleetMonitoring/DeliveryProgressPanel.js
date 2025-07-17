import React from "react";
import { Box, Typography, Avatar, Stack, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const getStatusColor = (status, isCurrent) => {
  if (status === "Delivered") return "#4caf50";
  if (isCurrent) return "#1976d2";
  return "#e0e0e0";
};

const DeliveryProgressPanel = ({ stops, currentIndex, onClose }) => (
  <Paper elevation={6} sx={{
    position: "fixed", left: "50%", top: "40%", transform: "translate(-50%, -50%)",
    zIndex: 2000, p: 3, minWidth: 600, maxWidth: "90vw"
  }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" mb={2}>Teslimat Süreci</Typography>
      <IconButton onClick={onClose}><CloseIcon /></IconButton>
    </Box>
    <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ overflowX: "auto" }}>
      {stops.map((stop, idx) => (
        <Box key={stop.nodeId || idx} textAlign="center" minWidth={140}>
          <Avatar
            sx={{
              bgcolor: getStatusColor(stop.status, idx === currentIndex),
              width: 48, height: 48, mx: "auto", color: "#fff"
            }}
          >
            {idx + 1}
          </Avatar>
          <Typography variant="body2" mt={1} fontWeight={600}>
            {stop.name || stop.nodeId}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {stop.status === "Delivered"
              ? "Delivered"
              : idx === currentIndex
                ? "Next"
                : "Pending"}
          </Typography>
          {/* Sipariş detayları */}
          <Box sx={{ fontSize: 12, textAlign: "left", background: "#f8f9fa", borderRadius: 2, p: 1, mt: 1 }}>
            {stop.address && (
              <div><b>Address:</b> {stop.address}</div>
            )}
            {stop.demand !== undefined && (
              <div><b>Demand:</b> {stop.demand}</div>
            )}
            {stop.serviceTime !== undefined && (
              <div><b>Service Time:</b> {stop.serviceTime} sn</div>
            )}
            {(stop.readyTime !== undefined && stop.dueDate !== undefined) && (
              <div><b>Time Range:</b> {stop.readyTime} - {stop.dueDate}</div>
            )}
            {stop.status && (
              <div><b>Status:</b> {stop.status}</div>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  </Paper>
);

export default DeliveryProgressPanel;