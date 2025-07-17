import xml.etree.ElementTree as ET

# XML dosyasını oku
tree = ET.parse('SchneiderData\\temp2\\newesogu-c20-ds1.xml')
root = tree.getroot()

# Distance matrix içeren etiketin adı
distance_matrix_tag = 'DijkstraMatrix'

# Distance matrix verisini al
distance_matrix_data = root.find(distance_matrix_tag).text

# Distance matrix verisinden metin verisini al ve boşluklara göre ayırarak distance matrix oluştur
distance_matrix = [[int(x) for x in line.split()] for line in distance_matrix_data.strip().split('\n')]

# Örnek olarak x5 ile x3 arasındaki mesafeyi alalım (indeksler 4 ve 2 olarak kabul edilecek)
x5_index = 67
x3_index = 120
mesafe = distance_matrix[x5_index][x3_index]
print("x5 ile x3 arasındaki mesafe:", mesafe)
# print(type(mesafe))



def yasin_yaz(file_name):
    
    routes = []
    
    with open(file_name, "r") as file : 
        lines = file.readlines()
        for line in lines[2:]:
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split(",") 
                routes.append(parts)

    points = root.find("Points")
    total_solution = 0        
    
    for route in routes:
        left = None
        right = None
        route_solution = 0
        for index in range(1,len(route)):
            
            left = index-1 
            right = index
            
            for point in points:
                left_item = route[left].replace(" ", "")
                
                if left_item in point.attrib["Name"] :
                    left_index = int(point.attrib["No"]) - 1
                    
                right_item = route[right].replace(" ", "")
                if right_item in point.attrib["Name"] :
                    right_index = int(point.attrib["No"]) - 1    
                    
            print(f"{route[left]}({left_index}) - {route[right]}({right_index})  : {distance_matrix[left_index][right_index]}")        
            route_solution += distance_matrix[left_index][right_index]
            
        total_solution += route_solution
        
    print("Total Solution : ", total_solution)
    
              
# file_name = "C:\\Users\\Yasin\\Desktop\\newesogu-r5-ds1"
# yasin_yaz(file_name)
# points = root.find("Points")
# if "cs5" in points.attrib["Name"]:
#     print(points.attrib)
# for point in points:
#     if "cs5" == point.attrib["Name"]:
#         print(point.attrib)
#         break
