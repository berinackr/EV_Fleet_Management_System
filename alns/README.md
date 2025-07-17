# Adaptive Large Neighborhood Search Algorithm Implementation on EVRP

Bu proje OPEVA(OPtimization of Electic Vehicle Autonomy) projesi kapsamında geliştirilmekte ve 
Avrupa Birliği'nin Horizon Europe Programı ve Ulusal Otoriteler (Fransa, Belçika, Çekya, İtalya, Portekiz, Türkiye, İsviçre) tarafından yürütülen Anahtar Dijital Teknolojiler Ortak Girişimi (KDT JU) kapsamında finanse edilmektedir. Türkiye Bilimsel ve Teknik Araştırma Kurumu (TÜBİTAK), 222N269 numaralı sözleşme, “OPtimization of Electric Vehicle Autonomy (OPEVA)”  proje başlığı ile desteklenmektedir.


## Versionlar : 

detay için : [Notion](https://dawn-squash-710.notion.site/Yaz-l-m-Versiyonlar-8bca6a2f933942e3bfa0e08fef4034c6?pvs=4)

| Versiyon Numarası | Tarih | Değişiklikler | Durum | Bağlantılar |
| --- | --- | --- | --- | --- |
| v1 |  | Çok yavaş ve bozuk sürüm | Tamamlandı | [main branch](https://github.com/aalperenpolat/alnsesogutest_v1/tree/main)  |
| v2 | 22.04.2024 | Düzeltilmiş fakat hala yavaş sürüm | Tamamlandı | [test_v4_changingTheOperators_RealBranch](https://github.com/aalperenpolat/alnsesogutest_v1/tree/test_v4_changingTheOperators_RealBranch) |
| v3.0 | 15.05.2024 | Sadece SA (swap ops.), en iyi 10 çözüm Repair edilir.  | Tamamlandı | [version_3.0](https://github.com/aalperenpolat/alnsesogutest_v1/tree/version_3.0) |
| V3.1  | 17.05.2024 | Sadece SA (swap ops.), her iterasyon Repair edilir  | Tamamlandı | [version_3.1](https://github.com/aalperenpolat/alnsesogutest_v1/tree/version_3.01) |
| v4.0 | 11.06.2024 | Alns yapısına dönüldü, CI operatörleri optimize ve aşırı hızlı. R60 ve RC60 data düzeltmesi, Repair işlemi devam ediyor | Tamamlandı | [version_4.0](https://github.com/aalperenpolat/ALNS/tree/version_4.0) |
| v4.1 | 19.07.2024 | 8 adet LS operaörü/2 Swap ve energy matrix küçükleme, total time küçüklem, Repair işlemi devam ediyor, | Tamamlandı | [version_4.1](https://github.com/aalperenpolat/ALNS/tree/version_4.0) |
| v5.0 | 11.06.2024 | Repair işlemi yerine iterasyonda SI ve SR işlemleri, Yeni v3 verileri, farklı operatörler ve şarj stratejileri(PC, 20-80), hem distance hem energy için yapı  | Tamamlandı | [version_5.0](https://github.com/aalperenpolat/ALNS/tree/version_5.0) |
| v5.1 | 11.06.2024 | Kod optimizasyonu, operatörlerin düzenlenmesi, klasörlerin düzenlenmesi, total tardiness fonksiyonu, UI ile arda taraf bağlandı, tamamen XML ile çalıştırılabilme  | Tamamlandı | [version_5.0](https://github.com/aalperenpolat/ALNS/tree/version_5.1) |


### Proje Amacı 

Bu projenin amacı Akıllı Şehirler ve Akıllı Ulaşım Sistemleri kapsamında Elektrikli Araçların Menzil Problemlerinin Optimizasyonu üzerine çalışmaktır. Bu kapsamda elektrikli araçların menzil problemlerinin çözümüne yönelik olarak geliştirilen algoritmaların performanslarının arttırılması ve gerçek zamanlı çözümler üretebilmesi hedeflenmektedir. Bu doğrultuda, Elektrikli Araçların Menzil Problemlerinin Optimizasyonu üzerine çalışan araştırmacılar ve endüstriyel paydaşlar için bir destek sistemi geliştirilmesi planlanmaktadır. Bu sistem, elektrikli araçların menzil, süre ve şarj gibi problemlerinin çözümüne yönelik olarak kullanılacaktır.

### Ortam 

Bu projede Osmangazi Üniversitesi Meşelik Kampüsü haritasında tanımlanan talep noktaları ile problem setleri oluşturulmuştur. Bu problem setleri 5-10-20-40-60 nokta içermektedir. Bu noktalar birer müşteri gibi düşünülerek talep miktarları ve teslimat süreleri tanımlanmıştır. Her bir noktanın belirli bilgileri bulunmaktadır. Bunlar : 
- No : Müşteri numarası 
- X : X Koordinatı
- Y : Y Koordinatı
- latitude : Enlem
- longitude : Boylam
- type : Müşteri tipi 
- name : Müşteri adı
  
bilgilerini içermektedir. Ayrıca her point bir talep bilgileri de içermektedir. Bu bilgiler :


- Product : Teslim edilecek ürün tipi
- Quantity : ??Teslim edilecek ürün miktarı
- ReadyTime : Teslimatın yapılmaya hazır olduğu zaman
- ServiceTime : Teslimatın yapılması için gereken süre
- DueDate : Teslimatın yapılması gereken son tarih
- TotalWeight : Teslim edilecek ürünün toplam ağırlığ

olmaktadır. Bu bilgiler bir XML işaretleme dili kullanılarak belirli formatlarda tanımlanmıştır.
Aşağıda bir örnek problem seti verilmiştir. 

```xml
<?xml version="1.0" encoding="UTF-8"?>

<Points>
    Talep olan noktalar
    <Point No="121" X="5182.387" Y="2937.322" lat="39.751670617892714" lon="30.480416670013025" Name="cs5" Type="Entrance" />
    <Point No="121" X="5182.387" Y="2937.322" lat="39.751670617892714" lon="30.480416670013025" Name="cs5" Type="Exit" />
    <Point No="121" X="5182.387" Y="2937.322" lat="39.751670617892714" lon="30.480416670013025" ChargingTime="900" Name="cs5" Type="DepoCharging" />

    <Point No="2" X="6202.75" Y="2938.383" lat="39.751938002852754" lon="30.49231551642376" Type="Delivery" Name="2">
        <Requests>
            <Request Product="A" Quantity="5" DueDate="303" TotalWeight="95" ServiceTime="120" ReadyTime="257" />
        </Requests>
    </Point>
    <Point No="37" X="5440.351" Y="2985.775" lat="39.752172063632734" lon="30.483409077029524" Type="Delivery" Name="39">
        <Requests>
            <Request Product="A" Quantity="1" DueDate="1578" TotalWeight="19" ServiceTime="120" ReadyTime="1523" />
        </Requests>
    </Point>
    . . . 
    Talep olmayan noktalar
    <Point No="1" X="6091.726" Y="3004.56" lat="39.75250570103818" lon="30.490999148931902" Type="Way" Name="1" />
    
    <Point No="3" X="5976.234" Y="2980.046" lat="39.75225589833148" lon="30.48966031185231" Type="Way" Name="3" />
    <Point No="4" X="6205.854" Y="2945.41" lat="39.752002037312934" lon="30.492349413277967" Type="Way" Name="4" />
    <Point No="5" X="6241.228" Y="3061.593" lat="39.75305678374528" lon="30.492723997544758" Type="Way" Name="5" />
    <Point No="6" X="5932.395" Y="2871.5" lat="39.75126775411403" lon="30.489184561590573" Type="Way" Name="6" />
    <Point No="7" X="5934.988" Y="2850.284" lat="39.75107743507831" lon="30.48922173857862" Type="Way" Name="7" />
    
</Points>  

```

### Algoritma

Rotalama için kullanılan ALNS (Adaptive Large Neighborhood Search) algoritması metasezgisel bire algoritmadır. Bu algoritma Ropke ve Pisinger tarafından 2006 yılında tanıtılmıştır. Large Neighborhood Search algoritmasının geliştirilmiş halidir. Algoritma detayları için :

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png" width="22"> ALNS Türkçe Dökümantasyon ](https://dawn-squash-710.notion.site/ALNS-T-rk-e-D-k-mantasyon-b4c494838d8248d59eb35130d3b827e2?pvs=4)



```python
config -> routing_problem_configuration = RoutingProblemConfiguration(
        tank_capacity,
        load_capacity,
        fuel_consumption_rate,
        charging_rate,
        velocity,
        requirements_dict
    )

```

```python

problem instance -> routing_problem_instance = RoutingProblemInstance(
    config, depot, customers, fuel_stations, fileName
)
```