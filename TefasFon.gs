// Google Sheets açıldığında üst menüyü oluşturur
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // TEFAS Fon Menüsü
  ui.createMenu('🔍 TEFAS Fon İşlemleri')
      .addItem('📊 Verileri Getir', 'verileriGetirMenuden')
      .addSeparator()
      .addItem('ℹ️ Kullanım Bilgisi', 'kullanımBilgisi')
      .addToUi();
      
  // ALTIN Menüsü
  ui.createMenu('🥇 Altın Takip')
    .addItem('🔄 Fiyatları Güncelle', 'getAltinInPrices')
    .addToUi();
}

// Menüden çağrıldığında fon kodu sorar
function verileriGetirMenuden() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    '🔍 TEFAS Fon Kodu Girin',
    'Çekmek istediğiniz fonun kodunu yazın (örn: AAK, TJB):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() == ui.Button.OK) {
    var fonKodu = response.getResponseText().trim().toUpperCase();
    
    if (fonKodu) {
      verileriGetir(fonKodu);
    } else {
      ui.alert('⚠️ Hata', 'Lütfen geçerli bir fon kodu girin.', ui.ButtonSet.OK);
    }
  }
}

// Kullanım bilgisi için yardımcı fonksiyon
function kullanımBilgisi() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('TEFAS Fon Verileri Çekici',
           '📌 Kullanım:\n\n' +
           '1. Menüden "TEFAS Fon İşlemleri > Verileri Getir" seçeneğine tıklayın\n\n' +
           '2. Açılan pencereye fon kodunu yazın (örn: AAK, TJB)\n\n' +
           '3. Veriler otomatik olarak çekilecek ve ilgili sayfalara yerleştirilecektir.\n\n' +
           '✅ Fon detayları FON_DETAY sayfasında\n' +
           '✅ Tarihsel veriler fon kodlu sayfada görüntülenir.',
           ui.ButtonSet.OK);
}

function verileriGetir(fonKodu) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  
  // Parametre olarak gelmezse N1'den al (geriye dönük uyumluluk için)
  if (!fonKodu) {
    fonKodu = activeSheet.getRange("N1").getValue();
  }
  
  if (!fonKodu) {
    SpreadsheetApp.getUi().alert("⚠️ Hata", "Lütfen bir Fon Kodu girin.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  fonKodu = fonKodu.toString().trim().toUpperCase();
  
  activeSheet.getRange("O1").setValue("Veriler çekiliyor: " + fonKodu);
  SpreadsheetApp.flush();
  
  try {
    var url = "https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=" + fonKodu;
    var options = {
      'method': 'get',
      'headers': { 'User-Agent': 'Mozilla/5.0' },
      'muteHttpExceptions': true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var html = response.getContentText();

    // ======================================================
    // 1. ADIM: GEÇMİŞ VERİLER (FON SAYFASINA)
    // ======================================================
    
    var dateMatch = html.match(/"categories":\[(.*?)\]/);
    var dates = [];
    if (dateMatch && dateMatch[1]) {
      dates = dateMatch[1].replace(/"/g, '').split(',');
    }

    var priceMatch = html.match(/"name":"Fiyat","data":\[(.*?)\]/);
    var prices = [];
    if (priceMatch && priceMatch[1]) {
      prices = priceMatch[1].split(',');
    }
    
    if (dates.length > 0 && prices.length > 0) {
      
      var tarihselVeri = [];
      for (var k = 0; k < dates.length; k++) {
        var p = parseFloat(prices[k]);
        if (p > 0.01) {
          tarihselVeri.push([dates[k], String(prices[k]).replace('.', ',')]);
        }
      }
      tarihselVeri.reverse(); // En yeni en üstte

      // --- SAYFA YÖNETİMİ ---
      var hedefSayfa = ss.getSheetByName(fonKodu);
      
      if (!hedefSayfa) {
        hedefSayfa = ss.insertSheet(fonKodu); 
        hedefSayfa.getRange("B25").setValue("Date").setFontWeight("bold");
        hedefSayfa.getRange("C25").setValue("Price").setFontWeight("bold");
      }
      
      hedefSayfa.getRange("B26:C").clearContent(); 
      
      if (tarihselVeri.length > 0) {
        hedefSayfa.getRange(26, 2, tarihselVeri.length, 2).setValues(tarihselVeri);
      }
    }

    // ======================================================
    // 2. ADIM: FON DETAYLARI (FON_DETAY SAYFASINA)
    // ======================================================

    var detaySheet = ss.getSheetByName("FON_DETAY");
    if (!detaySheet) {
      detaySheet = ss.insertSheet("FON_DETAY");
    }

    var basliklar = [
      "Fon Kodu", "Fon Adı", "Şemsiye Fon Türü", "Son Fiyat", "Günlük Getiri", 
      "1 Ay (%)", "3 Ay (%)", "6 Ay (%)", "1 Yıl (%)", 
      "Tedavüldeki Pay", "Kişi Sayısı", "Fon Toplam Değer"
    ];

    detaySheet.getRange(1, 1, 1, basliklar.length).setValues([basliklar]).setFontWeight("bold");

    // --- PARSER FONKSİYONLARI ---
    var getHtmlVal = function(keyword) {
      var regex = new RegExp(keyword + "[\\s\\S]*?<span[^>]*>(.*?)<\\/span>", "i");
      var m = html.match(regex);
      if (m && m[1]) {
        return m[1].replace(/<[^>]*>/g, "").replace("TL", "").trim();
      }
      return "-";
    };

    var toNum = function(val) {
      if (!val || val === "-" || val === "") return 0;
      return parseFloat(String(val).replace(/\./g, "").replace(",", ".")) || 0;
    };
    
    var toPerc = function(val) {
      if (!val || val === "-" || val === "") return 0;
      var clean = String(val).replace(/%/g, "").replace(/\./g, "").replace(",", ".");
      return (parseFloat(clean) / 100) || 0;
    };

    var fonAdiMatch = html.match(/id="MainContent_FormViewMainIndicators_LabelFund">(.*?)<\/span>/);
    var fonAdi = fonAdiMatch ? fonAdiMatch[1].trim() : "-";

    var satirVerisi = [
      fonKodu, 
      fonAdi, 
      getHtmlVal("Kategorisi"),
      toNum(getHtmlVal("Son Fiyat")), 
      toPerc(getHtmlVal("Günlük Getiri")),
      toPerc(getHtmlVal("Son 1 Ay Getirisi")),
      toPerc(getHtmlVal("Son 3 Ay Getirisi")),
      toPerc(getHtmlVal("Son 6 Ay Getirisi")),
      toPerc(getHtmlVal("Son 1 Yıl Getirisi")), 
      toNum(getHtmlVal("Pay \\(Adet\\)")), 
      toNum(getHtmlVal("Yatırımcı Sayısı")), 
      toNum(getHtmlVal("Fon Toplam Değer")) 
    ];

    // --- KAYIT İŞLEMİ ---
    var sonSatir = detaySheet.getLastRow();
    var mevcutKodlar = [];
    if (sonSatir > 1) {
      mevcutKodlar = detaySheet.getRange(2, 1, sonSatir - 1, 1).getValues();
    }
    
    var bulunduMu = false;
    var hedefSatir = -1;

    for (var i = 0; i < mevcutKodlar.length; i++) {
      if (mevcutKodlar[i][0].toString().trim() === fonKodu.toString().trim()) {
        bulunduMu = true;
        hedefSatir = i + 2;
        break;
      }
    }

    if (bulunduMu) {
      detaySheet.getRange(hedefSatir, 1, 1, satirVerisi.length).setValues([satirVerisi]);
      activeSheet.getRange("O1").setValue("✅ Güncellendi: " + fonKodu);
      SpreadsheetApp.getUi().alert("✅ Başarılı", "'" + fonKodu + "' fonu güncellendi!", SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      detaySheet.appendRow(satirVerisi);
      activeSheet.getRange("O1").setValue("✅ Eklendi: " + fonKodu);
      SpreadsheetApp.getUi().alert("✅ Başarılı", "'" + fonKodu + "' fonu eklendi!", SpreadsheetApp.getUi().ButtonSet.OK);
    }
    
  } catch (e) {
    SpreadsheetApp.getUi().alert("❌ Hata", "Veri çekilirken hata oluştu:\n\n" + e.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    activeSheet.getRange("O1").setValue("❌ Hata: " + fonKodu);
  }
}
