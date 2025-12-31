import React, { useState } from "react";
import {
  Box, Grid, Typography, Paper, TextField, Button, Stack,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";

const QuickDateSelector = ({ onSelect }) => {
  const today = dayjs();

  return (
    <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
      <Button variant="outlined" onClick={() => {
        const yesterday = today.subtract(1, "day");
        onSelect(yesterday.startOf("day").valueOf(), yesterday.endOf("day").valueOf());
      }}>
        Yesterday
      </Button>
      <Button variant="outlined" onClick={() => onSelect(today.startOf('day').valueOf(), today.endOf('day').valueOf())}>
        Today
      </Button>
      <Button variant="outlined" onClick={() => onSelect(today.subtract(7, 'day').startOf('day').valueOf(), today.endOf('day').valueOf())}>
        Last 7 Days
      </Button>
      <Button variant="outlined" onClick={() => onSelect(today.subtract(1, 'month').startOf('month').valueOf(), today.subtract(1, 'month').endOf('month').valueOf())}>
        Last Month
      </Button>
      <Button variant="outlined" onClick={() => onSelect(today.startOf('month').valueOf(), today.endOf('month').valueOf())}>
        This Month
      </Button>
      <Button variant="outlined" onClick={() => onSelect(today.startOf('year').valueOf(), today.endOf('year').valueOf())}>
        This Year
      </Button>
    </Stack>
  );
};

const Performans = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [from, setFrom] = useState('now-7d');
  const [to, setTo] = useState('now');

  const handleApply = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    const fromTimestamp = dayjs(startDate).valueOf();
    const toTimestamp = dayjs(endDate).valueOf();
    setFrom(fromTimestamp);
    setTo(toTimestamp);
  };

  const genelSiparisBase = "http://localhost:3004/d-solo/eejs504x4su80e/genel-siparis-raporu";
  const aracPerformansBase = "http://localhost:3004/d-solo/fek7e5xanxd6oa/arac-performans-raporu";

  return (
    <Box sx={{ p: 3 }}>
      {/* Sticky Date Controls */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
          pt: 1,
          mb: 3,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {/* Quick Date Selector Buttons */}
        <QuickDateSelector
          onSelect={(fromTimestamp, toTimestamp) => {
            setFrom(fromTimestamp);
            setTo(toTimestamp);
          }}
        />

        {/* Manual Date Selection */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={{ mt: 1 }}
        >
          <TextField
            label="Start Date"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Box>

      {/* Accordion ve diğer içerikler burada devam edecek */}
      {/* Vehicle Performance Report en alta taşındı */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>General Order Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Order Status Distribution - Pie */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`${genelSiparisBase}?orgId=1&from=${from}&to=${to}&theme=light&panelId=1`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Order Status Distribution"
                ></iframe>
              </Paper>
            </Grid>

            {/* Sayısal kutular (Toplam, İptal, Teslim) */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[2, 4, 3].map((panelId) => (
                  <Grid item xs={12} md={4} key={panelId}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <iframe
                        src={`${genelSiparisBase}?orgId=1&from=${from}&to=${to}&theme=light&panelId=${panelId}`}
                        width="100%"
                        height="120"
                        frameBorder="0"
                        title={`Counter ${panelId}`}
                      ></iframe>
                    </Paper>
                  </Grid>
                ))}

                {/* Average Delivery Time */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <iframe
                      src={`${genelSiparisBase}?orgId=1&from=${from}&to=${to}&theme=light&panelId=5`}
                      width="100%"
                      height="130"
                      frameBorder="0"
                      title="Average Delivery Time"
                    ></iframe>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Delivery Time Comparison */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`${genelSiparisBase}?orgId=1&from=${from}&to=${to}&theme=light&panelId=7`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Delivery Time Comparison"
                ></iframe>
              </Paper>
            </Grid>

            {/* Daily Orders */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`${genelSiparisBase}?orgId=1&from=${from}&to=${to}&theme=light&panelId=8`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Number of Daily Orders"
                ></iframe>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Charging Station Usage Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/aejxca3r7v280c/charging-stations-usage-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Charging Panel 1"
                ></iframe>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/aejxca3r7v280c/charging-stations-usage-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Charging Panel 2"
                ></iframe>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/aejxca3r7v280c/charging-stations-usage-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=3&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Charging Panel 3"
                ></iframe>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/aejxca3r7v280c/charging-stations-usage-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=5&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Charging Panel 5"
                ></iframe>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/aejxca3r7v280c/charging-stations-usage-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=6&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Charging Panel 6"
                ></iframe>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>



 

 


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >Planned vs Actual Route Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Panel 2 */}
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/beki8gryued4wd/planned-vs-actual-route-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Planned vs Actual Route Panel 2"
              ></iframe>
            </Grid>

            {/* Panel 1 */}
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/beki8gryued4wd/planned-vs-actual-route-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Planned vs Actual Route Panel 1"
              ></iframe>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >Algorithm Performance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Pie Chart (Panel 3) - ENİ KÜÇÜK */}
            <Grid item xs={12} md={4}>
              <iframe
                src={`http://localhost:3004/d-solo/dekndymh54ydcd/algorithm-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&showCategory=Standard%20options&theme=light&panelId=3&__feature.dashboardSceneSolo`}
                width="100%"
                height="620"
                frameBorder="0"
                title="Algorithm Pie Chart"
              ></iframe>
            </Grid>

            {/* Sağdaki 2 grafik - ENİ BÜYÜK, BOYU ARTTI */}
            <Grid item xs={12} md={8}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <iframe
                    src={`http://localhost:3004/d-solo/dekndymh54ydcd/algorithm-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&showCategory=Standard%20options&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="310"
                    frameBorder="0"
                    title="Optimization Time Table"
                  ></iframe>
                </Grid>
                <Grid item>
                  <iframe
                    src={`http://localhost:3004/d-solo/dekndymh54ydcd/algorithm-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&showCategory=Standard%20options&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="310"
                    frameBorder="0"
                    title="Route Accuracy Table"
                  ></iframe>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >Carbon Gain Analysis Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <iframe
src={`http://localhost:3004/d-solo/aekkjtimikb9ca/carbon-gain-analysis-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
width={`100%`}
      height={`500`}
      frameBorder={`0`}
    ></iframe>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >Vehicle Maintenance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/deki0yl09mlmoc/vehicle-maintenance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Maintenance Panel 2"
              ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/deki0yl09mlmoc/vehicle-maintenance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Maintenance Panel 1"
              ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/deki0yl09mlmoc/vehicle-maintenance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=4&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Maintenance Panel 4"
              ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
                src={`http://localhost:3004/d-solo/deki0yl09mlmoc/vehicle-maintenance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=3&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Maintenance Panel 3"
              ></iframe>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>




      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Driver Performance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>

            {/* Panel 8 - En üste alındı ve Grid içine kondu */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mb={2}>
                <iframe
                  src="http://localhost:3004/d-solo/aelccqouqa328a/driver-performance-report?orgId=1&from=1745965376745&to=1748557376745&timezone=browser&showCategory=Value%20mappings&theme=light&panelId=8&__feature.dashboardSceneSolo"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  title="Driver Performance Panel 8"
                ></iframe>
              </Box>
            </Grid>

            {/* 5 SAYISAL PANEL */}
            {[1, 2, 3, 4, 5].map((panelId) => (
              <Grid item xs={12} md={2.4} key={panelId}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <iframe
                    src={`http://localhost:3004/d-solo/aelccqouqa328a/driver-performance-report?orgId=1&from=${from}&to=${to}&theme=light&panelId=${panelId}&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="180"
                    frameBorder="0"
                    title={`Metric Panel ${panelId}`}
                  ></iframe>
                </Paper>
              </Grid>
            ))}

            {/* 2 GRAFİK PANEL */}
            {[6, 7].map((panelId) => (
              <Grid item xs={12} md={6} key={panelId}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <iframe
                    src={`http://localhost:3004/d-solo/aelccqouqa328a/driver-performance-report?orgId=1&from=${from}&to=${to}&theme=light&panelId=${panelId}&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title={`Graph Panel ${panelId}`}
                  ></iframe>
                </Paper>
              </Grid>
            ))}

          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Driver Success Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>

            {[1, 2, 3, 4].map((panelId) => (
              <Grid item xs={12} md={6} key={panelId}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <iframe
                    src={`http://localhost:3004/d-solo/felcbt28ov4e8e/driver-success-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=${panelId}&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title={`Driver Success Panel ${panelId}`}
                  ></iframe>
                </Paper>
              </Grid>
            ))}

          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Customer Based Order Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((panelId) => (
              <Grid item xs={12} md={6} key={panelId}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <iframe
                    src={`http://localhost:3004/d-solo/eelcexgi55ddsb/customer-based-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=${panelId}&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title={`Customer Panel ${panelId}`}
                  ></iframe>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
     <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >System Warning Log Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <iframe
src={`http://localhost:3004/d-solo/fekkelv928hdsd/system-warning-log-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
width="100%"
          height="400"
          frameBorder="0"
        ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
src={`http://localhost:3004/d-solo/fekkelv928hdsd/system-warning-log-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
width="100%"
          height="400"
          frameBorder="0"
        ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
src={`http://localhost:3004/d-solo/fekkelv928hdsd/system-warning-log-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=3&__feature.dashboardSceneSolo`}
width="100%"
          height="400"
          frameBorder="0"
        ></iframe>
            </Grid>
            <Grid item xs={12} md={6}>
              <iframe
src={`http://localhost:3004/d-solo/fekkelv928hdsd/system-warning-log-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=4&__feature.dashboardSceneSolo`}
width="100%"
          height="400"
          frameBorder="0"
        ></iframe>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
     <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>System Performance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Response Time - Panel 3 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/eelb1xox7r5kwe/system-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=3&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Response Time"
                ></iframe>
              </Paper>
            </Grid>

            {/* CPU Usage - Panel 2 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/eelb1xox7r5kwe/system-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="CPU Usage"
                ></iframe>
              </Paper>
            </Grid>

            {/* Memory Usage - Panel 1 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/eelb1xox7r5kwe/system-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Memory Usage"
                ></iframe>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>



      {/* Fleet Operation Performance Report sondan 2. sırada, Accordion etiketi eksikti, düzeltildi */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Fleet Operation Performance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Panel 5 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/cekks5c4p2rcwf/fleet-operations-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=5&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Fleet Operation Panel 5"
                ></iframe>
              </Paper>
            </Grid>

            {/* Panel 1 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/cekks5c4p2rcwf/fleet-operations-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Fleet Operation Panel 1"
                ></iframe>
              </Paper>
            </Grid>

            {/* Panel 2 */}
          {/*  <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/cekks5c4p2rcwf/fleet-operations-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=2&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Fleet Operation Panel 2"
                ></iframe>
              </Paper>
            </Grid>
*/}
            {/* Panel 3 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/cekks5c4p2rcwf/fleet-operations-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=3&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Fleet Operation Panel 3"
                ></iframe>
              </Paper>
            </Grid>

            {/* Panel 4 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <iframe
                  src={`http://localhost:3004/d-solo/cekks5c4p2rcwf/fleet-operations-performance-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=4&__feature.dashboardSceneSolo`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Fleet Operation Panel 4"
                ></iframe>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {/* Vehicle Comparison Report sondan 3. sırada */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography >Vehicle Comparison Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <iframe
                src={`http://localhost:3004/d-solo/ceki5p04rm5fke/vehicle-comparison-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=4&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Comparison Panel 4"
              ></iframe>
            </Grid>
            
          {/*  <Grid item xs={12} md={12}>
              <iframe
                src={`http://localhost:3004/d-solo/ceki5p04rm5fke/vehicle-comparison-report?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo`}
                width="100%"
                height="400"
                frameBorder="0"
                title="Vehicle Comparison Panel 1"
              ></iframe>
            </Grid>*/}
          </Grid>
        </AccordionDetails>
      </Accordion>
      {/* Vehicle Performance Report en altta */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Vehicle Performance Report</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[1, 4, 5, 2].map((panelId) => (
              <Grid item xs={12} md={6} key={panelId}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <iframe
                    src={`${aracPerformansBase}?orgId=1&from=${from}&to=${to}&timezone=browser&theme=light&panelId=${panelId}&__feature.dashboardSceneSolo`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title={`Vehicle Performance Panel ${panelId}`}
                  ></iframe>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Performans;