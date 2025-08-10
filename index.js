const express = require('express');
const { MongoClient, GridFSBucket } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files from the 'public' folder
app.use(express.static('public'));

// --- CONFIGURATION ---
const DB_NAME = process.env.DB_NAME;
const uri = process.env.MONGO_URI;
// -------------------

const client = new MongoClient(uri);

// Fetches the data records based on search criteria
app.post('/fetch', async (req, res) => {
  try {
    const { companyName, product, dateFrom, dateTo } = req.body;
    await client.connect();
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    let results = [];
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    let toDate = null;
    if (dateTo) {
      toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
    }
    const isDateFilterActive = fromDate || toDate;

    for (const { name } of collections) {
      const collection = db.collection(name);
      const allData = await collection.find({}).toArray();

      for (const doc of allData) {
        const values = Object.values(doc);
        const companyMatch = companyName ? values.some(v => String(v).toLowerCase().includes(companyName.toLowerCase())) : true;
        const productMatch = product ? values.some(v => String(v).toLowerCase().includes(product.toLowerCase())) : true;
        let dateMatch = !isDateFilterActive;
        if (isDateFilterActive) {
          for (const value of values) {
            let valueAsDate = null;
            if (value instanceof Date) {
              valueAsDate = value;
            } else if (typeof value === 'string' || typeof value === 'number') {
              const parsed = new Date(value);
              if (!isNaN(parsed.getTime())) {
                valueAsDate = parsed;
              }
            }
            if (valueAsDate) {
              const valueTime = valueAsDate.getTime();
              const fromTime = fromDate ? fromDate.getTime() : -Infinity;
              const toTime = toDate ? toDate.getTime() : Infinity;
              if (valueTime >= fromTime && valueTime <= toTime) {
                dateMatch = true;
                break;
              }
            }
          }
        }
        if (companyMatch && productMatch && dateMatch) {
          const { _id, ...rest } = doc;
          results.push({ ...rest, sheet: name });
        }
      }
    }
    res.json(results);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).send('❌ An error occurred on the server.');
  }
});

// Streams the correct PDF based on the RC Number
app.get('/pdf/:rcNum', async (req, res) => {
    try {
        const { rcNum } = req.params;
        if (!rcNum) {
            return res.status(400).send('RC Number is required.');
        }

        await client.connect();
        const db = client.db(String(rcNum));
        const bucket = new GridFSBucket(db, { bucketName: 'pdfFiles' });

        const files = await bucket.find().limit(1).toArray();
        if (!files || files.length === 0) {
            return res.status(404).send(`No PDF found for RC Number: ${rcNum}`);
        }
        
        const file = files[0];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

        const downloadStream = bucket.openDownloadStream(file._id);
        
        downloadStream.on('error', (streamErr) => {
            console.error('PDF Stream Error:', streamErr);
            res.status(500).send('Error streaming PDF file.');
        });

        downloadStream.pipe(res);

    } catch (err) {
        console.error('PDF Endpoint Error:', err);
        res.status(500).send('❌ An error occurred while fetching the PDF.');
    }
});

app.listen(3000, () => console.log(`🚀 Server running at http://localhost:3000`));
