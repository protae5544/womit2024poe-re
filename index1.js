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
    console.error('Error reading data:', error);
    return [];
  }
}

function writeData(data) {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = readData();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const newWorker = req.body;
    const data = readData();
    
    if (data.find(w => w.requestNumber === newWorker.requestNumber)) {
      return res.status(400).json({ error: 'Request number already exists' });
    }
    
    data.push(newWorker);
    if (writeData(data)) {
      res.status(201).json(newWorker);
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

