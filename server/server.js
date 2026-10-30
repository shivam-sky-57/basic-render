const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Country = require('./models/Country');
const seedCountries = require('./seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Auto-seed hardcoded content into MongoDB when connected
const seedDatabaseIfNeeded = async () => {
  try {
    const count = await Country.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding hardcoded country data into MongoDB...');
      await Country.insertMany(seedCountries);
      console.log(`✅ Seeded ${seedCountries.length} countries.`);
    } else {
      console.log(`ℹ️ MongoDB has ${count} countries ready.`);
    }
  } catch (err) {
    console.error('❌ Error during auto-seeding:', err.message);
  }
};

// MongoDB Connection
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB successfully!');
      await seedDatabaseIfNeeded();
    })
    .catch((err) => {
      console.error('⚠️ MongoDB connection error:', err.message);
    });
} else {
  console.log('⚠️ MONGO_URI is not set. Using in-memory hardcoded fallback.');
}

// -------------------------------------------------------------
// 1. MAIN PAGE (GET /)
// -------------------------------------------------------------
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'In-Memory Fallback (MONGO_URI not set)';

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Simple Node & Mongo Project</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
          background-color: #f9f9f9;
          color: #333;
        }
        .container {
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 25px;
        }
        h1 { color: #2c3e50; margin-top: 0; }
        ul { list-style: disc; padding-left: 20px; }
        li { margin: 10px 0; }
        a { color: #2980b9; font-weight: bold; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .info {
          background: #eef7fc;
          border-left: 4px solid #3498db;
          padding: 10px 14px;
          margin: 15px 0;
        }
        code { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Simple Node & MongoDB Project</h1>
        <p>This is a basic Node.js project ready to be deployed on Render.</p>
        
        <div class="info">
          <strong>Database Status:</strong> ${dbStatus}
        </div>

        <h3>Available Pages & Endpoints:</h3>
        <ul>
          <li><a href="/health">/health</a> &mdash; Health check endpoint (used by Render)</li>
          <li><a href="/content">/content</a> &mdash; View the country timetable table</li>
        </ul>


      </div>
    </body>
    </html>
  `);
});

// -------------------------------------------------------------
// 2. HEALTH CHECK PAGE (GET /health)
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const statusData = {
    status: 'OK',
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected (using fallback)',
    port: PORT
  };

  // If client prefers JSON (like Render health check monitor or curl)
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(200).json(statusData);
  }

  // Basic HTML page for browser view
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Health Check</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f9f9f9; }
        .box { background: white; border: 1px solid #ccc; padding: 20px; border-radius: 6px; }
        h1 { color: #27ae60; margin-top: 0; }
        pre { background: #eee; padding: 12px; border-radius: 4px; font-size: 14px; }
        a { color: #2980b9; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Health Check: OK</h1>
        <p><strong>Uptime:</strong> ${statusData.uptime}</p>
        <p><strong>Database:</strong> ${statusData.database}</p>
        <p><strong>Timestamp:</strong> ${statusData.timestamp}</p>
        <h3>JSON Response:</h3>
        <pre>${JSON.stringify(statusData, null, 2)}</pre>
        <p><a href="/">&larr; Back to Main Page</a></p>
      </div>
    </body>
    </html>
  `);
});

// -------------------------------------------------------------
// 3. CONTENT TABLE PAGE (GET /content)
// -------------------------------------------------------------
app.get('/content', async (req, res) => {
  try {
    let countriesList = seedCountries;
    let dataSource = 'Hardcoded Fallback (MONGO_URI not configured)';

    if (mongoose.connection.readyState === 1) {
      const dbData = await Country.find().sort({ country: 1 });
      if (dbData && dbData.length > 0) {
        countriesList = dbData;
        dataSource = 'MongoDB Atlas Collection';
      }
    }

    // If client asks for JSON via format=json or Accept: application/json
    if (req.query.format === 'json' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(200).json({
        success: true,
        source: dataSource,
        count: countriesList.length,
        data: countriesList
      });
    }

    // Render basic HTML table
    const tableRows = countriesList
      .map(
        (c) => `
        <tr>
          <td>${c.country}</td>
          <td>${c.capital}</td>
          <td>${c.latitude}</td>
          <td>${c.longitude}</td>
        </tr>
      `
      )
      .join('');

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Country Timetable & Coordinates</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f9f9f9;
            color: #333;
          }
          .card {
            background: #fff;
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 6px;
          }
          h1 { margin-top: 0; color: #2c3e50; }
          .meta {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #333;
          }
          tr:nth-child(even) { background-color: #fafafa; }
          tr:hover { background-color: #f1f1f1; }
          a { color: #2980b9; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
          .nav { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Country & Capital Coordinates Table</h1>
          <p class="meta">
            <strong>Data Source:</strong> ${dataSource} | <strong>Total Entries:</strong> ${countriesList.length}
          </p>

          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Capital</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="nav">
            <a href="/">&larr; Back to Main Page</a> &nbsp;|&nbsp;
            <a href="/health">Health Check</a> &nbsp;|&nbsp;
            <a href="/content?format=json" target="_blank">View Raw JSON</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<h3>Error loading content:</h3><p>${err.message}</p>`);
  }
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Primary server listening on port ${PORT}`);
  if (PORT == 80) {
    console.log(`✨ Port 80 active: Browsers will hide the port number in the address bar!`);
    console.log(`🌐 Open simulation links:`);
    console.log(`   - Main Page:    http://simple-node-mongo-app.onrender.com/`);
    console.log(`   - Health Check: http://simple-node-mongo-app.onrender.com/health`);
    console.log(`   - Content:      http://simple-node-mongo-app.onrender.com/content`);
  } else {
    console.log(`- Main Page:    http://localhost:${PORT}/`);
    console.log(`- Health Check: http://localhost:${PORT}/health`);
    console.log(`- Content:      http://localhost:${PORT}/content`);
  }
});

// Also open port 5000 as backup if primary is 80
if (PORT == 80) {
  try {
    const backupServer = app.listen(5000, '0.0.0.0', () => {
      console.log(`📡 Backup listener active on port 5000 (http://localhost:5000)`);
    });
    backupServer.on('error', () => {});
  } catch (err) {}
}
