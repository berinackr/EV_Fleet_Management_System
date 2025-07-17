const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function insertTestData() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db("RouteManagementDB");

    // List collections for verification
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));

    const collection = db.collection("route4plans");

    // First, clear existing data
    await collection.deleteMany({});
    console.log("Cleared existing data");

    // Insert complete test data based on the test_log data structure
    const testData = {
      Name: 'Test-10',
      ProblemType: 'CEVRP',
      ObjectiveFunction: 'MinDistance',
      ChargingStrategy: 'FullCharge',
      NumberOfCustomers: 10,
      BatteryCapacity: 3000,
      MaxSpeed: 12.5,
      VehicleMass: 1000,
      MaximumLoadCapacityVolume: 0,
      MaximumLoadCapacityKg: 350,
      BatteryRechargingRate: 0.18,
      EnergyConsumptionRate: 1,
      PerformanceMeasure: {
        Runtime: '0',
        StartTime: '0',
        TotalDistance: '7530.959999999999',
        TotalDuration: '5154.3032',
        TotalEnergyConsumption: '824.6999999999999',
        TotalTardiness: '0',
        TotalChargingTime: '0',
        NumberOfNodes: '16',
        NumberOfServedCustomers: '10',
        NumberOfChargeStation: '0'
      },
      Routes: [
        {
          RouteId: 'Route 1',
          VehicleId: 'Vehicle 1',
          DriverId: 'Driver 1',
          PerformanceMeasure: {
            StartTime: '0',
            RouteDistance: '1635.19',
            RouteDuration: '1783.6576',
            RouteEnergyConsumption: '135.66',
            RouteTardiness: '0',
            RouteChargingTime: '0',
            NumberOfNodes: '4',
            NumberOfChargeStation: '0'
          },
          Nodes: [
            {
              '$': { NodeId: 'cs5', NodeType: 'Depot' },
              Location: {
                Latitude: '39.751377',
                Longitude: '30.481888',
                Elevation: '0'
              },
              ServiceInformation: {
                ReadyTime: '0',
                WaitingTime: '0',
                ServiceTime: '0',
                DueDate: '0',
                ArrivalTime: '0'
              },
              LoadInformation: { Weight: '0', Volume: '0', Units: '0' }
            },
            {
              '$': { NodeId: '24', NodeType: 'Customer' },
              Location: {
                Latitude: '39.75075840001727',
                Longitude: '30.48876465362253',
                Elevation: '0'
              },
              ServiceInformation: {
                ReadyTime: '366',
                WaitingTime: '307.6864',
                ServiceTime: '120',
                DueDate: '427',
                ArrivalTime: '58.313599999999994'
              },
              LoadInformation: { Weight: '38', Volume: '0', Units: '2' },
              PerformanceMeasure: {
                AccDistance: '728.92',
                AccDuration: '486.0',
                AccEnergy: '81.08',
                AccTardiness: '0',
                RemainingCharge: '2271.08'
              }
            },
            {
              '$': { NodeId: '22A', NodeType: 'Customer' },
              Location: {
                Latitude: '39.75073912772263',
                Longitude: '30.489428025110282',
                Elevation: '0'
              },
              ServiceInformation: {
                ReadyTime: '1476',
                WaitingTime: '985.156',
                ServiceTime: '240',
                DueDate: '1540',
                ArrivalTime: '490.844'
              },
              LoadInformation: { Weight: '95', Volume: '0', Units: '5' },
              PerformanceMeasure: {
                AccDistance: '789.4699999999999',
                AccDuration: '1716.0',
                AccEnergy: '80.94'
              }
            }
          ]
        },
        {
          RouteId: 'Route 2',
          VehicleId: 'Vehicle 2',
          DriverId: 'Driver 2',
          Nodes: [
            {
              '$': { NodeId: 'cs5', NodeType: 'Depot' },
              Location: {
                Latitude: '39.751377',
                Longitude: '30.481888'
              }
            },
            {
              '$': { NodeId: '34', NodeType: 'Customer' },
              Location: {
                Latitude: '39.75298331855789',
                Longitude: '30.48744815284683'
              },
              ServiceInformation: {
                ReadyTime: '34',
                WaitingTime: '0',
                ServiceTime: '240',
                DueDate: '78'
              },
              LoadInformation: { Weight: '38', Volume: '0', Units: '2' }
            },
            {
              '$': { NodeId: '26', NodeType: 'Customer' },
              Location: {
                Latitude: '39.753632440087195',
                Longitude: '30.489956322270203'
              },
              ServiceInformation: {
                ReadyTime: '474',
                WaitingTime: '134',
                ServiceTime: '120',
                DueDate: '531'
              },
              LoadInformation: { Weight: '76', Volume: '0', Units: '4' }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(testData);
    console.log("✅ Test data inserted:", result.insertedId);

    // Verify the data
    const doc = await collection.findOne({});
    console.log("Verification:", {
      exists: !!doc,
      hasRoutes: !!doc?.Routes,
      routeCount: doc?.Routes?.length || 0,
      customersCount: doc?.Routes?.reduce((total, route) => {
        return total + (route?.Nodes?.filter(node => node?.$?.NodeType === 'Customer').length || 0);
      }, 0) || 0
    });

    console.log("✅ Data successfully added to MongoDB. Now restart your server and try the endpoint again.");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

insertTestData();
