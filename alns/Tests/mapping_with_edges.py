import folium
import osmnx as ox

# Başlangıç noktası için koordinatlar (latitude, longitude)
start_coords = [39.9334, 32.8597]  # Ankara, Türkiye

# Edge bilgileri (start_node, end_node) formatında
edges = [
    (669466787, 669466787),
    (669466787, -669466787),
    # ...
    (369625684, 212712098),
]

# Koordinatları elde etmek için bir fonksiyon (yukarıdaki edge'ler için koordinatları alın)
def get_coordinates(node_id):
    # Gerçek koordinatları buradan almanız gerekecek
    # Bu bir örnek, gerçek koordinatları bir veritabanından veya API'den alabilirsiniz
    return (39.9334, 32.8597)  # Örnek koordinatlar, gerçek verilerle değiştirilmeli

# Haritayı oluştur
m = folium.Map(location=start_coords, zoom_start=13)

# OSM verilerini indir
G = ox.graph_from_point(start_coords, dist=1000, network_type='all')

# OSM verilerini folium haritasına ekle
folium.TileLayer('openstreetmap').add_to(m)
folium.TileLayer('Stamen Terrain', attr='Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.').add_to(m)
folium.TileLayer('Stamen Toner', attr='Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.').add_to(m)
folium.LayerControl().add_to(m)

# Edge bilgilerini haritaya ekle
for start_node, end_node in edges:
    start_coords = get_coordinates(start_node)
    end_coords = get_coordinates(end_node)
    folium.PolyLine([start_coords, end_coords], color='blue', weight=2.5, opacity=1).add_to(m)

# Haritayı kaydet ve göster
m.save('route_map.html')

# Haritayı Jupyter Notebook içinde görüntülemek isterseniz:
m
