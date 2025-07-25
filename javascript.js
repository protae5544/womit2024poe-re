const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

exports.handler = async (event, context) => {
  try {
    // ดึง ID จาก query string
    const queryParams = event.queryStringParameters || {};
    const receiptId = queryParams.id;
    
    if (!receiptId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing receipt ID' })
      };
    }
    
    // โหลดข้อมูล (ใน production ควรเชื่อม database)
    const sampleData = {
      "requestNumber": receiptId,
      "englishName": "MRS.AYE SANDRA HTWE",
      "nationality": "เมียนมา",
      "alienReferenceNumber": "2492102076039",
      "personalID": "6682190040778",
      "เลขที่บนขวาใบเสร็จ": receiptId,
      "หมายเลขชำระเงิน": "IV680329/002308"
    };
      
     // สร้าง HTML สำหรับ PDF
    const html = generateReceiptHTML(sampleData);

     // สร้าง PDF ด้วย Puppeteer
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });
    
    const page = await browser.newPage();
    
    // กำหนด viewport ให้เหมือน HTML เด๊าะ
    await page.setViewport({
      width: 892,
      height: 1261,
      deviceScaleFactor: 1,
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // แก้ไข: ใช้ points ให้ถูกต้อง
    const pdf = await page.pdf({
      width: '669pt',      // 892px = 669pt (892 * 72 / 96)
      height: '945.75pt',  // 1261px = 945.75pt (1261 * 72 / 96)
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    
    await browser.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${receiptId}.pdf`
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate PDF: ' + error.message })
    };
  }
};

// สร้าง HTML สำหรับ PDF (ใช้ font และ background ของคุณ)
function generateReceiptHTML(data) {
 
// ฟังก์ชันสำหรับแปลงวันที่เป็น format ไทย
function getThaiDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear() + 543;
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hour}:${minute} น.`;
}

    
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="" xml:lang="">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <title>ใบเสร็จรับเงิน</title>
      <style type="text/css">
        /* แก้ไข: ใช้ font ของคุณจริงๆ */
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('./font CSS/subset-THSarabunNew-Bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
        }
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('./font CSS/subset-THSarabunNew.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        body { 
          font-family: 'TH Sarabun New', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #A0A0A0;
        }
        p { margin: 0; padding: 0; }
        .ft10 { font-size: 17px; font-family: 'TH Sarabun New', Times; color: #000000; }
        .ft11 { font-size: 23px; font-family: 'TH Sarabun New', Times; color: #000000; }
        .ft12 { font-size: 20px; font-family: 'TH Sarabun New', Times; color: #000000; }
        .ft13 { font-size: 20px; font-family: 'TH Sarabun New', Times; color: #000000; }
        .ft14 { font-size: 12px; font-family: 'TH Sarabun New', Times; color: #000000; }
        .ft15 { font-size: 12px; line-height: 23px; font-family: 'TH Sarabun New', Times; color: #000000; }
      </style>
    </head>
    <body bgcolor="#A0A0A0">
      <div style="position:relative;width:892px;height:1261px;">
        <!-- แก้ไข: ใช้ background ของคุณ -->
        <img width="892" height="1261" src="./bg.png" alt="background image" style="position:absolute;top:0;left:0;"/>
        
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
        <p style="position:absolute;top:1178px;left:55px;white-space:nowrap" class="ft14">พิมพ์เอกสาร วันที่ ${getThaiDateTime()}</p>
      </div>
    </body>
    </html>
  `;
}