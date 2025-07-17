# Python 3.11 kullanacağız
FROM python:3.11.7-slim

# Sistem bağımlılıklarını yükle (SUMO dahil)
RUN apt-get update && \
    apt-get install -y sumo sumo-tools libgl1 curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini belirleyelim
WORKDIR /app

# Gereksinim dosyasını konteynere ekleyelim
COPY requirements.txt /app/requirements.txt

# Python bağımlılıklarını yükleyelim
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyalayalım
COPY . /app

# Uygulamanın çalıştığı portu belirtelim
EXPOSE 8005

# Özel fonksiyonu oluşturma ve örnek verileri oluştur
RUN python -c "import os; os.path.exists('SampleData') or __import__('create_sample_data').main()"

# FastAPI uygulamanızı başlatmak için komut
CMD uvicorn server:app --host ${API_HOST:-0.0.0.0} --port ${API_PORT:-8005} --log-level ${LOG_LEVEL:-info}
