import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'combined-data.json');

function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function generateHTML(worker) {
  const now = new Date();
  const thaiDate = now.toLocaleString('th-TH', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false
  }).replace(',', ' น.');

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="th" xml:lang="th">
<head>
  <title>ใบอนุญาตทำงาน - ${worker.englishName}</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <style>
    @font-face {
        font-family: 'THSarabunPsk';
        src: url('https://oldqifkvaagtseibueaf.supabase.co/storage/v1/object/public/zzoo/ozz/ss-thsbn.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'THSarabunPsk';
        src: url('https://oldqifkvaagtseibueaf.supabase.co/storage/v1/object/public/zzoo/ozz/ss-thsbn-bold.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'THSarabunPsk', sans-serif;
    }
    
    p { 
      margin: 0; 
      padding: 0; 
    }
    
    .page-container {
      position: relative;
      width: 892px;
      height: 1261px;
      background: white;
    }
    
    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .content {
      position: relative;
      z-index: 2;
    }
    
    .logo {
      position: absolute;
      top: 29px;
      left: 60px;
      width: 61px;
      height: 56px;
      object-fit: cover;
    }
    
    .profile-pic {
      position: absolute;
      top: 46px;
      left: 725px;
      width: 110px;
      height: 138px;
      object-fit: cover;
    }
    
    .qr-code {
      position: absolute;
      top: 977px;
      left: 762.5px;
      width: 69px;
      height: 69px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="content">
      <img class="logo" src="https://img2.pic.in.th/pic/bh.jpg" alt="Logo"/>
      <img class="profile-pic" src="${worker.profileImage || 'https://via.placeholder.com/110x138?text=No+Image'}" alt="Profile Picture"/>
      <img class="qr-code" src="${worker.qrCodeDataUrl || 'https://via.placeholder.com/69?text=No+QR'}" alt="QR Code"/>
      
      <p style="position: absolute; top: 32px; left: 134px; white-space: nowrap; font-size: 21px; font-weight: bold;">
        ทะเบียนใบอนุญาตทำงานของคนต่างด้าวตามมติคณะรัฐมนตรี เมื่อวันที่ 24 กันยายน 2567
      </p>
      
      <p style="position: absolute; top: 57px; left: 134px; white-space: nowrap; font-size: 21px; font-weight: bold; color: #dc2626;">
        เอกสารฉบับนี้ใช้แทนใบอนุญาตทำงาน
      </p>
      
      <p style="position: absolute; top: 87px; left: 158px; white-space: nowrap; font-size: 15px;">เลขรับที่ (No.)</p>
      <p style="position: absolute; top: 87px; left: 224px; white-space: nowrap; font-size: 14px;">:</p>
      <p style="position: absolute; top: 87px; left: 238px; white-space: nowrap; font-size: 15px; font-weight: bold;">
        ${worker.requestNumber || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 87px; left: 417px; white-space: nowrap; font-size: 15px;">วันที่อนุมัติ (Date)</p>
      <p style="position: absolute; top: 87px; left: 500px; white-space: nowrap; font-size: 14px;">:</p>
      <p style="position: absolute; top: 87px; left: 514px; white-space: nowrap; font-size: 15px; font-weight: bold;">06 มีนาคม 2568</p>
      
      <p style="position: absolute; top: 114px; left: 62px; white-space: nowrap; font-size: 15px;">ชื่อคนต่างด้าว (Name of Applicant)</p>
      <p style="position: absolute; top: 114px; left: 224px; white-space: nowrap; font-size: 14px;">:</p>
      <p style="position: absolute; top: 114px; left: 238px; white-space: nowrap; font-size: 15px; font-weight: bold;">
        ${worker.englishName || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 321px; left: 55px; white-space: nowrap; font-size: 14px;">ชื่อภาษาไทย</p>
      <p style="position: absolute; top: 321px; left: 199px; white-space: nowrap; font-size: 14px;">
        : ${worker.thaiName || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 300px; left: 55px; white-space: nowrap; font-size: 14px;">เลขประจำตัวคนต่างด้าว</p>
      <p style="position: absolute; top: 300px; left: 199px; white-space: nowrap; font-size: 14px;">
        : ${worker.personalID || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 300px; left: 440px; white-space: nowrap; font-size: 14px;">ใบอนุญาตทำงานเลขที่</p>
      <p style="position: absolute; top: 300px; left: 586px; white-space: nowrap; font-size: 14px;">
        : ${worker.workPermitNumber || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 408px; left: 55px; white-space: nowrap; font-size: 14px;">เลขอ้างอิงคนต่างด้าว</p>
      <p style="position: absolute; top: 408px; left: 199px; white-space: nowrap; font-size: 14px;">
        : ${worker.alienReferenceNumber || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 365px; left: 55px; white-space: nowrap; font-size: 14px;">สัญชาติ</p>
      <p style="position: absolute; top: 365px; left: 199px; white-space: nowrap; font-size: 14px;">
        : ${worker.nationality || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 343px; left: 440px; white-space: nowrap; font-size: 14px;">อายุ (ปี)</p>
      <p style="position: absolute; top: 343px; left: 586px; white-space: nowrap; font-size: 14px;">
        : ${worker.age || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 343px; left: 55px; white-space: nowrap; font-size: 14px;">วัน/เดือน/ปี (พ.ศ.) เกิด</p>
      <p style="position: absolute; top: 343px; left: 199px; white-space: nowrap; font-size: 14px;">
        : ${worker.birthDate || 'N/A'}
      </p>
      
      <p style="position: absolute; top: 1000px; left: 55px; font-size: 14px; line-height: 19px;">
        เอกสารอิเล็กทรอนิกส์ฉบับนี้ถูกสร้างจากระบบอนุญาตทำงานคนต่างด้าวที่มีสถานะการทำงานไม่ถูกต้องตามกฎหมาย ตามมติคณะรัฐมนตรีเมื่อวันที่ 24 กันยายน 2567<br/>
        โดยกรมการจัดหางาน กระทรวงแรงงาน<br/>
        พิมพ์เอกสาร วันที่ ${thaiDate}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestNumber, generateBatch = false, requestNumbers = [] } = req.body;
    const data = readData();
    
    let workersToProcess = [];
    
    if (generateBatch && requestNumbers.length > 0) {
      workersToProcess = data.filter(w => requestNumbers.includes(w.requestNumber));
    } else if (requestNumber) {
      const worker = data.find(w => w.requestNumber === requestNumber);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      workersToProcess = [worker];
    } else {
      return res.status(400).json({ error: 'Request number required' });
    }

    if (workersToProcess.length === 0) {
      return res.status(404).json({ error: 'No workers found' });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];

    for (const worker of workersToProcess) {
      try {
        const baseUrl = req.headers.host ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}` : 'http://localhost:3000';
        const workerUrl = `${baseUrl}/worker/${encodeURIComponent(worker.requestNumber)}`;
        const qrCodeDataUrl = await QRCode.toDataURL(workerUrl, {
          width: 300,
          errorCorrectionLevel: 'H'
        });
        
        worker.qrCodeDataUrl = qrCodeDataUrl;

        const page = await browser.newPage();
        await page.setContent(generateHTML(worker), { waitUntil: 'networkidle0' });
        
        const pdf = await page.pdf({
          width: '892px',
          height: '1261px',
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await page.close();

        results.push({
          requestNumber: worker.requestNumber,
          filename: `${worker.requestNumber}_${worker.thaiName || worker.englishName}.pdf`,
          pdf: pdf.toString('base64')
        });

      } catch (error) {
        console.error(`Error generating PDF for ${worker.requestNumber}:`, error);
        results.push({
          requestNumber: worker.requestNumber,
          error: error.message
        });
      }
    }

    await browser.close();

    if (results.length === 1 && !results[0].error) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${results[0].filename}"`);
      res.send(Buffer.from(results[0].pdf, 'base64'));
    } else {
      res.status(200).json({ results });
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '50mb',
  },
}

