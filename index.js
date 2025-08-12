const express = require('express');
const { MongoClient, GridFSBucket } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
const DB_NAME = process.env.DB_NAME;
const uri = process.env.MONGO_URI;
// -------------------

const client = new MongoClient(uri);
let db; // This variable will hold our MAIN database connection

/**
 * Connects to MongoDB once and then starts the Express server.
 */
async function startServer() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB.");
        // This 'db' variable is for the main data, NOT the PDFs.
        db = client.db(DB_NAME);
        app.listen(3000, () => {
            console.log(`🚀 Server running at http://localhost:3000`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

// --- ROUTES ---

// The /fetch route is correct and remains unchanged.
app.post('/fetch', async (req, res) => {
    try {
        const { companyName, product, dateFrom, dateTo } = req.body;
        
        const rcListCollection = db.collection('List_of_RC');
        const rcListData = await rcListCollection.find({}).toArray();
        const rcDateMap = new Map();
        
        rcListData.forEach(item => {
            const rcNumWithSuffix = item.RC_Number || item['RC Number'];
            const meetingDateStr = item.Meeting_held_on_date;
            
            if (rcNumWithSuffix && meetingDateStr && typeof meetingDateStr === 'string') {
                const cleanedRcNum = String(rcNumWithSuffix).replace(/[^0-9]/g, "");
                rcDateMap.set(cleanedRcNum.trim(), meetingDateStr.trim());
            }
        });

        const collections = await db.listCollections().toArray();
        let results = [];
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        let toDate = null;
        if (dateTo) {
            toDate = new Date(dateTo);
            toDate.setUTCHours(23, 59, 59, 999);
        }
        const isDateFilterActive = fromDate || toDate;

        const collectionsToSearch = collections.filter(c =>
            !c.name.startsWith('system.') &&
            !c.name.includes('.chunks') &&
            !c.name.includes('.files')
        );

        for (const { name } of collectionsToSearch) {
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
        
        res.json({
            results: results,
            rcDateMap: Object.fromEntries(rcDateMap)
        });

    } catch (err) {
        console.error('Fetch Error:', err);
        res.status(500).send('❌ An error occurred on the server.');
    }
});

// --- 💡 THIS IS THE CORRECTED PDF ROUTE ---
app.get('/pdf/:rcNum', async (req, res) => {
    try {
        let { rcNum } = req.params;
        if (!rcNum) {
            return res.status(400).send('RC Number is required.');
        }

        // Clean the number from the URL, just in case (e.g. "463rd" becomes "463")
        rcNum = String(rcNum).replace(/[^0-9]/g, "");

        // Use the single client to switch to the database named after the RC number
        const pdfDb = client.db(rcNum);
        const bucket = new GridFSBucket(pdfDb, { bucketName: 'pdfFiles' });

        // Find the first (and likely only) file in that specific database
        const files = await bucket.find().limit(1).toArray();

        if (!files || files.length === 0) {
            return res.status(404).send(`No PDF found in database "${rcNum}"`);
        }
        
        const file = files[0];

        res.setHeader('Content-Type', 'application/pdf');
        // Use the actual filename from the database for the download
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
// --- END OF CORRECTION ---

// --- START THE APPLICATION ---
startServer();
