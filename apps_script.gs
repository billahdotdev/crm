// ════════════════════════════════════════════════
//  Lead Engine v4 — Google Apps Script Backend
//  File: apps_script.gs
// ════════════════════════════════════════════════
//
//  DEPLOY INSTRUCTIONS:
//  1. Google Sheet খুলুন → Extensions → Apps Script
//  2. এই সম্পূর্ণ কোড paste করুন (পুরনো কোড মুছুন)
//  3. Deploy → New Deployment → Type: Web App
//  4. Execute as: Me
//  5. Who has access: Anyone
//  6. Deploy করুন → URL কপি করুন
//  7. lead_engine_v4.html-এর Setup screen-এ URL paste করুন
//
//  RE-DEPLOY (কোড change করলে):
//  Deploy → Manage deployments → Edit → New version → Deploy

const SHEET_NAME = 'Leads'; // Sheet tab-এর নাম (চাইলে বদলান)

// ── GET: Sheet থেকে সব lead পড়ুন ──
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Sheet না থাকলে তৈরি করুন
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    initHeaders(sheet);
    return ok([]);
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return ok([]); // শুধু header আছে

  const headers = rows[0].map(h => 
    String(h).toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });

  return ok(data);
}

// ── POST: সব lead sync করুন ──
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (body.action === 'syncAll') {
      // Sheet clear করে নতুন data লিখুন
      sheet.clear();
      initHeaders(sheet);

      const leads = body.leads || [];
      leads.forEach(l => {
        sheet.appendRow([
          l.id       || '',
          l.name     || '',
          l.industry || '',
          l.whatsapp || '',
          l.website  || '',
          l.speed    || 'NO',
          l.pixel    || 'NO',
          l.capi     || 'NO',
          l.auto     || 'NO',
          l.tier     || '',
          l.status   || '',
          Number(l.dealBDT) || 0,
          l.lastContact || '',
          l.followUp    || '',
          l.loomLink    || '',
          l.notes       || ''
        ]);
      });

      // Auto-format: column width adjust
      try {
        sheet.autoResizeColumns(1, 16);
      } catch(fe) { /* ignore */ }

      return ok({ synced: leads.length, timestamp: new Date().toISOString() });
    }

    return ok({ msg: 'unknown action' });

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── HELPER: Header row তৈরি করুন ──
function initHeaders(sheet) {
  const headers = [
    'ID', 'Name', 'Industry', 'WhatsApp', 'Website',
    'Speed', 'Pixel', 'CAPI', 'Auto',
    'Tier', 'Status', 'DealBDT',
    'LastContact', 'FollowUp', 'LoomLink', 'Notes'
  ];
  sheet.appendRow(headers);

  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setFontWeight('bold')
    .setBackground('#0a0e17')
    .setFontColor('#00e5a0')
    .setFontFamily('JetBrains Mono');

  sheet.setFrozenRows(1);

  // Column widths (approximate)
  const widths = [120,180,120,130,200,60,60,60,60,80,100,90,110,110,200,250];
  widths.forEach((w, i) => {
    try { sheet.setColumnWidth(i+1, w); } catch(e) {}
  });
}

// ── HELPER: JSON response ──
function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
