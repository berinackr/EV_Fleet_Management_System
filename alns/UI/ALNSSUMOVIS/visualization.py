import os
import subprocess
import sys

# SUMO'nun kurulu olduğu dizini belirtin (sumo-gui'nin bulunduğu yer)
sumo_gui_path = r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo-gui.exe"  # Kendi sisteminize göre değiştirin

# Edge listesi (string input veya Python listesi)
edge_list = [
    '669466787#2', '669466787#3', '-669466787#3', '-669466787#2', '-669466787#1', '-368620842#13', '-368620842#12', '-368620842#9', '-368620842#8', '-368620842#6', '-368620842#5', '-368620842#4', '-368620842#2', '-368620842#1', '-368620842#0', '212712118#0', '212712113#0', '370571236#0', '370571236#1', '212712113#2', '212712113#3', '642121507', '370540854#1', '370540854#2', '370571237#0', '370571237#1', '-212712113#0', '212712118#3', '371317621#0', '-371317621#0', '212712118#4', '369625683#0', '369625683#1', '369625683#2', 'E2', 'E0', 'E4', 'E5', 'E6', 'E3', 'E11', '369625683#3.8', '369625683#4', '1060234726#4', '697983200', 'E1', '697983203', '1060234726#2', '697983206#0', '697983206#1', '697983206#2', '697983206#3', '697983206#4', '697983206#5', '369625684#4', '369625684#1', '212712098#0', '212712098#1', '368620842#0', '368620842#1', '368620842#2', '368620842#4', '368620842#5', '368620842#6', '368620842#8', '368620842#9', '368620842#12', '368620842#13', '669466787#1', '669466787#2'
]

# Rota dosyasının adı
route_file = 'my_route.rou.xml'

# 1. Rota dosyasını oluşturun
def create_route_file(edge_list, route_file):
    edges_str = ' '.join(edge_list)
    route_content = f'''<routes>
    <route id="my_route" edges="{edges_str}" />
</routes>'''
    with open(route_file, 'w') as f:
        f.write(route_content)
    print(f"Rota dosyası '{route_file}' oluşturuldu.")

def main():
    # 1. Rota dosyasını oluşturun
    create_route_file(edge_list, route_file)

if __name__ == '__main__':
    main()