const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const Customer = require('../models/orderStatus');

async function parseAndSaveCustomersFromXML(xmlFilePath) {
  const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xmlData);

  const routes = result.Route4Plan.Solution.Routes.Route;
  const routeList = Array.isArray(routes) ? routes : [routes];

  for (const route of routeList) {
    const routeId = route.$.RouteId;
    const vehicleId = route.$.VehicleId;
    const nodes = route.Nodes.Node;
    const nodeList = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of nodeList) {
      if (node.$.NodeType === 'Customer') {
        // Bazı alanlar eksik olabilir, kontrol et
        const location = node.Location || {};
        const serviceInfo = node.ServiceInformation || {};
        await Customer.updateOne(
          { nodeId: node.$.NodeId },
          {
            nodeId: node.$.NodeId,
            routeId,
            vehicleId,
            status: 'On the way',
            location: {
              latitude: location.Latitude ? Number(location.Latitude) : undefined,
              longitude: location.Longitude ? Number(location.Longitude) : undefined,
              elevation: location.Elevation ? Number(location.Elevation) : undefined,
            },
            readyTime: serviceInfo.ReadyTime ? Number(serviceInfo.ReadyTime) : undefined,
            dueDate: serviceInfo.DueDate ? Number(serviceInfo.DueDate) : undefined,
            arrivalTime: serviceInfo.ArrivalTime ? Number(serviceInfo.ArrivalTime) : undefined,
            serviceTime: serviceInfo.ServiceTime ? Number(serviceInfo.ServiceTime) : undefined,
          },
          { upsert: true }
        );
      }
    }
  }
}

module.exports = { parseAndSaveCustomersFromXML };