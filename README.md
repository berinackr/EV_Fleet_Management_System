# EV Fleet Management System
This study was conducted as part of my graduation project and represents my individual contributions within the scope of the European Union–funded project "OPEVA: Optimization of Electric Vehicle Autonomy", carried out under academic supervision. As part of my graduation project, I contributed to two modules of the system: Vehicle Tracking Module and Performance Monitoring Module, providing comprehensive solutions for efficient EV fleet management.

![Screenshot](Screenshots/vehicletracing1.png)
---

## Key Features

### Vehicle Tracking Module
- **Real-time Monitoring**: Vehicle location, speed, energy consumption, and remaining range.  
- **Battery Management**: Continuous monitoring with critical alerts.  
- **Route & Delivery Tracking**: Rota ilerleme ve şarj ihtiyacı analizi.  
- **AI-Powered Predictions**:  
  - **Segment-based energy model** (100 m segments with speed, load, slope).  
  - **CatBoost model** (R² ≈ 0.94) chosen among 23 models.  
  - **SHAP analysis** for interpretability (impact of slope, speed, mass, etc.).  
- **Alert System**: Root cause classification (vehicle, route, driver, delivery, system).  
- **Simulation Integration**: SUMO-based simulation. 
- **Leaflet Map**: Live visualization of vehicles and delivery routes.  

### Performance Monitoring Module
- **Comprehensive Analytics**: 14 reports, 50+ charts.  
- **Time-based Analysis**: Daily, weekly, monthly, yearly.  
- **Custom Filtering**: Flexible date & time filters.  
- **Grafana Dashboards**: Interactive charts, embedded via iframes.  
- **Dynamic Layouts**: Accordion-based report grouping, responsive grid system.  
- **Multi-dimensional Reports**: Vehicle, driver, route, customer, charging station, system.  

---

## Architecture

### Technology Stack
- **Backend**: Python 3.11.9, Node.js 18.20.2  
- **Frontend**: React (modern UI)  
- **Databases**:  
  - **MariaDB 11.3.2** → structured data  
  - **MongoDB** → logs & telemetry  
- **Visualization**: Grafana dashboards (Docker-based deployment)  
- **Simulation**: SUMO integration  
- **ML/Analytics**: Pandas, NumPy, CatBoost, SHAP  

### System Components
- **Processing Layer**: Energy & range prediction models (CatBoost).  
- **Storage Layer**: MariaDB + MongoDB.
- **Visualization Layer**: Grafana (iframe embedded) + Leaflet map.  
---
## Contributors

- [**Berna Çakır**](https://github.com/berinackr)  
- [**Şeyma Coştur**](https://github.com/Seymacos)  

## Screenshots

<div style="display: flex; gap: 10px; justify-content: center;">
  <img src="Screenshots/vehicletracing1.png" width="400" />
  <img src="Screenshots/grafana1.png" width="400" />
  <img src="Screenshots/grafana2.png" width="400" />
</div>
