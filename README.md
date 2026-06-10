Project Proposal: Low-Cost Community Air Quality Monitoring Network (AQMN)
Target Institution: MIT Undergraduate Admissions / Passion Project Portfolio
Focus Areas: Embedded Systems, Internet of Things (IoT), Environmental Justice, Full-Stack Web Development

1. Executive Summary & Problem Statement
Air pollution disproportionately impacts low-income and marginalized communities, which are frequently situated near industrial zones, high-traffic freight corridors, or waste facilities. Despite this vulnerability, these regions often suffer from "data deserts"—lacking the regulatory-grade air quality monitoring stations maintained by government agencies due to the prohibitive cost of equipment (often exceeding $20,000 per station).
This project aims to bridge the environmental data gap by developing and deploying an open-source, ultra-low-cost, mesh-capable Breathed Environment Assessment Community Outreach Network (BEACON). By utilizing off-the-shelf microcontrollers and optical sensors, this initiative democratizes environmental data, equipping local residents with real-time, actionable insights into their physical environment.
2. System Architecture
The system is split into three core layers: the Edge Hardware Layer (sensor nodes), the Transport & Backend Layer (data ingestion and storage), and the Application Layer (public dashboard).
2.1 Edge Hardware Architecture
Each sensor node is designed to operate autonomously, weather-resistant, and with minimal power draw. The node evaluates Particulate Matter (PM2.5 and PM10), relative humidity, and temperature.
Component
Selection
Technical Justification
Microcontroller (MCU)
ESP32-WROOM-32E
Dual-core processor, integrated Wi-Fi/Bluetooth, robust Deep Sleep modes (micro-amp draw) for solar viability, and low unit cost (~$4).
PM2.5 / PM10 Sensor
Plantower PMS5003
Laser scattering principle. High correlation (R² > 0.85) with regulatory monitors when calibrated for humidity; built-in fan for active air sampling.
Climate Sensor
Sensirion SHT31-D
High-accuracy temperature (±0.2°C) and humidity (±2%) sensor. Crucial for algorithmic correction of PM data (hygroscopic growth adjustment).
Enclosure
Custom 3D-Printed Louvered Stevenson Screen
PETG material for UV resistance; louvered design ensures natural aspiration/airflow while protecting electronics from direct solar radiation and rain.

2.2 Software & Data Pipeline
Firmware: Developed in C++ via VS Code / PlatformIO. Features a state machine utilizing non-blocking cycles: Wake → Aspirate Chamber (30s) → Sample → Connect to Local Network → Transmit Data → Deep Sleep (10-minute interval).
Data Ingestion: Light-weight MQTT protocol routing payloads to an Eclipse Mosquitto broker, minimizing cellular/Wi-Fi data overhead.
Database Layer: Time-series database optimized for rapid append operations and timestamp queries (e.g., InfluxDB or PostgreSQL with TimescaleDB).
2.3 Frontend Dashboard & Public UI
Mapping Stack: A React-based web application leveraging Mapbox GL JS or Leaflet to render geographic heatmaps of real-time air quality.
Data Visualization: D3.js or Chart.js integration to render historical multi-axis charts, allowing users to cross-reference PM2.5 spikes with temporal patterns (e.g., rush hour traffic, industrial shift changes).
3. Engineering Challenges & MIT-Level Research Directions
To differentiate this project from standard hobbyist kits, the implementation addresses several complex real-world engineering issues:
Hygroscopic Growth Correction: Low-cost optical counters confuse high water vapor molecules (humidity) with solid dust particles, artificially bloating AQI scores. I will implement a calibration curve algorithm (like the κ-Köhler theory approximation) directly into the backend data pipeline to dynamically normalize PM readings based on live humidity data.
Network Resilience in Impoverished Areas: Target areas often have unstable Wi-Fi. The firmware will include an offline flash-storage routine using the ESP32’s non-volatile storage (NVS) or an external micro-SD module. If connection drops, data points stack locally and bulk-upload upon network reconnection to preserve data integrity.
Sensor Drift & Cross-Calibration: Over time, laser diodes degrade. The network will use a software-defined "Relative Calibration" routine, algorithms that analyze spatial correlations among neighbor nodes to auto-detect and flag an individual sensor experiencing mechanical drift.
4. Execution Phases & Project Timeline
Phase 1: Breadboard Prototyping (Weeks 1-3) – Interface PMS5003 and SHT31 with the ESP32. Establish stable I2C/UART serial communications. Write baseline firmware to read sensor state arrays.
Phase 2: Backend Deployment (Weeks 4-6) – Stand up cloud VM instance. Configure MQTT broker and map database schema. Ensure payload end-to-end latency is under 2 seconds.
Phase 3: Enclosure & Power Testing (Weeks 7-9) – Design and print the physical enclosure. Conduct environmental chamber stress tests (using simulated high heat/moisture) to ensure passive airflow is sufficient and electronic components do not overheat.
Phase 4: Dashboard Coding & Alpha Launch (Weeks 10-12) – Code web dashboard, implement geospatial mapping API, and host open-source hardware files on a public GitHub repository. Deploy a localized 3-node pilot network to stress test live infrastructure.

