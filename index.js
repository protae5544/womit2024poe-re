import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [workers, setWorkers] = useState([]);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    if (router.query.id && workers.length > 0) {
      const index = workers.findIndex(w => w.requestNumber === router.query.id);
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentWorker(workers[index]);
      }
    }
  }, [router.query.id, workers]);

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      setWorkers(data);
      if (data.length > 0) {
        setCurrentWorker(data[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const handleWorkerChange = (index) => {
    if (index === 'all') return;
    const idx = parseInt(index);
    setCurrentIndex(idx);
    setCurrentWorker(workers[idx]);
    router.push(`/?id=${workers[idx].requestNumber}`, undefined, { shallow: true });
  };

  const downloadSinglePDF = async () => {
    if (!currentWorker) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestNumber: currentWorker.requestNumber })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentWorker.requestNumber}_${currentWorker.thaiName || currentWorker.englishName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('เกิดข้อผิดพลาดในการสร้าง PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadBatchPDF = async () => {
    const requestNumbers = selectedWorkers.length > 0 ? selectedWorkers : workers.map(w => w.requestNumber);
    
    setLoading(true);
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          generateBatch: true, 
          requestNumbers 
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        for (const item of result.results) {
          if (item.pdf) {
            const blob = new Blob([Uint8Array.from(atob(item.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        alert(`ดาวน์โหลด PDF สำเร็จ ${result.results.filter(r => r.pdf).length} ไฟล์`);
      } else {
        alert('เกิดข้อผิดพลาดในการสร้าง PDF');
      }
    } catch (error) {
      console.error('Error downloading batch PDF:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด PDF');
    } finally {
      setLoading(false);
    }
  };

  const showPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentWorker(workers[newIndex]);
      router.push(`/?id=${workers[newIndex].requestNumber}`, undefined, { shallow: true });
    }
  };

  const showNext = () => {
    if (currentIndex < workers.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentWorker(workers[newIndex]);
      router.push(`/?id=${workers[newIndex].requestNumber}`, undefined, { shallow: true });
    }
  };

  if (!currentWorker) {
    return <div className="flex items-center justify-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-500 p-4">
      {/* Controls */}
      <div className="fixed top-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg z-50 w-80">
        <div className="space-y-3">
          <select 
            value={currentIndex} 
            onChange={(e) => handleWorkerChange(e.target.value)}
            className="w-full p-2 border rounded"
            style={{fontFamily: 'THSarabunPSK'}}
          >
            <option value="all">เลือกแรงงาน (ทั้งหมด)</option>
            {workers.map((worker, index) => (
              <option key={worker.requestNumber} value={index}>
                {worker.requestNumber} - {worker.thaiName || worker.englishName}
              </option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={showPrevious}
              disabled={currentIndex === 0}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
              style={{fontFamily: 'THSarabunPSK'}}
            >
              ก่อนหน้า
            </button>
            <button 
              onClick={showNext}
              disabled={currentIndex === workers.length - 1}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
              style={{fontFamily: 'THSarabunPSK'}}
            >
              ถัดไป
            </button>
          </div>
          
          <button 
            onClick={downloadSinglePDF}
            disabled={loading}
            className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
            style={{fontFamily: 'THSarabunPSK'}}
          >
            {loading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF ปัจจุบัน'}
          </button>
          
          <button 
            onClick={downloadBatchPDF}
            disabled={loading}
            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
            style={{fontFamily: 'THSarabunPSK'}}
          >
            {loading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF ทั้งหมด'}
          </button>
          
          <div className="text-xs text-gray-600" style={{fontFamily: 'THSarabunPSK'}}>
            แสดงข้อมูล {currentIndex + 1} จาก {workers.length} รายการ
          </div>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex justify-center">
        <div 
          className="relative bg-white shadow-lg"
          style={{
            width: '892px',
            height: '1261px',
            fontFamily: 'THSarabunPSK',
            color: 'black'
          }}
        >
          {/* Background */}
          <img 
            width="892" 
            height="1261" 
            src="/bg5.svg" 
            alt="background" 
            className="absolute inset-0"
          />
          
          {/* Logo */}
          <img 
            className="absolute top-[29px] left-[60px] w-[61px] h-[56px] object-cover z-10" 
            src="https://img2.pic.in.th/pic/bh.jpg" 
            alt="Logo"
          />
          
          {/* Profile Picture */}
          <img 
            className="absolute top-[46px] left-[725px] w-[110px] h-[138px] object-cover z-10" 
            src={currentWorker.profileImage || 'https://via.placeholder.com/110x138?text=No+Image'} 
            alt="Profile Picture"
          />
          
          {/* QR Code */}
          <img 
            className="absolute top-[977px] left-[762.5px] w-[69px] h-[69px] object-cover" 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/worker/${currentWorker.requestNumber}`)}`}
            alt="QR Code"
          />
          
          {/* Header */}
          <p className="absolute top-[32px] left-[134px] whitespace-nowrap text-[21px] font-bold">
            ทะเบียนใบอนุญาตทำงานของคนต่างด้าวตามมติคณะรัฐมนตรี เมื่อวันที่ 24 กันยายน 2567
          </p>
          <p className="absolute top-[57px] left-[134px] whitespace-nowrap text-[21px] font-bold text-red-600">
            เอกสารฉบับนี้ใช้แทนใบอนุญาตทำงาน
          </p>
          
          {/* Request Number */}
          <p className="absolute top-[87px] left-[158px] whitespace-nowrap text-[15px]">เลขรับที่ (No.)</p>
          <p className="absolute top-[87px] left-[224px] whitespace-nowrap text-[14px]">:</p>
          <p className="absolute top-[87px] left-[238px] whitespace-nowrap text-[15px] font-bold">
            {currentWorker.requestNumber || 'N/A'}
          </p>
          
          {/* Date */}
          <p className="absolute top-[87px] left-[417px] whitespace-nowrap text-[15px]">วันที่อนุมัติ (Date)</p>
          <p className="absolute top-[87px] left-[500px] whitespace-nowrap text-[14px]">:</p>
          <p className="absolute top-[87px] left-[514px] whitespace-nowrap text-[15px] font-bold">06 มีนาคม 2568</p>
          
          {/* Name */}
          <p className="absolute top-[114px] left-[62px] whitespace-nowrap text-[15px]">ชื่อคนต่างด้าว (Name of Applicant)</p>
          <p className="absolute top-[114px] left-[224px] whitespace-nowrap text-[14px]">:</p>
          <p className="absolute top-[114px] left-[238px] whitespace-nowrap text-[15px] font-bold">
            {currentWorker.englishName || 'N/A'}
          </p>
          
          {/* Personal Information */}
          <p className="absolute top-[321px] left-[55px] whitespace-nowrap text-[14px]">ชื่อภาษาไทย</p>
          <p className="absolute top-[321px] left-[199px] whitespace-nowrap text-[14px]">
            : {currentWorker.thaiName || 'N/A'}
          </p>
          
          <p className="absolute top-[300px] left-[55px] whitespace-nowrap text-[14px]">เลขประจำตัวคนต่างด้าว</p>
          <p className="absolute top-[300px] left-[199px] whitespace-nowrap text-[14px]">
            : {currentWorker.personalID || 'N/A'}
          </p>
          
          <p className="absolute top-[300px] left-[440px] whitespace-nowrap text-[14px]">ใบอนุญาตทำงานเลขที่</p>
          <p className="absolute top-[300px] left-[586px] whitespace-nowrap text-[14px]">
            : {currentWorker.workPermitNumber || 'N/A'}
          </p>
          
          <p className="absolute top-[408px] left-[55px] whitespace-nowrap text-[14px]">เลขอ้างอิงคนต่างด้าว</p>
          <p className="absolute top-[408px] left-[199px] whitespace-nowrap text-[14px]">
            : {currentWorker.alienReferenceNumber || 'N/A'}
          </p>
          
          <p className="absolute top-[365px] left-[55px] whitespace-nowrap text-[14px]">สัญชาติ</p>
          <p className="absolute top-[365px] left-[199px] whitespace-nowrap text-[14px]">
            : {currentWorker.nationality || 'N/A'}
          </p>
          
          <p className="absolute top-[343px] left-[440px] whitespace-nowrap text-[14px]">อายุ (ปี)</p>
          <p className="absolute top-[343px] left-[586px] whitespace-nowrap text-[14px]">
            : {currentWorker.age || 'N/A'}
          </p>
          
          <p className="absolute top-[343px] left-[55px] whitespace-nowrap text-[14px]">วัน/เดือน/ปี (พ.ศ.) เกิด</p>
          <p className="absolute top-[343px] left-[199px] whitespace-nowrap text-[14px]">
            : {currentWorker.birthDate || 'N/A'}
          </p>
          
          {/* Timestamp */}
          <p className="absolute top-[1000px] left-[55px] text-[14px] leading-[19px]">
            เอกสารอิเล็กทรอนิกส์ฉบับนี้ถูกสร้างจากระบบอนุญาตทำงานคนต่างด้าวที่มีสถานะการทำงานไม่ถูกต้องตามกฎหมาย ตามมติคณะรัฐมนตรีเมื่อวันที่ 24 กันยายน 2567<br/>
            โดยกรมการจัดหางาน กระทรวงแรงงาน<br/>
            พิมพ์เอกสาร วันที่ {new Date().toLocaleString('th-TH', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).replace(',', ' น.')}
          </p>
        </div>
      </div>
    </div>
  );
}

