let receipts = [];

// โหลดข้อมูล JSON
async function loadReceipts() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้');
    receipts = await response.json();
    
    const selector = document.getElementById('receiptSelector');
    selector.innerHTML = '';
    
    if (receipts.length === 0) {
      selector.innerHTML = '<option value="">ไม่มีข้อมูล</option>';
      return;
    }
    
    receipts.forEach((receipt, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.text = receipt.requestNumber || `รายการที่ ${index + 1}`;
      selector.appendChild(option);
    });
    
    // แสดงรายการแรก
    if (receipts.length > 0) {
      generatePDF();
    }
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('receiptSelector').innerHTML = '<option value="">เกิดข้อผิดพลาดในการโหลดข้อมูล</option>';
    alert('เกิดข้อผิดพลาด: ' + error.message);
  }
}

// สร้าง HTML สำหรับใบเสร็จ
function generateReceiptHTML(data) {
  const qrCodeDiv = 'qrcode-' + Date.now();
  
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="" xml:lang="">
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <style type="text/css">
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('font CSS/subset-THSarabunNew-Bold.woff2') format('woff2'),
               url('font CSS/subset-THSarabunNew-Bold.woff') format('woff');
          font-weight: bold;
          font-style: normal;
        }
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('font CSS/subset-THSarabunNew.woff2') format('woff2'),
               url('font CSS/subset-THSarabunNew.woff') format('woff');
          font-weight: normal;
          font-style: normal;
        }
        p {margin: 0; padding: 0;}  
        .ft10{font-size:17px;font-family:'TH Sarabun New', Times;color:#000000;}
        .ft11{font-size:23px;font-family:'TH Sarabun New', Times;color:#000000;}
        .ft12{font-size:20px;font-family:'TH Sarabun New', Times;color:#000000;}
        .ft13{font-size:20px;font-family:'TH Sarabun New', Times;color:#000000;}
        .ft14{font-size:12px;font-family:'TH Sarabun New', Times;color:#000000;}
        .ft15{font-size:12px;line-height:23px;font-family:'TH Sarabun New', Times;color:#000000;}
      </style>
    </head>
    <body bgcolor="#A0A0A0" vlink="blue" link="blue">
      <div id="page1-div" style="position:relative;width:892px;height:1261px;">
        <img width="892" height="1261" src="bg.png" alt="background image"/>
        <div style="position: absolute; top: 945px; left: 123px; width: 100px; height: 100px;">
          <div id="${qrCodeDiv}" style="width: 80px; height: 80px;"></div>
        </div>
        <p style="position:absolute;top:148px;left:86px;white-space:nowrap" class="ft10">กรมการจัดหางาน</p>
        <p style="position:absolute;top:171px;left:88px;white-space:nowrap" class="ft10">กระทรวงแรงงาน</p>
        <p style="position:absolute;top:91px;left:397px;white-space:nowrap" class="ft11"><b>ใบเสร็จรับเงิน</b></p>
        <p style="position:absolute;top:121px;left:418px;white-space:nowrap" class="ft11"><b>ต้นฉบับ</b></p>
        <p style="position:absolute;top:61px;left:597px;white-space:nowrap" class="ft10">เลขที่&#160;&#160; ${data.เลขที่บนขวาใบเสร็จ || '2100680035190'}</p>
        <p style="position:absolute;top:150px;left:582px;white-space:nowrap" class="ft10">ที่ทำการ&#160;&#160; สำนักบริหารแรงงานต่างด้าว</p>
        <p style="position:absolute;top:189px;left:601px;white-space:nowrap" class="ft10">วันที่&#160;&#160; 06 มกราคม 2568</p>
        <p style="position:absolute;top:228px;left:539px;white-space:nowrap" class="ft10">เลขที่ใบชำระเงิน&#160;&#160; ${data.หมายเลขชำระเงิน || 'IV680329/002308'}</p>
        <p style="position:absolute;top:272px;left:60px;white-space:nowrap" class="ft10">เลขรับคำขอที่</p>
        <p style="position:absolute;top:272px;left:184px;white-space:nowrap" class="ft10">&#160; ${data.requestNumber || 'WP-68-1011897'}</p>
        <p style="position:absolute;top:311px;left:60px;white-space:nowrap" class="ft10">ชื่อผู้ชำระเงิน</p>
        <p style="position:absolute;top:311px;left:184px;white-space:nowrap" class="ft10">&#160; ${data.englishName || 'MRS.AYE SANDRA HTWE'}</p>
        <p style="position:absolute;top:311px;left:471px;white-space:nowrap" class="ft10">สัญชาติ&#160;&#160; ${data.nationality || 'เมียนมา'}</p>
        <p style="position:absolute;top:356px;left:60px;white-space:nowrap" class="ft10">เลขอ้างอิงคนต่างด้าว&#160;&#160; ${data.alienReferenceNumber || '2492102076039'}</p>
        <p style="position:absolute;top:356px;left:432px;white-space:nowrap" class="ft10">หมายเลขประจำตัวคนต่างด้าว&#160;&#160; ${data.personalID || '6682190040778'}</p>
        <p style="position:absolute;top:400px;left:60px;white-space:nowrap" class="ft10">ชื่อนายจ้าง / สถานประกอบการ&#160;&#160; บริษัท บานกง เอ็นจิเนียริ่ง จำกัด</p>
        <p style="position:absolute;top:439px;left:60px;white-space:nowrap" class="ft10">เลขประจำตัวนายจ้าง</p>
        <p style="position:absolute;top:438px;left:231px;white-space:nowrap" class="ft10">&#160; 0415567000061</p>
        <p style="position:absolute;top:527px;left:345px;white-space:nowrap" class="ft12"><b>รายการ</b></p>
        <p style="position:absolute;top:527px;left:688px;white-space:nowrap" class="ft12"><b>จำนวนเงิน</b></p>
        <p style="position:absolute;top:573px;left:118px;white-space:nowrap" class="ft13">1. ค่าธรรมเนียมในการยื่นคำขอ ฉบับละ 100 บาท</p>
        <p style="position:absolute;top:573px;left:736px;white-space:nowrap" class="ft13">100.00</p>
        <p style="position:absolute;top:617px;left:118px;white-space:nowrap" class="ft13">2. ค่าธรรมเนียมใบอนุญาตทำงาน</p>
        <p style="position:absolute;top:617px;left:736px;white-space:nowrap" class="ft13">900.00</p>
        <p style="position:absolute;top:695px;left:97px;white-space:nowrap" class="ft13">&#160;</p>
        <p style="position:absolute;top:695px;left:648px;white-space:nowrap" class="ft13">&#160;</p>
        <p style="position:absolute;top:773px;left:174px;white-space:nowrap" class="ft12"><b>รวมเป็นเงินทั้งสิ้น (บาท)</b></p>
        <p style="position:absolute;top:800px;left:188px;white-space:nowrap" class="ft12"><b>( หนึ่งพันบาทถ้วน )</b></p>
        <p style="position:absolute;top:787px;left:385px;white-space:nowrap" class="ft13">&#160;</p>
        <p style="position:absolute;top:776px;left:722px;white-space:nowrap" class="ft12"><b>1,000.00</b></p>
        <p style="position:absolute;top:895px;left:93px;white-space:nowrap" class="ft10">ได้รับเงินไว้เป็นการถูกต้องแล้ว</p>
        <p style="position:absolute;top:979px;left:481px;white-space:nowrap" class="ft10">(ลงชื่อ)</p>
        <p style="position:absolute;top:978px;left:564px;white-space:nowrap" class="ft10">นางสาวอารีวรรณ โพธิ์นิ่มแดง</p>
        <p style="position:absolute;top:979px;left:762px;white-space:nowrap" class="ft10">(ผู้รับเงิน)</p>
        <p style="position:absolute;top:1018px;left:473px;white-space:nowrap" class="ft10">ตำแหน่ง</p>
        <p style="position:absolute;top:1017px;left:562px;white-space:nowrap" class="ft10">นักวิชาการแรงงานชำนาญการ</p>
        <p style="position:absolute;top:1135px;left:55px;white-space:nowrap" class="ft15">เอกสารอิเล็กทรอนิกส์ฉบับนี้ถูกสร้างจากระบบอนุญาตทำงานคนต่างด้าวที่มีสถานะการทำงานไม่ถูกต้องตามกฎหมาย ตามมติคณะรัฐมนตรีเมื่อวันที่ 24 กันยายน 2567<br/>โดยกรมการจัดหางาน กระทรวงแรงงาน</p>
        <p style="position:absolute;top:1178px;left:55px;white-space:nowrap" class="ft14">พิมพ์เอกสาร วันที่ 15/05/68 07:14 น.</p>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <script>
        setTimeout(function() {
          try {
            new QRCode(document.getElementById('${qrCodeDiv}'), {
              text: '${data.เลขที่บนขวาใบเสร็จ || "2100680035190"}',
              width: 80,
              height: 80
            });
          } catch(e) {
            console.error('QR Code error:', e);
          }
        }, 100);
      <\/script>
    </body>
    </html>
  `;
}

// สร้าง PDF พรีวิว
function generatePDF() {
  const selector = document.getElementById('receiptSelector');
  if (selector.options.length === 0 || selector.value === '') {
    document.getElementById('pdfFrame').src = 'about:blank';
    return;
  }
  
  const index = selector.value;
  const data = receipts[index];
  
  if (!data) {
    alert('ไม่พบข้อมูล');
    return;
  }
  
  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
  const url = URL.createObjectURL(blob);
  document.getElementById('pdfFrame').src = url;
}

// ดาวน์โหลดทั้งหมด
function downloadAllPDFs() {
  if (receipts.length === 0) {
    alert('ไม่มีข้อมูลให้ดาวน์โหลด');
    return;
  }
  
  receipts.forEach((data, i) => {
    const html = generateReceiptHTML(data);
    const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt-${data.requestNumber || i + 1}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// เริ่มทำงานเมื่อหน้าเว็บโหลด
document.addEventListener('DOMContentLoaded', function() {
  loadReceipts();
  
  // เมื่อเปลี่ยน dropdown
  document.getElementById('receiptSelector').addEventListener('change', generatePDF);
});