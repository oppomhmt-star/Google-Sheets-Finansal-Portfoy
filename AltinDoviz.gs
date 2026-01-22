/**
 * Truncgil Finans API üzerinden güncel altın ve döviz verilerini çeker.
 */
function getAltinInPrices() {
  const url = "https://finans.truncgil.com/v4/today.json";
  
  try {
    const response = UrlFetchApp.fetch(url, { 'muteHttpExceptions': true });
    const data = JSON.parse(response.getContentText());
    const zaman = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm");

    function parseNumber(val) {
      if (val === undefined || val === null || val === "") return 0;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    }
    
    function formatTR(num) {
      if (num === null || num === undefined || isNaN(num) || num === 0) return "-";
      return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const veriler = [];

    const hedefListesi = {
      // Dövizler
      "USD": "Dolar (TL)",
      "EUR": "Euro (TL)",
      "GBP": "Sterlin (TL)",
      
      // Altınlar ve Metaller
      "ONS": "Altın Ons ($)",
      "GRA": "Gram Altın",
      "HAS": "Gram Has Altın",
      "CEYREKALTIN": "Çeyrek Altın",
      "YARIMALTIN": "Yarım Altın",
      "TAMALTIN": "Tam Altın",
      "CUMHURIYETALTINI": "Cumhuriyet Altını",
      "ATAALTIN": "Ata Altın",
      "RESATALTIN": "Reşat Altın",
      "HAMITALTIN": "Hamit Altın",
      "IKIBUCUKALTIN": "İkibuçuk Altın",
      "GREMSEALTIN": "Gremse Altın",
      "BESLIALTIN": "Beşli Altın",
      "14AYARALTIN": "14 Ayar Altın",
      "18AYARALTIN": "18 Ayar Altın",
      "YIA": "22 Ayar Bilezik",
      "GUMUS": "Gümüş (TL/gr)",
      "GPL": "Gram Platin"
    };

    for (let key in hedefListesi) {
      if (data[key]) {
        const item = data[key];
        let alis = parseNumber(item.Buying);
        let satis = parseNumber(item.Selling);
        let degisim = item.Change !== undefined ? item.Change : 0;

        // --- ONS ÖZEL DÜZELTME (AKILLI YEDEK) ---
        // Eğer ONS fiyatı 0 geliyorsa, XAUT (Tether Gold) USD fiyatını kullan
        if (key === "ONS" && alis === 0 && satis === 0) {
          if (data["XAUT"] && data["XAUT"].USD_Price) {
            alis = parseNumber(data["XAUT"].USD_Price);
            satis = alis; // Genelde USD ONS için tek fiyat verilir
            degisim = data["XAUT"].Change || degisim;
          }
        }
        // ---------------------------------------

        veriler.push({
          ad: hedefListesi[key],
          alis: alis,
          satis: satis,
          durum: "%" + degisim.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
        });
      }
    }

    const oncelik = [
      "Altın Ons ($)", "Dolar (TL)", "Euro (TL)", "Sterlin (TL)",
      "Gümüş (TL/gr)", "Gram Altın", "Gram Has Altın", "Çeyrek Altın", 
      "Yarım Altın", "Tam Altın", "Cumhuriyet Altını", "22 Ayar Bilezik"
    ];
    
    const finalData = [["Varlık Adı", "Alış", "Satış", "Değişim %", "Son Güncelleme"]];
    
    const siraliListe = [
      ...oncelik.map(ad => veriler.find(v => v.ad === ad)).filter(Boolean),
      ...veriler.filter(v => !oncelik.includes(v.ad))
    ];

    siraliListe.forEach(v => {
      finalData.push([v.ad, formatTR(v.alis), formatTR(v.satis), v.durum, zaman]);
    });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("ALTIN_FIYATLARI");
    if (!sheet) sheet = ss.insertSheet("ALTIN_FIYATLARI");
    
    sheet.clear();
    sheet.getRange(1, 1, finalData.length, 5).setValues(finalData);
    
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#202124").setFontColor("white");
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 110);
    sheet.setColumnWidth(5, 140);
    sheet.getRange(2, 2, finalData.length - 1, 2).setHorizontalAlignment("right");
    sheet.getRange(1, 4, finalData.length, 2).setHorizontalAlignment("center");
    sheet.getRange(1, 1, finalData.length, 5).setBorder(true, true, true, true, true, true);

    for (let i = 2; i <= finalData.length; i++) {
      const range = sheet.getRange(i, 4);
      const val = range.getValue().toString();
      if (val.includes("-")) {
        range.setFontColor("#a50e0e").setBackground("#fce8e6");
      } else if (val !== "%0,00" && val !== "%0") {
        range.setFontColor("#0d652d").setBackground("#e6f4ea");
      }
    }

    Logger.log("Sistem başarıyla güncellendi (ONS Yedekli): " + zaman);

  } catch (e) {
    Logger.log("HATA OLUŞTU: " + e.message);
  }
}
