const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: Replace this with the actual name of your database!
const DB_NAME = process.env.DB_NAME; 
const uri = process.env.MONGO_URI;
// -------------------

const client = new MongoClient(uri);

app.post('/fetch', async (req, res) => {
  try {
    // dbName is no longer received from the request body
    const { companyName, product, dateFrom, dateTo } = req.body;

    await client.connect();
    // The hardcoded DB_NAME is used here
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
    
    // No need to send a 404, the frontend will handle an empty array
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ An error occurred on the server.');
  }
});

app.listen(3000, () => console.log(`🚀 Server running at http://localhost:3000 and connected to database: ${DB_NAME}`));