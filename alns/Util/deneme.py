import traci
import folium


""" 
Burada verilen bir rotanın location bilgilerini ve ara değerleri almaya çalıştım.

"""

def creator(sumo_config="dennn.sumocfg"):
    # SUMO'yu başlatın ve TraCI bağlantısını kurun
    traci.start(["sumo", "-c", sumo_config])

    # Geçiş noktalarını almak için simülasyonu adım adım ilerletin
    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        
        # Geçerli rotadaki yolları (edges) alın
        route_edges = traci.vehicle.getRoute("veh9")
        container_stop = traci.vehicle.getContainerStop("veh9")
        print("Container durumu:", container_stop)
        print("Araç güzergahı:", route_edges)
        input("bekle")
        
        result = []
        for edge in route_edges:
            lane_id = edge + "_0"  # Assuming the first lane of each edge
            lane_coords = traci.lane.getShape(lane_id)  # Gets all points defining the lane's shape
            for coord in lane_coords:
                # Convert to geographic coordinates if needed
                lat, lon = traci.simulation.convertGeo(coord[0], coord[1])  # Ensure correct order here
                result.append((lat, lon))

        with open("route_edges.txt", "w") as f:
            for coord in result:
                f.write(f"({coord[0]}, {coord[1]}),\n")

        break

    traci.close()


def calculate_shortest_paths_between_stops(stop_positions, sumocfg_file):
    # Start the SUMO simulation
    traci.start(["sumo", "-c", sumocfg_file])

    full_route_edges = []

    try:
        # Iterate through consecutive stop positions to calculate shortest path
        for i in range(len(stop_positions) - 1):
            start_stop = stop_positions[i]
            end_stop = stop_positions[i + 1]

            # Extract edge and position
            start_edge, start_pos = list(start_stop.values())[0]
            end_edge, end_pos = list(end_stop.values())[0]

            # Find the shortest route between the start and end edges
            route = traci.simulation.findRoute(start_edge, end_edge).edges
            print(f"Route from {start_edge} to {end_edge}: {route}")

            # Gather lane center coordinates for visualization
            route_coords = []
            for edge in route:
                lane_id = edge + "_0"  # Use lane 0 for each edge
                lane_shape = traci.lane.getShape(lane_id)  # Get lane shape coordinates
                route_coords.extend(lane_shape)

            # Convert to geographic coordinates and store
            route_geo_coords = [
                (lon, lat ) for x, y in route_coords for lat, lon in [traci.simulation.convertGeo(x, y)]
            ]
            full_route_edges.append(route_geo_coords)

            print(f"Geo-coordinates between {start_edge} and {end_edge}: {route_geo_coords}")

    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        traci.close()

    return full_route_edges


def plot_route_on_map(routes_geo_coords):
    print(routes_geo_coords)
    # Initialize the map centered around the first stop's coordinates
    start_lon, start_lat, = routes_geo_coords[0][0]  # First point in the first route segment
    route_map = folium.Map(location=[start_lat, start_lon], zoom_start=13)

    # Loop through each route and plot on the map
    for i, route in enumerate(routes_geo_coords):
        # Create a line for each segment between stops
        folium.PolyLine(
            route,
            color="blue",
            weight=3,
            opacity=0.8,
            tooltip=f"Route Segment {i + 1}"
        ).add_to(route_map)

        # Mark each stop with a different color and label
        folium.Marker(
            location=route[0],  # Start point of the route segment
            popup=f"Stop {i + 1}",
            icon=folium.Icon(color="red", icon="info-sign")
        ).add_to(route_map)
        folium.Marker(
            location=route[-1],  # End point of the route segment
            popup=f"Stop {i + 2}",
            icon=folium.Icon(color="green", icon="info-sign")
        ).add_to(route_map)

    # Save the map as an HTML file
    route_map.save("route_map.html")
    print("Map has been saved as route_map.html")


stop_positions = [
    {'cs5': ('-698869618', 13.08)},
    {'13': ('212712085#1.130', 14.14)},
    {'14': ('642121509#0', 16.16)},
    {'cs8': ('-371317618', 11.94)},
    {'113': ('697983200', 15.79)},
    {'26': ('-373178346#1', 15.98)},
    {'cs4': ('-700262764', 13.67)},
    {'31': ('369625682#12', 9.1)},
    {'cs5': ('-698869618', 13.08)}
]

# Example usage
sumo_config = "dennn.sumocfg"
routes_geo_coords = calculate_shortest_paths_between_stops(stop_positions, sumo_config)
plot_route_on_map(routes_geo_coords)
