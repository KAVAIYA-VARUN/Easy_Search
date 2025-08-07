// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const app = express();

// // Middleware to serve frontend
// app.use(express.static('public'));

// // Multer config to store uploads temporarily
// const upload = multer({ dest: 'uploads/' });

// // MongoDB connection URI (just base URI, no DB selected here)
// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// // Helper to make valid collection names
// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// // Generate a unique DB name per file
// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName(); // 🔥 New DB name per upload
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//         console.log(`Inserted ${data.length} rows into ${dbName}.${collectionName}`);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Excel file uploaded.\n📁 Data stored in database: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Failed to upload data');
//   }
// });

// // Start server
// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const app = express();

// // Middleware to parse JSON and form data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static frontend files from /public
// app.use(express.static('public'));

// // Multer config to store uploads temporarily
// const upload = multer({ dest: 'uploads/' });

// // MongoDB connection URI (adjust with your credentials if needed)
// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// // Helper to sanitize sheet/collection names
// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// // Helper to generate unique DB name
// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// // ✅ Upload Excel → MongoDB
// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName(); // Dynamic DB name
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//         console.log(`✅ Inserted ${data.length} rows into ${dbName}.${collectionName}`);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Excel uploaded. Database name: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Upload failed');
//   }
// });

// // ✅ Fetch data from MongoDB based on db & sheet
// app.get('/fetch-data', async (req, res) => {
//   const { dbName, sheetName } = req.query;

//   if (!dbName || !sheetName) {
//     return res.status(400).send('❌ Missing dbName or sheetName');
//   }

//   const sanitizedSheetName = sanitizeCollectionName(sheetName);

//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();
//     const collectionNames = collections.map(col => col.name);

//     if (!collectionNames.includes(sanitizedSheetName)) {
//       return res.status(404).send(`❌ Sheet "${sheetName}" not found in database "${dbName}"`);
//     }

//     const collection = db.collection(sanitizedSheetName);
//     const data = await collection.find({}).toArray();
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('❌ Failed to fetch data');
//   }
// });

// // Start the server
// app.listen(3000, () => {
//   console.log('🚀 Server running at http://localhost:3000');
// });

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const fs = require('fs');
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

// // File upload setup
// const upload = multer({ dest: 'uploads/' });

// // MongoDB setup
// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// // Sanitize collection names
// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// // Generate unique DB name
// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// // ✅ Upload Excel
// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;
//     const dbName = generateDatabaseName();

//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//         console.log(`Inserted ${data.length} rows into ${dbName}.${collectionName}`);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Excel uploaded. Database name: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Upload failed');
//   }
// });

// // ✅ Filtered fetch across all sheets
// app.get('/fetch-data', async (req, res) => {
//   const { dbName, annexure, caseType } = req.query;

//   if (!dbName) {
//     return res.status(400).send('❌ Database name is required.');
//   }

//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();

//     const filters = [annexure, caseType].filter(f => f).map(f => f.toLowerCase());

//     if (filters.length === 0) {
//       return res.status(400).send('❌ Provide at least one filter: Annexure or Case Type.');
//     }

//     let results = [];

//     for (const col of collections) {
//       const collection = db.collection(col.name);
//       const documents = await collection.find({}).toArray();

//       for (const doc of documents) {
//         const values = Object.values(doc).map(v => String(v).toLowerCase());

//         const matches = filters.every(filter =>
//           values.some(value => value.includes(filter))
//         );

//         if (matches) {
//           results.push(doc);
//         }
//       }
//     }

//     if (results.length === 0) {
//       return res.status(404).send('❌ No matching data found.');
//     }

//     res.json(results);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('❌ Failed to fetch data');
//   }
// });

// // Start server
// app.listen(3000, () => {
//   console.log('🚀 Server running at http://localhost:3000');
// });

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const app = express();
// const cors = require('cors');

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// const upload = multer({ dest: 'uploads/' });

// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// // Upload Excel file
// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName();
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//         console.log(`Inserted ${data.length} rows into ${dbName}.${collectionName}`);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Excel uploaded. Data stored in database: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Failed to upload data');
//   }
// });

// // Filtered fetch
// app.post('/fetch', async (req, res) => {
//   try {
//     const { dbName, companyName, product } = req.body;

//     if (!dbName) return res.status(400).send('Database name is required');

//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();

//     let results = [];

//     for (const { name } of collections) {
//       const collection = db.collection(name);
//       const data = await collection.find({}).toArray();

//       for (const doc of data) {
//         const values = Object.values(doc).map(v => String(v).toLowerCase());

//         const companyMatch = companyName ? values.some(v => v.includes(companyName.toLowerCase())) : true;
//         const productMatch = product ? values.some(v => v.includes(product.toLowerCase())) : true;

//         if (companyMatch && productMatch) results.push({ ...doc, sheet: name });
//       }
//     }

//     if (results.length === 0) return res.status(404).send('No matching records found');
//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Failed to fetch data');
//   }
// });

// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

// this is completely working

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// const upload = multer({ dest: 'uploads/' });

// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// // ✅ Upload Excel File
// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName();
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//         console.log(`Inserted ${data.length} rows into ${dbName}.${collectionName}`);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Excel uploaded. Data stored in database: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Failed to upload data');
//   }
// });

// // ✅ Fetch with Filters (companyName, product)
// // ✅ Fetch with Filters (companyName, product)
// app.post('/fetch', async (req, res) => {
//   try {
//     const { dbName, companyName, product } = req.body;

//     if (!dbName) return res.status(400).send('Database name is required');

//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();

//     let results = [];

//     for (const { name } of collections) {
//       const collection = db.collection(name);
//       const data = await collection.find({}).toArray();

//       for (const doc of data) {
//         const values = Object.values(doc).map(v => String(v).toLowerCase());

//         const companyMatch = companyName
//           ? values.some(v => v.includes(companyName.toLowerCase()))
//           : true;

//         const productMatch = product
//           ? values.some(v => v.includes(product.toLowerCase()))
//           : true;

//         // ✅ Clean up the doc before sending (remove _id)
//         if (
//           (companyName && product && companyMatch && productMatch) ||
//           (companyName && !product && companyMatch) ||
//           (!companyName && product && productMatch) ||
//           (!companyName && !product)
//         ) {
//           const { _id, ...rest } = doc; // 🔥 Remove _id here
//           results.push({ ...rest, sheet: name });
//         }
//       }
//     }

//     if (results.length === 0)
//       return res.status(404).send('❌ No matching records found');

//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Failed to fetch data');
//   }
// });

// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// const upload = multer({ dest: 'uploads/' });

// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName();
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);
//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Uploaded. Data stored in DB: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Upload failed');
//   }
// });

// app.post('/fetch', async (req, res) => {
//   try {
//     const { dbName, companyName, product } = req.body;
//     if (!dbName) return res.status(400).send('Database name is required');

//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();

//     let results = [];

//     for (const { name } of collections) {
//       const collection = db.collection(name);
//       const data = await collection.find({}).toArray();

//       for (const doc of data) {
//         const values = Object.values(doc).map(v => String(v).toLowerCase());

//         const companyMatch = companyName ? values.some(v => v.includes(companyName.toLowerCase())) : true;
//         const productMatch = product ? values.some(v => v.includes(product.toLowerCase())) : true;

//         if ((companyName && product && companyMatch && productMatch) ||
//             (companyName && !product && companyMatch) ||
//             (!companyName && product && productMatch) ||
//             (!companyName && !product)) {
//           const { _id, ...rest } = doc;
//           results.push({ ...rest, sheet: name });
//         }
//       }
//     }

//     if (results.length === 0) return res.status(404).send('❌ No matching records found');
//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Fetch failed');
//   }
// });

// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// const upload = multer({ dest: 'uploads/' });

// const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
// const client = new MongoClient(uri);

// function sanitizeCollectionName(name) {
//   return name.replace(/[^\w]/g, '_');
// }

// function generateDatabaseName() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   return `excel_upload_${timestamp}`;
// }

// app.post('/upload', upload.single('excel'), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const allSheetNames = workbook.SheetNames;

//     const dbName = generateDatabaseName();
//     await client.connect();
//     const db = client.db(dbName);

//     for (const sheetName of allSheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       // This { cellDates: true } is still very important for this logic to work best!
//       const data = xlsx.utils.sheet_to_json(sheet, { cellDates: true });
//       if (data.length > 0) {
//         const collectionName = sanitizeCollectionName(sheetName);
//         const collection = db.collection(collectionName);
//         await collection.insertMany(data);
//       }
//     }

//     fs.unlinkSync(filePath);
//     res.send(`✅ Uploaded. Data stored in DB: ${dbName}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Upload failed');
//   }
// });

// // ✨ --- MODIFIED FETCH LOGIC --- ✨
// app.post('/fetch', async (req, res) => {
//   try {
//     const { dbName, companyName, product, dateFrom, dateTo } = req.body;
//     if (!dbName) return res.status(400).send('Database name is required');

//     await client.connect();
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();
//     let results = [];

//     // Prepare date range boundaries once.
//     const fromDate = dateFrom ? new Date(dateFrom) : null;
//     let toDate = null;
//     if (dateTo) {
//       toDate = new Date(dateTo);
//       toDate.setUTCHours(23, 59, 59, 999);
//     }
//     const isDateFilterActive = fromDate || toDate;

//     for (const { name } of collections) {
//       const collection = db.collection(name);
      
//       // 1. Fetch ALL documents. The date filtering will happen in the Node.js code.
//       const allData = await collection.find({}).toArray();

//       for (const doc of allData) {
//         const values = Object.values(doc);

//         // 2. Perform company and product filtering as before.
//         const companyMatch = companyName ? values.some(v => String(v).toLowerCase().includes(companyName.toLowerCase())) : true;
//         const productMatch = product ? values.some(v => String(v).toLowerCase().includes(product.toLowerCase())) : true;

//         // 3. Perform the new date filtering across all values.
//         let dateMatch = !isDateFilterActive; // If no date filter, it's a match.
//         if (isDateFilterActive) {
//           for (const value of values) {
//             let valueAsDate = null;
            
//             // Check if the value is already a date object (best case)
//             if (value instanceof Date) {
//               valueAsDate = value;
//             } 
//             // Or, try to parse it if it's a string or number.
//             else if (typeof value === 'string' || typeof value === 'number') {
//               const parsed = new Date(value);
//               // Check if parsing resulted in a valid date.
//               if (!isNaN(parsed.getTime())) {
//                 valueAsDate = parsed;
//               }
//             }
            
//             // If we have a valid date, check if it's in the range.
//             if (valueAsDate) {
//               const valueTime = valueAsDate.getTime();
//               const fromTime = fromDate ? fromDate.getTime() : -Infinity;
//               const toTime = toDate ? toDate.getTime() : Infinity;

//               if (valueTime >= fromTime && valueTime <= toTime) {
//                 dateMatch = true;
//                 break; // Found a matching date in this row, no need to check other values.
//               }
//             }
//           }
//         }
        
//         // 4. If all active filters match, add the document to the results.
//         if (companyMatch && productMatch && dateMatch) {
//           const { _id, ...rest } = doc;
//           results.push({ ...rest, sheet: name });
//         }
//       }
//     }

//     if (results.length === 0) return res.status(404).send('❌ No matching records found');
//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('❌ Fetch failed');
//   }
// });


// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: Replace this with the actual name of your database!
const DB_NAME = "excel_upload_2025-08-03T19-14-04-392Z"; 
const uri = 'mongodb+srv://raw-king:RAW-KING@cluster0.0jnwkpn.mongodb.net';
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