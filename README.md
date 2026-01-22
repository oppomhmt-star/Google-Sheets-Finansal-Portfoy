# 📊 Google Sheets Finansal Portföy Takip (Altın, Döviz & TEFAS)

Bu proje, Google E-Tablolar (Sheets) üzerinde **Altın, Döviz, Emtia ve TEFAS Yatırım Fonlarını** anlık ve geçmişe dönük olarak takip etmenizi sağlayan kapsamlı bir Google Apps Script paketidir.

Scriptler, **Truncgil API** ve **TEFAS (Devlet verileri)** üzerinden verileri çeker, otomatik tablolar oluşturur ve size özel bir menü ile kolay yönetim sağlar.

## 📂 Dosya İçeriği

*   `AltinDoviz.gs`: Altın ve döviz kurlarını çeken, tabloyu biçimlendiren ana fonksiyonları içerir.
*   `TefasFon.gs`: TEFAS üzerinden yatırım fonu verilerini çeken ve **Menü** yapısını oluşturan kodları içerir.

## 🌟 Özellikler

### 1. 🥇 Altın ve Döviz Takibi
*   **Veri Kaynağı:** Truncgil Finans API.
*   **Varlıklar:** Dolar, Euro, Sterlin, Gram Altın, Çeyrek, Cumhuriyet, Gümüş, Platin vb.
*   **Özellikler:**
    *   `ALTIN_FIYATLARI` adında otomatik sayfa oluşturur.
    *   Alış/Satış fiyatlarını ve günlük değişim yüzdelerini çeker.
    *   **Akıllı ONS Koruması:** Eğer API'den ONS verisi gelmezse, otomatik olarak `XAUT` (Tether Gold) verisini kullanarak tablonun bozulmasını engeller.
    *   Otomatik renklendirme (Yeşil/Kırmızı) ile piyasa yönünü gösterir.

### 2. 🔍 TEFAS Yatırım Fonu Analizi
*   **Veri Kaynağı:** TEFAS (Türkiye Elektronik Fon Dağıtım Platformu).
*   **Özellikler:**
    *   **Detaylı Analiz:** Fonun son fiyatı, kişi sayısı, portföy büyüklüğü ve getirilerini (Günlük, 1 Ay, 3 Ay, 6 Ay, 1 Yıl) `FON_DETAY` sayfasına işler.
    *   **Geçmiş Veriler:** Her fon için (örn. `TJB`, `AFT`) ayrı bir sayfa oluşturarak geçmiş tarihli fiyat kapanışlarını listeler.
    *   **Menü Entegrasyonu:** Fon kodunu menüden girerek kolayca ekleme yapabilirsiniz.

## 🚀 Kurulum

Bu projeyi kullanmak için herhangi bir yazılım indirmenize gerek yoktur.

1.  **Google Sheets Açın:** [sheets.new](https://sheets.new) adresinden yeni bir tablo oluşturun.
2.  **Script Editörünü Başlatın:** Üst menüden `Uzantılar` > `Apps Script` yolunu izleyin.
3.  **Dosyaları Oluşturun:**
    *   Sol taraftaki `Dosyalar` bölümünde `+` butonuna basarak iki adet Script dosyası oluşturun: `AltinDoviz` ve `TefasFon`.
    *   Bu depodaki kodları ilgili dosyalara yapıştırın.
    *   *(Not: İki kodu tek bir dosyaya alt alta da yapıştırabilirsiniz, çalışacaktır.)*
4.  **Kaydedin:** `CTRL + S` ile projeyi kaydedin.
5.  **Sayfayı Yenileyin:** Google E-Tablolar sayfanızı (F5) yenileyin. Üst menüde özel menülerin belirdiğini göreceksiniz.

## 🎮 Nasıl Kullanılır?

### Menü 1: 🔍 TEFAS Fon İşlemleri
*   **Verileri Getir:** Tıkladığınızda bir kutucuk açılır. Fon kodunu (Örn: `MAC`, `YAS`, `TJB`) yazıp onayladığınızda veriler çekilir.
*   **Kullanım Bilgisi:** Kısa yardım metnini gösterir.

### Menü 2: 🥇 Altın Takip
*   **Fiyatları Güncelle:** Altın ve döviz kurlarını anlık olarak günceller ve `ALTIN_FIYATLARI` sayfasına yazar.

### Otomatik Güncelleme (Tetikleyici)
Verilerin (özellikle Altın/Döviz) her saat başı otomatik güncellenmesini istiyorsanız:
1.  Apps Script editöründe sol menüden **Tetikleyiciler (Saat ikonu)** kısmına gidin.
2.  **Tetikleyici Ekle** butonuna basın.
3.  Fonksiyon: `getAltinInPrices` -> Etkinlik Kaynağı: `Zamana Dayalı` -> Tür: `Saat Zamanlayıcı` -> `Her Saat` seçip kaydedin.

## ⚠️ Yasal Uyarı
Bu proje eğitim ve kişisel kullanım amaçlıdır. Finansal veriler 3. taraf kaynaklardan (`truncgil.com` ve `tefas.gov.tr`) sağlanmaktadır. Verilerin doğruluğu, gecikmesi veya API/Site yapısının değişmesi durumunda sorumluluk kabul edilmez. Yatırım kararlarınızı sadece bu verilere dayanarak vermeyiniz.

## 📄 Lisans
[MIT License](LICENSE)
