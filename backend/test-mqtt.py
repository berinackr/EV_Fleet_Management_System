import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
from matplotlib.dates import DateFormatter

# CSV dosya yolu
csv_file = r'C:\Users\Administrator\Desktop\app\oguopeva\backend\log_report.csv'

# CSV'yi oku
df = pd.read_csv(csv_file)
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Binlik format fonksiyonu
def thousands(x, pos):
    return f'{int(x):,}'

# Stil ayarları (akademik uyum için büyüttüm)
plt.rcParams.update({
    'font.size': 14,
    'axes.labelsize': 15,
    'axes.titlesize': 18,
    'legend.fontsize': 13,
    'xtick.labelsize': 12,
    'ytick.labelsize': 12
})

# Grafik başlat
fig, ax1 = plt.subplots(figsize=(12, 8))

# Ana çizgiler (hakemlerin önerdiği renkler)
lns1 = ax1.plot(
    df['timestamp'],
    df['mqtt_messages'],
    label='MQTT Mesajları',
    color='#1f77b4',  # Koyu Mavi
    marker='o',
    markersize=6,
    linewidth=2.5
)
lns2 = ax1.plot(
    df['timestamp'],
    df['websocket_messages'],
    label='WebSocket Mesajları',
    color='#ff7f0e',  # Koyu Turuncu
    marker='s',
    markersize=6,
    linewidth=2.5
)
lns3 = ax1.plot(
    df['timestamp'],
    df['db_inserts'],
    label='Veritabanı Kayıtları',
    color='#2ca02c',  # Koyu Yeşil
    marker='^',
    markersize=6,
    linewidth=2.5
)

# Sol eksen ayarları
ax1.set_xlabel('Zaman (hh:mm)', fontweight='bold')
ax1.set_ylabel('Mesaj Sayısı (adet)', color='black', fontweight='bold')
ax1.tick_params(axis='y', labelcolor='black')
ax1.yaxis.set_major_formatter(FuncFormatter(thousands))
ax1.grid(True, linestyle='--', color='#bbbbbb', alpha=0.9, linewidth=1)

# X ekseni saat formatı ve sıkışmayı önleme
ax1.xaxis.set_major_formatter(DateFormatter('%H:%M'))
fig.autofmt_xdate()

# Sağ eksen: Başarı Oranı (yüksek kontrast)
ax2 = ax1.twinx()
lns4 = ax2.plot(
    df['timestamp'],
    df['success_rate'],
    label='Başarı Oranı (%)',
    color='#009E73',  # Açık Yeşil (hakem uyumu)
    linestyle='--',
    marker='D',
    markersize=6,
    linewidth=2.5
)
ax2.set_ylabel('Başarı Oranı (%)', color='#009E73', fontweight='bold')
ax2.tick_params(axis='y', labelcolor='#009E73')
ax2.set_ylim(99, 100.5)

# Başlık
plt.title(
    f"Mesaj Trafiği, Veritabanı Kayıtları ve Başarı Oranı Trendleri\n"
    f"Saat Aralığı: {df['timestamp'].iloc[0]:%H:%M} - {df['timestamp'].iloc[-1]:%H:%M}",
    fontsize=18,
    fontweight='bold'
)

# Legend
lns = lns1 + lns2 + lns3 + lns4
labs = [l.get_label() for l in lns]
leg = ax1.legend(lns, labs, loc='upper left', framealpha=0.95, fancybox=True, edgecolor='#333333')
leg.get_frame().set_facecolor('#f0f0f0')

# Sıkışma önleme ve alttaki tarih yazısını kaldır
plt.tight_layout()
plt.gcf().texts.clear()

# Kaydet (PDF önerilir)
plt.savefig('tam_aralik_grafik_akademik.pdf', dpi=600)
plt.savefig('tam_aralik_grafik_akademik.png', dpi=600)
plt.show()

# Konsola yazdır
print("Başlangıç:", df['timestamp'].iloc[0])
print("Bitiş    :", df['timestamp'].iloc[-1])
