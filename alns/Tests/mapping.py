points = {
    "cs5": [39.751670617892714, 30.480416670013025],
    "30": [39.75131088559906, 30.49188810970898],
    "2": [39.751938002852754, 30.49231551642376],
    "8": [39.75130983375398, 30.49314629224774],
    "9": [39.75131088559906, 30.49188810970898],
    "153": [39.747321, 30.472676],  # Rastgele lat/lon değerleri girilmiştir
    "51": [39.751110648077166, 30.48190792578098],
    "49": [39.75117773935171, 30.483082386576555],
    "50": [39.74959454260446, 30.483926558831705],
    "115": [39.7523728688112, 30.49019735592993],
    "26": [39.753632440087195, 30.489956322270203],
    "116": [39.753952877591864, 30.48821070669683],
    "27": [39.75309821429861, 30.486782238629036],
    "43C": [39.747321, 30.472676],  # Rastgele lat/lon değerleri girilmiştir
    "31": [39.752940711050194, 30.48307218165666],
    "42B": [39.747321, 30.472676],  # Rastgele lat/lon değerleri girilmiştir
    "39": [39.752172063632734, 30.483409077029524],
    "37B": [39.747321, 30.472676],  # Rastgele lat/lon değerleri girilmiştir
    "44": [39.75105671042203, 30.477166383283375],
    "58/1": [39.747321, 30.472676]  # Rastgele lat/lon değerleri girilmiştir
}

routes = [
    ["cs5", "30", "2", "8", "9", "153", "51", "cs5"],
    ["cs5", "49", "50", "115", "26", "116", "27", "cs5"],
    ["cs5", "43C", "31", "42B", "39", "37B", "44", "58/1", "cs5"]
]
# Renk listesi oluşturun
colors = ["blue", "green", "red", "purple", "orange", "darkred", 
          "lightred", "beige", "darkblue", "darkgreen", "cadetblue", 
          "darkpurple", "white", "pink", "lightblue", "lightgreen", 
          "gray", "black", "lightgray"]
import folium
from folium.features import DivIcon

map_center = [39.751670617892714, 30.480416670013025]
m = folium.Map(location=map_center, zoom_start=14)

# Noktaları haritaya ekleyin
for point, coordinates in points.items():
    folium.Marker(
        location=coordinates,
        popup=f"<b>ID:</b> {point}",
        icon=folium.Icon(color="blue", icon="info-sign")
    ).add_to(m)

# Rotaları haritaya ekleyin
for idx, route in enumerate(routes):
    route_coords = [points[point] for point in route]
    color = colors[idx % len(colors)]  # Her rotaya farklı bir renk atayın

    # Rotanın yönünü göstermek için çizgi ekleyin
    folium.PolyLine(
        locations=route_coords,
        color=color,
        weight=3,
        opacity=0.6
    ).add_to(m)

    # Başlangıç ve bitiş noktalarına numaralı işaretçi ekleyin
    folium.Marker(
        location=route_coords[0],
        popup=f"Route {idx+1} Start",
        icon=folium.DivIcon(html=f'<div style="font-size: 12pt; color : {color};">Start {idx+1}</div>')
    ).add_to(m)
    
    folium.Marker(
        location=route_coords[-1],
        popup=f"Route {idx+1} End",
        icon=folium.DivIcon(html=f'<div style="font-size: 12pt; color : {color};">End {idx+1}</div>')
    ).add_to(m)

    # Ok işaretlerini ekleyin
    # for i in range(len(route_coords) - 1):
    #     start_point = route_coords[i]
    #     end_point = route_coords[i + 1]
    #     mid_point = [(start_point[0] + end_point[0]) / 2, (start_point[1] + end_point[1]) / 2]
    #     direction = [end_point[0] - start_point[0], end_point[1] - start_point[1]]
        
    #     folium.Marker(
    #         location=mid_point,
    #         icon=DivIcon(html=f'<div style="font-size: 18pt; color: {color};">&#10148;</div>')
    #     ).add_to(m)

# Haritayı kaydedin
m.save("routes_map_with_arrows.html")