
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sumolib
from test_funcs import create_full_route, get_stop_positions
import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
import os
from test_funcs import create_full_route, get_stop_positions
import traci
from ui_process_files import ui_process_files
import folium
import webbrowser
import matplotlib.pyplot as plt
from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Target import Target

class DatasetSelectionForm:
    def __init__(self, root, folder_path):
        self.root = root
        self.root.title("Dataset Selection Form")
        self.root.geometry("500x500")  # Genişliği artırdık

        self.folder_path = folder_path
        self.selected_file = tk.StringVar()

        # Dataset Selection Frame
        selection_frame = ttk.LabelFrame(root, text="Select Dataset")
        selection_frame.pack(fill="both", expand=True, padx=15, pady=15)

        # Listbox to display files
        self.file_listbox = tk.Listbox(selection_frame, listvariable=self.selected_file, selectmode=tk.MULTIPLE, height=15, width=50)
        self.file_listbox.pack(side="left", fill="both", expand=True, padx=10, pady=10)

        # Scrollbar for the Listbox
        scrollbar = ttk.Scrollbar(selection_frame, orient=tk.VERTICAL, command=self.file_listbox.yview)
        scrollbar.pack(side="right", fill="y")
        self.file_listbox.config(yscrollcommand=scrollbar.set)

        # Load files into the Listbox
        self.load_files()

        # Use Dataset Button
        button_frame = ttk.Frame(root)
        button_frame.pack(fill="x", padx=15, pady=15)
        ttk.Button(button_frame, text="Use Dataset", command=self.use_dataset).pack(side="right", padx=10)

    def load_files(self):
        files = os.listdir(self.folder_path)
        for file in files:
            if file.endswith(".xml"):
                self.file_listbox.insert(tk.END, file)

    def use_dataset(self):
        selected_index = self.file_listbox.curselection()
        if selected_index:
            selected_files = [self.file_listbox.get(i) for i in selected_index]
            full_paths = [os.path.join(self.folder_path, file) for file in selected_files]
            self.root.destroy()  # Close the current window
            root = tk.Tk()
            app = SolvingProblemForm(root, full_paths)  # Pass the selected file paths as a list
            root.mainloop()
        else:
            messagebox.showerror("Error", "Please select a file to proceed.")

class SolvingProblemForm:
    def __init__(self, root, dataset_path):
        self.root = root
        self.root.title("Solving Problem Form")
        self.root.geometry("800x700")  # Daha geniş bir pencere

        self.dataset_path = dataset_path

        # Ana Frame'i oluşturma
        main_frame = ttk.Frame(root, padding="20")
        main_frame.pack(fill="both", expand=True)

        # Grid yapılandırması
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        main_frame.rowconfigure(3, weight=0)

        # Electric Vehicle Frame
        ev_frame = ttk.LabelFrame(main_frame, text="Electric Vehicle", padding="15")
        ev_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

        ttk.Label(ev_frame, text="Load Capacity (kg):").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.load_capacity = ttk.Entry(ev_frame, width=20)
        self.load_capacity.grid(row=0, column=1, padx=5, pady=5, sticky="w")
        self.load_capacity.insert(0, "350")

        ttk.Label(ev_frame, text="Tank Capacity (kWs):").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.tank_capacity = ttk.Entry(ev_frame, width=20)
        self.tank_capacity.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        self.tank_capacity.insert(0, "3000")
        
        ttk.Label(ev_frame, text="Fuel Consumption Rate:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.fuel_consumption_rate = ttk.Entry(ev_frame, width=20)
        self.fuel_consumption_rate.grid(row=2, column=1, padx=5, pady=5, sticky="w")
        self.fuel_consumption_rate.insert(0, "1.0")
        
        ttk.Label(ev_frame, text="Charging Rate").grid(row=2, column=2, padx=5, pady=5, sticky="w")
        self.charging_rate = ttk.Entry(ev_frame, width=20)
        self.charging_rate.grid(row=2, column=3, padx=5, pady=5, sticky="w")
        self.charging_rate.insert(0, "0.18")

        ttk.Label(ev_frame, text="Vmax (m/s):").grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.vmax = ttk.Entry(ev_frame, width=20)
        self.vmax.grid(row=0, column=3, padx=5, pady=5, sticky="w")
        self.vmax.insert(0, "12.5")

        ttk.Label(ev_frame, text="Vmin (m/s):").grid(row=1, column=2, padx=5, pady=5, sticky="w")
        self.vmin = ttk.Entry(ev_frame, width=20)
        self.vmin.grid(row=1, column=3, padx=5, pady=5, sticky="w")
        self.vmin.insert(0, "12.5")

        # Charging Strategy Frame
        charging_frame = ttk.LabelFrame(main_frame, text="Charging Strategy", padding="15")
        charging_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

        self.charging_var = tk.StringVar(value="full")
        ttk.Radiobutton(charging_frame, text="Full", variable=self.charging_var, value="full").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Radiobutton(charging_frame, text="Partial", variable=self.charging_var, value="partial").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        ttk.Radiobutton(charging_frame, text="%20-%80 Range", variable=self.charging_var, value="20-80").grid(row=2, column=0, padx=5, pady=5, sticky="w")

        # Algorithm Selection Frame (Sadece ALNS Algorithm)
        algorithm_frame = ttk.LabelFrame(main_frame, text="Select Algorithm", padding="15")
        algorithm_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")

        self.algorithm_var = tk.StringVar(value="ALNS Algorithm")
        ttk.Radiobutton(algorithm_frame, text="ALNS Algorithm", variable=self.algorithm_var, value="ALNS Algorithm").grid(row=0, column=0, padx=5, pady=5, sticky="w")

        # ALNS Parameters
        alns_frame = ttk.Frame(algorithm_frame, padding="10")
        alns_frame.grid(row=1, column=0, padx=5, pady=5, sticky="w")

        ttk.Label(alns_frame, text="Iteration Number:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.alns_iterations = ttk.Entry(alns_frame, width=20)
        self.alns_iterations.grid(row=0, column=1, padx=5, pady=5, sticky="w")
        self.alns_iterations.insert(0, "10000")

        ttk.Label(alns_frame, text="Initial Temperature:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.alns_initial_temp = ttk.Entry(alns_frame, width=20)
        self.alns_initial_temp.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        self.alns_initial_temp.insert(0, "10000")

        ttk.Label(alns_frame, text="Cooling Rate:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.alns_alpha = ttk.Entry(alns_frame, width=20)
        self.alns_alpha.grid(row=2, column=1, padx=5, pady=5, sticky="w")
        self.alns_alpha.insert(0, "0.9980")

        ttk.Label(alns_frame, text="Max Iterations without Improvement:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.alns_N = ttk.Entry(alns_frame, width=20)
        self.alns_N.grid(row=3, column=1, padx=5, pady=5, sticky="w")
        self.alns_N.insert(0, "4")

        ttk.Label(alns_frame, text="Route Removal Interval:").grid(row=4, column=0, padx=5, pady=5, sticky="w")
        self.alns_K = ttk.Entry(alns_frame, width=20)
        self.alns_K.grid(row=4, column=1, padx=5, pady=5, sticky="w")
        self.alns_K.insert(0, "25")

        ttk.Label(alns_frame, text="Weights Update Interval:").grid(row=5, column=0, padx=5, pady=5, sticky="w")
        self.alns_Z = ttk.Entry(alns_frame, width=20)
        self.alns_Z.grid(row=5, column=1, padx=5, pady=5, sticky="w")
        self.alns_Z.insert(0, "4")

        # Objective Functions Frame
        objective_frame = ttk.LabelFrame(main_frame, text="Objective Functions", padding="15")
        objective_frame.grid(row=2, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")

        self.objective_var = tk.StringVar(value="total_distance")
        ttk.Radiobutton(objective_frame, text="Minimize Total Distance", variable=self.objective_var, value="total_distance").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Radiobutton(objective_frame, text="Minimize Total Time", variable=self.objective_var, value="total_time").grid(row=0, column=1, padx=5, pady=5, sticky="w")
        ttk.Radiobutton(objective_frame, text="Minimize Total Energy", variable=self.objective_var, value="total_energy").grid(row=0, column=2, padx=5, pady=5, sticky="w")
        ttk.Radiobutton(objective_frame, text="Minimize Total Tardiness", variable=self.objective_var, value="total_tardiness").grid(row=0, column=3, padx=5, pady=5, sticky="w")

        # Action Buttons
        action_frame = ttk.Frame(main_frame, padding="15")
        action_frame.grid(row=3, column=0, columnspan=2, padx=10, pady=10, sticky="ew")

        ttk.Button(action_frame, text="Get Solution", command=self.get_solution).grid(row=0, column=0, padx=10, pady=5)
        ttk.Button(action_frame, text="Clear Solution", command=self.clear_solution).grid(row=0, column=1, padx=10, pady=5)
        ttk.Button(action_frame, text="Show Solution Form", command=self.show_solution_form).grid(row=0, column=2, padx=10, pady=5)
        
        # Yeni "Back to Dataset Selection" butonu ekleyin
        ttk.Button(action_frame, text="Back to Dataset Selection", command=self.go_back_to_dataset_selection).grid(row=0, column=3, padx=10, pady=5)

        # Initialize best_solution
        self.best_solution = None

    def go_back_to_dataset_selection(self):
        if self.dataset_path:
            # Seçilen dosyaların bulunduğu klasörü alıyoruz
            folder_path = os.path.dirname(self.dataset_path[0])
        else:
            messagebox.showerror("Error", "No dataset path available to go back.")
            return

        # Mevcut pencereyi kapat
        self.root.destroy()

        # Yeni bir Tkinter penceresi oluştur ve DatasetSelectionForm'u başlat
        root = tk.Tk()
        app = DatasetSelectionForm(root, folder_path)
        root.mainloop()

    def get_solution(self):
        parameters = {}
        try:
            parameters["load_capacity"] = float(self.load_capacity.get())
            parameters["tank_capacity"] = float(self.tank_capacity.get())
            parameters["vmax"] = float(self.vmax.get())
            parameters["vmin"] = float(self.vmin.get())
            parameters["fuel_consumption_rate"] = float(self.fuel_consumption_rate.get())
            parameters["charging_rate"] = float(self.charging_rate.get())
            parameters["charge_option"] = self.charging_var.get()
            parameters["obj_function_option"] = self.objective_var.get()
            

            if self.algorithm_var.get() == "ALNS Algorithm":
                parameters["maxIterations"] = int(self.alns_iterations.get())
                parameters["initial_temperature"] = float(self.alns_initial_temp.get())
                parameters["cooling_rate"] = float(self.alns_alpha.get())
                parameters["N"] = int(self.alns_N.get())
                parameters["K"] = int(self.alns_K.get())
                parameters["Z"] = int(self.alns_Z.get())
        except ValueError as ve:
            messagebox.showerror("Input Error", f"Invalid input: {ve}")
            return

        # Run the processing function
        try:
            messagebox.showinfo("Processing", "Solution is being processed. Please wait...")
            self.best_solution = ui_process_files(parameters, self.dataset_path)
            messagebox.showinfo("Success", "Solution processed successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    def clear_solution(self):
        # Placeholder function for clearing the solution
        self.best_solution = None
        messagebox.showinfo("Info", "Solution cleared.")

    def show_solution_form(self):
        if self.best_solution is not None:
            SolutionForm(tk.Toplevel(self.root), self.best_solution)
        else:
            messagebox.showerror("Error", "No solution available. Please run the solution first.")

class SolutionForm:
    def __init__(self, root, best_solution):
        self.root = root
        self.root.title("Solution Form")
        self.root.geometry("1000x600")  # Wider window
    
        self.best_solution = best_solution[0]  # Taking the first solution
    
        columns = ("Route ID", "Total Distance", "Total Time", "Total Energy",  "Number of Deliveries")
        self.tree = ttk.Treeview(root, columns=columns, show='headings')
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, anchor="center", width=200)
        self.tree.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Initialize total accumulators
        total_distance_all = 0
        total_time_all = 0
        total_energy_all = 0
        total_deliveries_all = 0

        # Adding routes to the list
        for idx, route in enumerate(self.best_solution.routes):
            total_distance = route.calculate_total_distance()
            total_time = route.calculate_total_time()
            total_energy = route.calculate_total_energy()
            total_distance = round(total_distance, 2)
            total_time = round(total_time, 2)
            total_energy = round(total_energy, 2)
            num_deliveries = len(route.get_customers())

            # Update total accumulators
            total_distance_all += total_distance
            total_time_all += total_time
            total_energy_all += total_energy
            total_deliveries_all += num_deliveries

            self.tree.insert("", "end", iid=idx, values=(
                f"Route {idx+1}", total_distance, total_time, total_energy, num_deliveries))

        # Insert total row
        self.tree.insert("", "end", iid='total', values=(
            "Total", round(total_distance_all, 2), round(total_time_all, 2),
            round(total_energy_all, 2), total_deliveries_all), tags=('total_row',))

        # Configure style for the total row
        self.tree.tag_configure('total_row', background='lightgray', font=('Helvetica', 10, 'bold'))

        # Function to call when a selection is made
        self.tree.bind("<<TreeviewSelect>>", self.on_route_select)

        # Map and Gantt chart buttons
        button_frame = ttk.Frame(root, padding="10")
        button_frame.pack(fill="x", pady=10, padx=20)
        ttk.Button(button_frame, text="Show Selected Route on Map",
                   command=self.show_selected_route_on_map).pack(side="left", padx=10)
        ttk.Button(button_frame, text="Gantt Chart for Selected Route",
                   command=self.show_gantt_chart_single_line).pack(side="left", padx=10)
        ttk.Button(button_frame, text="Show All Routes on Gantt Chart",
                   command=self.show_all_routes_gantt_chart).pack(side="left", padx=10)

        self.selected_route_idx = None

    def on_route_select(self, event):
        selected_item = self.tree.focus()
        if selected_item:
            self.selected_route_idx = int(selected_item)
            selected_route = self.best_solution.routes[self.selected_route_idx]
            self.show_route_details(selected_route)

    def show_route_details(self, route):
        details_window = tk.Toplevel(self.root)
        details_window.title("Route Details")
        details_window.geometry("700x500")  # Daha geniş bir pencere

        # Detayları gösterme
        text = tk.Text(details_window, wrap="word", padx=10, pady=10)
        text.pack(fill="both", expand=True)

        # Rotadaki noktaların bilgilerini yazdırma
        for idx, point in enumerate(route.route):
            point_info = f"Index: {idx}\n"
            point_info += f"Point ID: {point.id}\n"
            point_info += f"Location: ({point.lat}, {point.lon})\n"
            if hasattr(point, 'demand'):
                point_info += f"Demand: {point.demand}\n"
            if hasattr(point, 'ready_time'):
                point_info += f"Ready Time: {point.ready_time}\n"
            if hasattr(point, 'service_time'):
                point_info += f"Service Time: {point.service_time}\n"
            if hasattr(point, 'due_date'):
                point_info += f"Due Date: {point.due_date}\n"
            
            point_info += "\n"
            text.insert("end", point_info)

    def show_selected_route_on_map(self):
        if self.selected_route_idx is not None:
            selected_route = self.best_solution.routes[self.selected_route_idx]
            self.show_on_map(selected_route)
        else:
            messagebox.showerror("Error", "Please select a route.")

    def show_on_map(self, route):
        if not route.route:
            messagebox.showerror("Error", "Route is Empty.")
            return

        # SUMO araçlarını başlatmadan önce
        cs_file = r"SUMO\RouteVisualization\cs.add.xml"
        nodes_list = [str(node.id) for node in route.route]
        stop_positions = get_stop_positions(cs_file, nodes_list)

        # SUMO'yu traci ile başlatma
        sumo_cfg = r"SUMO\RouteVisualization\dennn.sumocfg.xml"
        try:
            traci.start(["sumo", "-c", sumo_cfg])
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start SUMO: {e}")
            return

        # Tam rota kenarlarını oluşturma
        full_route_edges = create_full_route(stop_positions)

        # Kenar koordinatlarını alabilmek için sumolib ile ağ dosyasını okuyun
        sumo_tools_path = r'C:\Program Files (x86)\Eclipse\Sumo\tools'  # Kendi SUMO kurulum yolunuza göre değiştirin
        sys.path.append(sumo_tools_path)
        
        osm_net_file = r'SUMO\RouteVisualization\osm.net.xml'
        try:
            net = sumolib.net.readNet(osm_net_file)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to read network file: {e}")
            traci.close()
            return

        combined_coords = []
        previous_edge_last_point = None

        for edge_id in full_route_edges:
            edge = net.getEdge(edge_id)
            if edge:
                shape = edge.getShape()
                edge_coords = []
                for x, y in shape:
                    try:
                        lon, lat = net.convertXY2LonLat(x, y)
                        edge_coords.append((lat, lon))
                    except Exception as e:
                        print(f"Failed to convert coordinates for edge '{edge_id}': {e}")
                if edge_coords:
                    if previous_edge_last_point and edge_coords[0] == previous_edge_last_point:
                        # İlk noktayı atlayarak tekrar etmeyi önlüyoruz
                        combined_coords.extend(edge_coords[1:])
                    else:
                        combined_coords.extend(edge_coords)
                    previous_edge_last_point = edge_coords[-1]
            else:
                print(f"Edge '{edge_id}' ağda bulunamadı.")

        traci.close()

        if not combined_coords:
            messagebox.showerror("Error", "No valid edges found for the route.")
            return

        # Haritanın ortalama enlem ve boylamını hesaplayın
        all_lats = [lat for lat, lon in combined_coords]
        all_lons = [lon for lat, lon in combined_coords]

        if all_lats and all_lons:
            avg_lat = sum(all_lats) / len(all_lats)
            avg_lon = sum(all_lons) / len(all_lons)
        else:
            messagebox.showerror("Error", "Failed to calculate average coordinates.")
            return

        # Harita oluşturun
        m = folium.Map(location=[avg_lat, avg_lon], zoom_start=15)

        # Birleşik koordinatları kullanarak tek bir PolyLine ekleyin
        folium.PolyLine(combined_coords, color='blue', weight=5, opacity=0.8).add_to(m)

        # Rota başlangıç ve bitiş noktalarına marker ekleyin
        try:
            start_lat, start_lon = combined_coords[0]
            end_lat, end_lon = combined_coords[-1]
            folium.Marker(
                [start_lat, start_lon],
                popup="Start",
                icon=folium.Icon(color='green', icon='play')
            ).add_to(m)
            folium.Marker(
                [end_lat, end_lon],
                popup="End",
                icon=folium.Icon(color='red', icon='stop')
            ).add_to(m)
        except IndexError:
            print("No coordinates available to add start and end markers.")

        # Teslimat noktalarını işaretleme ve isimlerini ekleme
        for point in route.route:
            try:
                # Koordinatları al
                lat = point.lat if hasattr(point, 'lat') else point.y
                lon = point.lon if hasattr(point, 'lon') else point.x

                # Teslimat noktasının tipi
                #point_type = getattr(point, 'type', 'customer')  # Varsayılan olarak 'customer' alır
                point_type = type(point)
                # Teslimat noktasının adı veya ID'si
                point_name = getattr(point, 'name', f"ID: {point.id}")

                # Renk ve ikon belirleme
                if point_type == Target:
                    marker_color = 'blue'
                    marker_icon = 'home'
                elif point_type == ChargeStation:
                    marker_color = 'green'
                    marker_icon = 'bolt'
                elif point_type == Customer:
                    marker_color = 'red'
                    marker_icon = 'truck'
                else:
                    marker_color = 'gray'  # Diğer tipler için gri
                    marker_icon = 'info-sign'

                # Marker ekleme
                folium.Marker(
                    [lat, lon],
                    popup=point_name,
                    icon=folium.Icon(color=marker_color, icon=marker_icon, prefix='fa')
                ).add_to(m)
            except Exception as e:
                print(f"Failed to add marker for point '{point.id}': {e}")

        # Haritayı HTML olarak kaydetme ve açma
        output_file = 'rotalar.html'
        try:
            m.save(output_file)
            print(f"Harita '{output_file}' olarak kaydedildi.")
            webbrowser.open(output_file)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save or open the map: {e}")



    def show_gantt_chart_single_line(self):
        if self.selected_route_idx is not None:
            selected_route = self.best_solution.routes[self.selected_route_idx]
            self.show_gantt_chart(selected_route)
        else:
            messagebox.showerror("Error", "Please select a Route.")

    def show_gantt_chart(self, route):
        plt.close('all')  # Mevcut tüm figürleri kapatıyoruz
        customers = route.get_customers()
        charge_stations = route.get_charge_stations()  # Şarj istasyonlarını alıyoruz
        
        targets = route.get_targets()  
        if not customers and not charge_stations:
            messagebox.showerror("Error", "Route is Empty.")
            return

        # Renk tanımlamaları
        customer_color = 'red'
        charge_station_color = 'green'
        depot_color = 'blue'

        fig, ax = plt.subplots(figsize=(12, 6), constrained_layout=True)  # constrained_layout ekledik
        y_position = 10  # Teslimatlar ve depolar aynı yatay çizgide olacak

        for node_id, node in enumerate(route.route):
            if isinstance(node, Customer):
                arrival_time = route.calculate_arrived_time(node)
                service_time = node.service_time
                # waiting_time = 0  # Waiting time kaldırıldı
                due_date = node.due_date

                ax.broken_barh(
                    [(arrival_time, service_time)],
                    (y_position, 9),
                    facecolors=customer_color,
                    edgecolors='black'
                )
                ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                        ha='center', va='center', color='black', fontsize=8)
                
            elif isinstance(node, ChargeStation):
                cs_arrival_time = route.calculate_arrived_time(node)
                cs_duration = node.service_time
                ax.broken_barh(
                    [(cs_arrival_time, cs_duration)],
                    (y_position, 9),
                    facecolors=charge_station_color,
                    edgecolors='black'
                )
                ax.text(cs_arrival_time + cs_duration / 2, y_position + 4.5, f"{node.id}",
                        ha='center', va='center', color='black', fontsize=8)

            elif isinstance(node, Target):
                if node_id == 0:
                    arrival_time = -50
                    service_time = 50
                else:
                    arrival_time = route.calculate_arrived_time(node)
                    service_time = 50

                ax.broken_barh(
                    [(arrival_time, service_time)],
                    (y_position, 9),
                    facecolors=depot_color,
                    edgecolors='black'
                )
                ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                        ha='center', va='center', color='black', fontsize=8)
        
        # Vehicle Label outside the chart
        ax.text(-100, y_position + 4.5, f"Vehicle {1}", ha='right', va='center', fontsize=10, fontweight='bold')

        ax.set_xlabel('Time')
        ax.set_ylabel('Deliveries and Depots')
        ax.set_yticks([])

        # Grid ekleme
        ax.set_axisbelow(True)
        ax.grid(True, which='both', axis='x', linestyle='--', linewidth=0.5, color='gray', alpha=0.7)

        # Legend oluşturma
        legend_elements = [
            plt.Rectangle((0,0),1,1, color=customer_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=charge_station_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=depot_color, edgecolor='black')
        ]
        legend_labels = ["Customer", "Charging Station", "Depot"]

        ax.legend(legend_elements, legend_labels, title="Entities", bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.title('Gantt Chart for Selected Route')
        plt.show()
        plt.close(fig)  # Figürü kapatıyoruz

    def show_all_routes_gantt_chart(self):
        plt.close('all')  # Mevcut tüm figürleri kapatıyoruz
        fig, ax = plt.subplots(figsize=(10, 3), dpi=100, constrained_layout=True)  # Figür boyutunu küçülttük
        y_base = 0  # Başlangıç y pozisyonu

        # Renk tanımlamaları
        customer_color = 'red'
        charge_station_color = 'green'
        depot_color = 'blue'

        for route_idx, route in enumerate(self.best_solution.routes):
            y_position = y_base
            for node_id, node in enumerate(route.route):
                if isinstance(node, Customer):
                    arrival_time = route.calculate_arrived_time(node)
                    service_time = node.service_time

                    ax.broken_barh(
                        [(arrival_time, service_time)],
                        (y_position, 90),
                        facecolors=customer_color,
                        edgecolors='black'
                    )
                    ax.text(arrival_time + service_time / 2, y_position + 45, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
                    
                elif isinstance(node, ChargeStation):
                    cs_arrival_time = route.calculate_arrived_time(node)
                    cs_duration = node.service_time
                    ax.broken_barh(
                        [(cs_arrival_time, cs_duration)],
                        (y_position, 90),
                        facecolors=charge_station_color,
                        edgecolors='black'
                    )
                    ax.text(cs_arrival_time + cs_duration / 2, y_position + 45, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)

                elif isinstance(node, Target):
                    if node_id == 0:
                        arrival_time = -50
                        service_time = 50
                    else:
                        arrival_time = route.calculate_arrived_time(node)
                        service_time = 50

                    ax.broken_barh(
                        [(arrival_time, service_time)],
                        (y_position, 90),
                        facecolors=depot_color,
                        edgecolors='black'
                    )
                    ax.text(arrival_time + service_time / 2, y_position + 45, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
            
            # Rota etiketini y eksenine ekleyelim
            ax.text(-200, y_position + 45, f"Vehicle {route_idx+1}", ha='right', va='center', fontsize=8)

            y_base += 90  # Bir sonraki rota için y pozisyonunu artırıyoruz

        ax.set_xlabel('Time')
        ax.set_ylabel('Routes and Depots')

        # Grid ekleme
        ax.set_axisbelow(True)
        ax.grid(True, which='both', axis='x', linestyle='--', linewidth=0.5, color='gray', alpha=0.7)

        ax.set_yticks([])

        # Legend oluşturma
        legend_elements = [
            plt.Rectangle((0,0),1,1, color=customer_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=charge_station_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=depot_color, edgecolor='black')
        ]
        legend_labels = ["Customer", "Charging Station", "Depot"]

        ax.legend(legend_elements, legend_labels, title="Entities", bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.title('Gantt Chart for All Routes')
        # plt.tight_layout()  # constrained_layout kullandığımız için kaldırabilirsiniz
        plt.show()
        plt.close(fig)  # Figürü kapatıyoruz

if __name__ == "__main__":
    import sys
    import os
    project_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    folder_path = os.path.join(project_path, "SchneiderData", "dataset_v1.2")
    root = tk.Tk()
    app = DatasetSelectionForm(root, folder_path)
    root.mainloop()
