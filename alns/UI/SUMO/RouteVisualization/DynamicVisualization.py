import traci
import xml.etree.ElementTree as ET

def get_stop_edges(cs_file, stop_ids):
    # Load and parse the XML file
    tree = ET.parse(cs_file)
    root = tree.getroot()

    stop_edges = {}
    for stop_id in stop_ids:
        # Look for ech containerStop
        for container_stop in root.findall("containerStop" or "chargingStation"):
            if container_stop.get('id') == stop_id:
                # LGet lane and determine the edge
                lane_id = container_stop.get('lane')
                edge_id = lane_id.split('_')[0]  # Delete the lane ID from the edge ID
                stop_edges[stop_id] = edge_id
                break
    return stop_edges

def get_stop_positions(cs_file, stop_ids):
    # Load and parse the XML file
    tree = ET.parse(cs_file)
    root = tree.getroot()

    stop_positions = {}
    for stop_id in stop_ids:
        # Look for each containerStop
        for container_stop in root.findall("containerStop" or "chargingStation"):
            if container_stop.get('id') == stop_id:
                # Get end position
                lane_id = container_stop.get('lane')
                end_pos = (float(container_stop.get('endPos')) + float(container_stop.get('startPos'))) / 2
                edge_id = lane_id.split('_')[0]  # Delete the lane ID from the edge ID
                stop_positions[stop_id] = (edge_id, end_pos)
                break
    return stop_positions

def find_route_between_stops(start_edge, end_edge):
    route = traci.simulation.findRoute(fromEdge=start_edge, toEdge=end_edge)
    return route.edges

def create_full_route(stop_positions):
    full_route = []
    previous_edge = None
    stop_edges_seq = [position[0].split('_')[0] for position in stop_positions.values()]
    for i in range(len(stop_edges_seq) - 1):
        segment_route = find_route_between_stops(stop_edges_seq[i], stop_edges_seq[i+1])
        if len(segment_route) == 0:
            print(f"Warning: No route found between {stop_edges_seq[i]} and {stop_edges_seq[i+1]}")
        else:
            # If the same edge comes in a row, filter them because it crashes SUMO
            filtered_segment_route = []
            for edge in segment_route:
                if edge != previous_edge:
                    filtered_segment_route.append(edge)
                    previous_edge = edge
            
            full_route.extend(filtered_segment_route)
    return full_route

def visualize_on_sumo(route : list):
    
    stop_ids = []  # Points to be visited
    for index, item in enumerate(route):
        if index == 0:
            continue
        stop_ids.append(str(item.id))
    
    # File paths and stop IDs
    cs_file = "RouteVisualization/cs.add.xml"
    stop_duration = 20  # Waiting time at each stop (seconds)

    # Find the edges of the stop points and their positions
    stop_positions = get_stop_positions(cs_file, stop_ids)
    stop_edges = get_stop_edges(cs_file, stop_ids)

    # Start SUMO-GUI
    traci.start(["sumo-gui", "-c", "RouteVisualization/dennn.sumocfg.xml"])

    # Calculate the routes and create the full route with edges
    full_route_edges = create_full_route(stop_positions)
    
    # Print the route
    print("Full route edges:", full_route_edges)

    # Add the vehicle and the route to SUMO
    traci.route.add("delivery_route", full_route_edges)
    traci.vehicle.add("ev0", routeID="delivery_route", typeID="evehicle")
    
    # Set the stop points for the vehicle
    for stop_id, (lane_id, end_pos) in stop_positions.items():
        lane_id = stop_edges[stop_id]
        traci.vehicle.setStop("ev0", lane_id, pos=end_pos, duration=stop_duration)
    
    # Run SUMO for 1000 steps
    for step in range(1000):
        traci.simulationStep()
    
    
    # Close the simulation
    traci.close()

visualize_on_sumo(["cs5", "113", "45", "cs5" ])

# if __name__ == "__main__":
#     main()