import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
import os
from ui_process_files import ui_process_files
import folium
import webbrowser
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Target import Target

class DatasetSelectionForm:
    def __init__(self, root, folder_path):
        self.root = root
        self.root.title("Dataset Selection Form")
        self.root.geometry("400x400")

        self.folder_path = folder_path
        self.selected_file = tk.StringVar()

        # Dataset Selection Frame
        selection_frame = ttk.LabelFrame(root, text="Select Dataset")
        selection_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Listbox to display files
        self.file_listbox = tk.Listbox(selection_frame, listvariable=self.selected_file, selectmode=tk.MULTIPLE, height=10, width=40)
        self.file_listbox.pack(side="left", fill="both", expand=True, padx=5, pady=5)

        # Scrollbar for the Listbox
        scrollbar = ttk.Scrollbar(selection_frame, orient=tk.VERTICAL, command=self.file_listbox.yview)
        scrollbar.pack(side="right", fill="y")
        self.file_listbox.config(yscrollcommand=scrollbar.set)

        # Load files into the Listbox
        self.load_files()

        # Use Dataset Button
        button_frame = ttk.Frame(root)
        button_frame.pack(fill="x", padx=10, pady=10)
        ttk.Button(button_frame, text="Use Dataset", command=self.use_dataset).pack(side="right", padx=5)

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
        self.root.title("SolvingProblemForm")
        self.dataset_path = dataset_path

        # Electric Vehicle Frame
        ev_frame = ttk.LabelFrame(root, text="Electric Vehicle")
        ev_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        ttk.Label(ev_frame, text="Load Capacity (kg):").grid(row=0, column=0, padx=5, pady=5)
        self.load_capacity = ttk.Entry(ev_frame)
        self.load_capacity.grid(row=0, column=1, padx=5, pady=5)
        self.load_capacity.insert(0, "350")

        ttk.Label(ev_frame, text="Tank Capacity (kWs):").grid(row=1, column=0, padx=5, pady=5)
        self.tank_capacity = ttk.Entry(ev_frame)
        self.tank_capacity.grid(row=1, column=1, padx=5, pady=5)
        self.tank_capacity.insert(0, "3500")

        ttk.Label(ev_frame, text="Vmax(m/s):").grid(row=0, column=2, padx=5, pady=5)
        self.vmax = ttk.Entry(ev_frame)
        self.vmax.grid(row=0, column=3, padx=5, pady=5)
        self.vmax.insert(0, "12.5")

        ttk.Label(ev_frame, text="Vmin(m/s):").grid(row=1, column=2, padx=5, pady=5)
        self.vmin = ttk.Entry(ev_frame)
        self.vmin.grid(row=1, column=3, padx=5, pady=5)
        self.vmin.insert(0, "12.5")

        # Charging Strategy Frame
        charging_frame = ttk.LabelFrame(root, text="Charging Strategy")
        charging_frame.grid(row=0, column=1, padx=10, pady=10, sticky="ew")

        self.charging_var = tk.StringVar(value="full")
        ttk.Radiobutton(charging_frame, text="Full", variable=self.charging_var, value="full").grid(row=0, column=0, padx=5, pady=5)
        ttk.Radiobutton(charging_frame, text="Partial", variable=self.charging_var, value="partial").grid(row=0, column=1, padx=5, pady=5)
        ttk.Radiobutton(charging_frame, text="%20-%80 Range", variable=self.charging_var, value="20-80").grid(row=0, column=2, padx=5, pady=5)

        # Algorithm Selection Frame
        algorithm_frame = ttk.LabelFrame(root, text="Select Algorithm")
        algorithm_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky="ew")

        self.algorithm_var = tk.StringVar(value="ALNS Algorithm")
        ttk.Radiobutton(algorithm_frame, text="Simulated Annealing Algorithm", variable=self.algorithm_var, value="Simulated Annealing Algorithm").grid(row=0, column=0, padx=5, pady=5)
        ttk.Radiobutton(algorithm_frame, text="Tabu Search Algorithm", variable=self.algorithm_var, value="Tabu Search Algorithm").grid(row=0, column=1, padx=5, pady=5)
        ttk.Radiobutton(algorithm_frame, text="ALNS Algorithm", variable=self.algorithm_var, value="ALNS Algorithm").grid(row=0, column=2, padx=5, pady=5)

        # Simulated Annealing Parameters
        sa_frame = ttk.Frame(algorithm_frame)
        sa_frame.grid(row=1, column=0, padx=5, pady=5)
        ttk.Label(sa_frame, text="Iteration Number").grid(row=0, column=0, padx=5, pady=5)
        self.sa_iterations = ttk.Entry(sa_frame)
        self.sa_iterations.grid(row=0, column=1, padx=5, pady=5)
        self.sa_iterations.insert(0, "25000")

        ttk.Label(sa_frame, text="Initial Temperature").grid(row=1, column=0, padx=5, pady=5)
        self.sa_initial_temp = ttk.Entry(sa_frame)
        self.sa_initial_temp.grid(row=1, column=1, padx=5, pady=5)
        self.sa_initial_temp.insert(0, "10000")

        ttk.Label(sa_frame, text="Cooling Rate").grid(row=2, column=0, padx=5, pady=5)
        self.sa_alpha = ttk.Entry(sa_frame)
        self.sa_alpha.grid(row=2, column=1, padx=5, pady=5)
        self.sa_alpha.insert(0, "0.9980")

        # Tabu Search Parameters
        ts_frame = ttk.Frame(algorithm_frame)
        ts_frame.grid(row=1, column=1, padx=5, pady=5)
        ttk.Label(ts_frame, text="Iteration Number").grid(row=0, column=0, padx=5, pady=5)
        self.ts_iterations = ttk.Entry(ts_frame)
        self.ts_iterations.grid(row=0, column=1, padx=5, pady=5)
        self.ts_iterations.insert(0, "100000")

        ttk.Label(ts_frame, text="Tabu List Length").grid(row=1, column=0, padx=5, pady=5)
        self.ts_tabu_length = ttk.Entry(ts_frame)
        self.ts_tabu_length.grid(row=1, column=1, padx=5, pady=5)
        self.ts_tabu_length.insert(0, "5")

        ttk.Label(ts_frame, text="Candidate List Size").grid(row=2, column=0, padx=5, pady=5)
        self.ts_candidate_size = ttk.Entry(ts_frame)
        self.ts_candidate_size.grid(row=2, column=1, padx=5, pady=5)
        self.ts_candidate_size.insert(0, "10")

        # ALNS Parameters
        alns_frame = ttk.Frame(algorithm_frame)
        alns_frame.grid(row=1, column=2, padx=5, pady=5)
        ttk.Label(alns_frame, text="Iteration Number").grid(row=0, column=0, padx=5, pady=5)
        self.alns_iterations = ttk.Entry(alns_frame)
        self.alns_iterations.grid(row=0, column=1, padx=5, pady=5)
        self.alns_iterations.insert(0, "2000")

        ttk.Label(alns_frame, text="Initial Temperature").grid(row=1, column=0, padx=5, pady=5)
        self.alns_initial_temp = ttk.Entry(alns_frame)
        self.alns_initial_temp.grid(row=1, column=1, padx=5, pady=5)
        self.alns_initial_temp.insert(0, "10000")

        ttk.Label(alns_frame, text="Cooling Rate").grid(row=2, column=0, padx=5, pady=5)
        self.alns_alpha = ttk.Entry(alns_frame)
        self.alns_alpha.grid(row=2, column=1, padx=5, pady=5)
        self.alns_alpha.insert(0, "0.9980")

        ttk.Label(alns_frame, text="Maximum Iterations without Improvement").grid(row=3, column=0, padx=5, pady=5)
        self.alns_N = ttk.Entry(alns_frame)
        self.alns_N.grid(row=3, column=1, padx=5, pady=5)
        self.alns_N.insert(0, "4")

        ttk.Label(alns_frame, text="Predefined Iteration Interval").grid(row=4, column=0, padx=5, pady=5)
        self.alns_K = ttk.Entry(alns_frame)
        self.alns_K.grid(row=4, column=1, padx=5, pady=5)
        self.alns_K.insert(0, "8")

        ttk.Label(alns_frame, text="Weights Update Interval").grid(row=5, column=0, padx=5, pady=5)
        self.alns_Z = ttk.Entry(alns_frame)
        self.alns_Z.grid(row=5, column=1, padx=5, pady=5)
        self.alns_Z.insert(0, "4")

        # Objective Functions Frame
        objective_frame = ttk.LabelFrame(root, text="Objective Functions")
        objective_frame.grid(row=2, column=0, columnspan=2, padx=10, pady=10, sticky="ew")

        self.objective_var = tk.StringVar(value="total_distance")
        ttk.Radiobutton(objective_frame, text="Minimize Total Distance", variable=self.objective_var, value="total_distance").grid(row=0, column=0, padx=5, pady=5)
        ttk.Radiobutton(objective_frame, text="Minimize Total Time", variable=self.objective_var, value="total_time").grid(row=0, column=1, padx=5, pady=5)
        ttk.Radiobutton(objective_frame, text="Minimize Total Energy", variable=self.objective_var, value="total_energy").grid(row=0, column=2, padx=5, pady=5)
        ttk.Radiobutton(objective_frame, text="Minimize Total Tardiness", variable=self.objective_var, value="total_tardiness").grid(row=0, column=3, padx=5, pady=5)

        # Action Buttons
        action_frame = ttk.Frame(root)
        action_frame.grid(row=3, column=0, columnspan=2, padx=10, pady=10, sticky="ew")

        ttk.Button(action_frame, text="Get Solution", command=self.get_solution).grid(row=0, column=0, padx=5, pady=5)
        ttk.Button(action_frame, text="Clear Solution", command=self.clear_solution).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(action_frame, text="Show Solution Form", command=self.show_solution_form).grid(row=0, column=2, padx=5, pady=5)

        # Initialize best_solution
        self.best_solution = None

    def get_solution(self):
        parameters = {}
        parameters["load_capacity"] = float(self.load_capacity.get())
        parameters["tank_capacity"] = float(self.tank_capacity.get())
        parameters["vmax"] = float(self.vmax.get())
        parameters["vmin"] = float(self.vmin.get())
        parameters["charge_option"] = self.charging_var.get()
        parameters["obj_function_option"] = self.objective_var.get()

        if self.algorithm_var.get() == "Simulated Annealing Algorithm":
            parameters["maxIterations"] = int(self.sa_iterations.get())
            parameters["initial_temperature"] = float(self.sa_initial_temp.get())
            parameters["cooling_rate"] = float(self.sa_alpha.get())

        elif self.algorithm_var.get() == "Tabu Search Algorithm":
            parameters["maxIterations"] = int(self.ts_iterations.get())
            parameters["tabu_length"] = int(self.ts_tabu_length.get())
            parameters["candidate_size"] = int(self.ts_candidate_size.get())

        elif self.algorithm_var.get() == "ALNS Algorithm":
            parameters["maxIterations"] = int(self.alns_iterations.get())
            parameters["initial_temperature"] = float(self.alns_initial_temp.get())
            parameters["cooling_rate"] = float(self.alns_alpha.get())
            parameters["N"] = int(self.alns_N.get())
            parameters["K"] = int(self.alns_K.get())
            parameters["Z"] = int(self.alns_Z.get())

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
        self.root.geometry("800x600")

        self.best_solution = best_solution[0]  # İlk çözümü alıyoruz

        columns = ("Route ID", "Total Distance", "Total Time", "Number of Deliveries")
        self.tree = ttk.Treeview(root, columns=columns, show='headings')
        for col in columns:
            self.tree.heading(col, text=col)
        self.tree.pack(fill="both", expand=True)

        # Rotaları listeye ekleme
        for idx, route in enumerate(self.best_solution.routes):
            total_distance = route.calculate_total_distance()
            total_time = route.calculate_total_time()
            num_deliveries = len(route.get_customers())

            self.tree.insert("", "end", iid=idx, values=(f"Route {idx+1}", total_distance, total_time, num_deliveries))

        # Seçim yapıldığında çağrılacak fonksiyon
        self.tree.bind("<<TreeviewSelect>>", self.on_route_select)

        # Harita ve Gantt şeması butonları
        button_frame = ttk.Frame(root)
        button_frame.pack(fill="x", pady=10)
        ttk.Button(button_frame, text="Show Selected Route on Map", command=self.show_selected_route_on_map).pack(side="left", padx=10)
        ttk.Button(button_frame, text="Gantt Chart for Selected Route", command=self.show_gantt_chart_single_line).pack(side="left", padx=10)
        ttk.Button(button_frame, text="Show All Routes on Gantt Chart", command=self.show_all_routes_gantt_chart).pack(side="left", padx=10)

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
        details_window.geometry("600x400")

        # Detayları gösterme
        text = tk.Text(details_window)
        text.pack(fill="both", expand=True)

        # Rotadaki noktaların bilgilerini yazdırma
        for idx, point in enumerate(route.route):
            point_info = f"Index: {idx}\n"
            point_info += f"Point ID: {point.id}\n"
            point_info += f"Location: ({point.x}, {point.y})\n"
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

        # İlk noktanın enlem ve boylamını alıyoruz
        start_lat = route.route[0].lat if hasattr(route.route[0], 'lat') else route.route[0].y
        start_lon = route.route[0].lon if hasattr(route.route[0], 'lon') else route.route[0].x

        m = folium.Map(location=[start_lat, start_lon], zoom_start=13)

        # Rotadaki noktaları işaretleme
        for point in route.route:
            lat = point.lat if hasattr(point, 'lat') else point.y
            lon = point.lon if hasattr(point, 'lon') else point.x
            folium.Marker([lat, lon], popup=f"Point ID: {point.id}").add_to(m)

        # Rotayı çizme
        route_coords = [(point.lat if hasattr(point, 'lat') else point.y,
                         point.lon if hasattr(point, 'lon') else point.x) for point in route.route]
        folium.PolyLine(route_coords, color="blue", weight=2.5, opacity=1).add_to(m)

        # Haritayı HTML olarak kaydetme ve açma
        map_file = "route_map.html"
        m.save(map_file)
        webbrowser.open(map_file)

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

        fig, ax = plt.subplots(figsize=(12, 6))  # Figür boyutunu artırdık
        y_position = 10  # Teslimatlar ve depolar aynı yatay çizgide olacak

        for node_id, node in enumerate(route.route):


            if type(node) == Customer:
                print("----------------------------------------------------------------------------")
                arrival_time = route.calculate_arrived_time(node)
                
                
                service_time = node.service_time
                end_time = arrival_time + service_time
                ready_time = node.ready_time
                # waiting_time = max(ready_time - arrival_time, 0)
                waiting_time = 0
                due_date = node.due_date
                print(f"Node {node.id} arrival time: {arrival_time}, waiting_time: {waiting_time} service time: {service_time}, ready time: {ready_time}, due date: {due_date}")

                if waiting_time > 0:
                    ax.broken_barh(
                        [(arrival_time, waiting_time)],
                        (y_position, 9),  # Müşteriler için daha küçük yükseklik
                        facecolors="gray",
                        edgecolors='black'
                    )
                    ax.text(arrival_time + waiting_time / 2, y_position + 4.5, "",
                            ha='center', va='center', color='black', fontsize=8)

                ax.broken_barh(
                    [(arrival_time + waiting_time, service_time)],
                    (y_position, 9),  # Müşteriler için daha küçük yükseklik
                    facecolors=customer_color,
                    edgecolors='black'
                )
                ax.text(arrival_time + waiting_time + service_time / 2, y_position + 4.5, f"{node.id}",
                        ha='center', va='center', color='black', fontsize=8)
                
            elif type(node) == ChargeStation:
                cs_arrival_time = route.calculate_arrived_time(node)
                cs_duration = node.service_time
                ax.broken_barh(
                    [(cs_arrival_time, cs_duration)],
                    (y_position, 9),  # Şarj istasyonları için farklı bir y pozisyonu
                    facecolors=charge_station_color,
                    edgecolors='black'
                )
                ax.text(cs_arrival_time + cs_duration / 2, y_position + 4.5, f"{node.id}",
                        ha='center', va='center', color='black', fontsize=8)

            elif type(node) == Target:
                if node_id == 0:
                    arrival_time = -50
                    service_time = 50
                    end_time = arrival_time + service_time
                    

                    ax.broken_barh(
                        [(arrival_time, service_time)],
                        (y_position, 9),  # Müşteriler için daha küçük yükseklik
                        facecolors=depot_color,
                        edgecolors='black'
                    )
                    ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
                    
                else:
                    arrival_time = route.calculate_arrived_time(node)
                    service_time = 50
                    end_time = arrival_time + service_time
                    

                    ax.broken_barh(
                        [(arrival_time, service_time)],
                        (y_position, 9),  # Müşteriler için daha küçük yükseklik
                        facecolors=depot_color,
                        edgecolors='black'
                    )
                    ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
            

        ax.set_xlabel('Time')
        ax.set_ylabel('Deliveries, Charging Stations and Depots')
        ax.set_yticks([])

        # Grid ekleme
        ax.set_axisbelow(True)  # Grid'i verilerin arkasında tutar
        ax.grid(True, which='both', axis='x', linestyle='--', linewidth=0.5, color='gray', alpha=0.7)

        # Legend oluşturma
        legend_elements = [
            plt.Rectangle((0,0),1,1, color=customer_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=charge_station_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=depot_color, edgecolor='black')
        ]
        legend_labels = ["Müşteri", "Şarj İstasyonu", "Depo"]

        ax.legend(legend_elements, legend_labels, title="Entities", bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.title('Gantt Chart for Selected Route with Charging Stations and Depots')
        plt.tight_layout()
        plt.show()
        plt.close(fig)  # Figürü kapatıyoruz









    def show_all_routes_gantt_chart(self):
        plt.close('all')  # Mevcut tüm figürleri kapatıyoruz
        fig, ax = plt.subplots(figsize=(15, 12))  # Figür boyutunu artırdık
        y_base = 0  # Başlangıç y pozisyonu

        # Renk tanımlamaları
        # Renk tanımlamaları
        customer_color = 'red'
        charge_station_color = 'green'
        depot_color = 'blue'

        y_position = 10  # Teslimatlar ve depolar aynı yatay çizgide olacak

        cs_pos  = -10
        cs_dict = {}
        
        for route_idx, route in enumerate(self.best_solution.routes):
            y_position = y_base
            for node_id, node in enumerate(route.route):


                if type(node) == Customer:
                   # print("----------------------------------------------------------------------------")
                    arrival_time = route.calculate_arrived_time(node)
                    
                    
                    service_time = node.service_time
                    end_time = arrival_time + service_time
                    ready_time = node.ready_time
                    # waiting_time = max(ready_time - arrival_time, 0)
                    waiting_time = 0
                    due_date = node.due_date
                    #print(f"Node {node.id} arrival time: {arrival_time}, waiting_time: {waiting_time} service time: {service_time}, ready time: {ready_time}, due date: {due_date}")

                    if waiting_time > 0:
                        ax.broken_barh(
                            [(arrival_time, waiting_time)],
                            (y_position, 9),  # Müşteriler için daha küçük yükseklik
                            facecolors="gray",
                            edgecolors='black'
                        )
                        ax.text(arrival_time + waiting_time / 2, y_position + 4.5, "",
                                ha='center', va='center', color='black', fontsize=8)

                    ax.broken_barh(
                        [(arrival_time + waiting_time, service_time)],
                        (y_position, 9),  # Müşteriler için daha küçük yükseklik
                        facecolors=customer_color,
                        edgecolors='black'
                    )
                    ax.text(arrival_time + waiting_time + service_time / 2, y_position + 4.5, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
                    
                elif type(node) == ChargeStation:
                    cs_arrival_time = route.calculate_arrived_time(node)
                    cs_duration = node.service_time
                    ax.broken_barh(
                        [(cs_arrival_time, cs_duration)],
                        (y_position, 9),  # Şarj istasyonları için farklı bir y pozisyonu
                        facecolors=charge_station_color,
                        edgecolors='black'
                    )
                    ax.text(cs_arrival_time + cs_duration / 2, y_position + 4.5, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)
                    
                    ##ALtta bir daha gösteriyorum
                    ax.broken_barh(
                        [(cs_arrival_time, cs_duration)],
                        (-19.5, 9),  # Şarj istasyonları için farklı bir y pozisyonu
                        facecolors=charge_station_color,
                        edgecolors='black'
                    )
                    cs_dict[node.id] = [cs_arrival_time, cs_duration]
                    ax.text(cs_arrival_time + cs_duration / 2, -19.5 + 4.5, f"{node.id}",
                            ha='center', va='center', color='black', fontsize=8)

                elif type(node) == Target:
                    if node_id == 0:
                        arrival_time = -50
                        service_time = 50
                        end_time = arrival_time + service_time
                        

                        ax.broken_barh(
                            [(arrival_time, service_time)],
                            (y_position, 9),  # Müşteriler için daha küçük yükseklik
                            facecolors=depot_color,
                            edgecolors='black'
                        )
                        ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                                ha='center', va='center', color='black', fontsize=8)
                        
                    else:
                        arrival_time = route.calculate_arrived_time(node)
                        service_time = 50
                        end_time = arrival_time + service_time
                        

                        ax.broken_barh(
                            [(arrival_time, service_time)],
                            (y_position, 9),  # Müşteriler için daha küçük yükseklik
                            facecolors=depot_color,
                            edgecolors='black'
                        )
                        ax.text(arrival_time + service_time / 2, y_position + 4.5, f"{node.id}",
                                ha='center', va='center', color='black', fontsize=8)
                    
            # Rota etiketini y eksenine ekleyelim
            ax.text(-250, y_position + 7.5, f"Vehicle {route_idx+1}", ha='right', va='center', fontsize=8)
             
            for item in cs_dict.keys():
                if cs_dict[item] is not None: 
                    ax.broken_barh(
                        [(cs_dict[item][0], cs_dict[item][1])],
                        (cs_pos, 9),  # ��arj istasyonları için farklı bir y pozisyonu
                        facecolors=charge_station_color,
                        edgecolors='black'
                    )
                    ax.text(-250, cs_pos - 7.5, f"CS {cs_dict[item]}", ha='right', va='center', fontsize=8)

            y_base += 45  # Bir sonraki rota için y pozisyonunu artırıyoruz

            cs_pos -= 45

        ax.set_xlabel('Time')
        ax.set_ylabel('Routes, Charging Stations and Depots of Vehicles')

        # Grid ekleme
        ax.set_axisbelow(True)  # Grid'i verilerin arkasında tutar
        ax.grid(True, which='both', axis='x', linestyle='--', linewidth=0.5, color='gray', alpha=0.7)
        #ax.grid(True, which='both', axis='y', linestyle='--', linewidth=0.5, color='gray', alpha=0.7)

        ax.set_yticks([])

        # Legend oluşturma
        legend_elements = [
            plt.Rectangle((0,0),1,1, color=customer_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=charge_station_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color=depot_color, edgecolor='black'),
            plt.Rectangle((0,0),1,1, color='gray', edgecolor='black')
        ]
        legend_labels = ["Customer", "Charging Station", "Depot", "Waiting Time"]

        ax.legend(legend_elements, legend_labels, title="Entities", bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.title('Gantt Chart for All Routes with Charging Stations and Depots')
        plt.tight_layout()
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
