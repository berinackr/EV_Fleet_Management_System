export async function parseRouteXmlFile(filePath = "parse-routes") {
  try {
    console.log("📂 Fetching XML file from:", filePath);
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    const text = await response.text();
    console.log("📄 Fetched XML content:", text.slice(0, 200), "..."); // İlk 200 karakteri logla

    // DOMParser ile XML'i parse et
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    // Rotayı çözümle
    const routes = Array.from(xmlDoc.querySelectorAll("Route4Plan > Solution > Routes > Route"));
    console.log("🔍 Found routes:", routes.length);

    const parsed = routes.map((route) => {
      const rawVehicleId = route.getAttribute("VehicleId");
      const vehicleId = rawVehicleId; // Orijinal VehicleId'yi kullan
      const routeId = route.getAttribute("RouteId");

      const nodes = Array.from(route.querySelectorAll("Nodes > Node"));
      console.log(`🚗 Vehicle ${vehicleId} has ${nodes.length} stops.`);

      const waypoints = [];
      const stops = [];

      nodes.forEach((node) => {
        const nodeId = node.getAttribute("NodeId");
        const lat = parseFloat(node.querySelector("Location > Latitude")?.textContent);
        const lon = parseFloat(node.querySelector("Location > Longitude")?.textContent);

        if (!isNaN(lat) && !isNaN(lon)) {
          waypoints.push({ lat, lon });
        }

        if (nodeId && lat && lon) {
          stops.push({
            nodeId,
            lat,
            lon,
            completed: false, // Tamamlama durumu
          });
        }
      });

      return {
        vehicleId,
        routeId,
        waypoints,
        stops,
      };
    });

    console.log("✅ Parsed routes:", parsed);
    return parsed;
  } catch (error) {
    console.error("❌ Error in parseRouteXmlFile:", error);
    throw error;
  }
}