#!/usr/bin/env node

/**
 * Data Import Script for StadiumSync
 * Loads real-time venue data from CSV into the database
 * Usage: node scripts/import-venue-data.mjs <csv_file_path>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = process.argv[2] || path.join(__dirname, '../data/smart_stadium_realtime_dataset_10000.csv');

// Validate file exists
if (!fs.existsSync(csvPath)) {
  console.error(`❌ Error: CSV file not found at ${csvPath}`);
  process.exit(1);
}

// Parse CSV
console.log(`📂 Reading CSV file: ${csvPath}`);
const fileContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
});

console.log(`✅ Parsed ${records.length} records from CSV`);

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'venue_experience',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function importData() {
  const connection = await pool.getConnection();

  try {
    // Step 1: Ensure venue exists
    console.log('\n🏟️  Setting up venue...');
    const venueResult = await connection.execute(
      `INSERT INTO venues (name, capacity, location) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['Smart Stadium', 50000, 'Downtown Arena']
    );
    const venueId = venueResult[0].insertId || 1;
    console.log(`✅ Venue ID: ${venueId}`);

    // Step 2: Ensure zones exist
    console.log('\n🗺️  Setting up zones...');
    const uniqueZones = [...new Set(records.map(r => r.zone_id))];
    const zoneMap = {};

    for (const zoneId of uniqueZones) {
      const zoneRecord = records.find(r => r.zone_id === zoneId);
      const zoneName = zoneRecord?.zone_name || zoneId;
      
      const result = await connection.execute(
        `INSERT INTO zones (venue_id, zone_code, zone_name) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [venueId, zoneId, zoneName]
      );
      zoneMap[zoneId] = result[0].insertId || zoneId;
    }
    console.log(`✅ Created/verified ${uniqueZones.length} zones`);

    // Step 3: Create facilities for each zone
    console.log('\n🏪 Setting up facilities...');
    const facilityMap = {};

    for (const [zoneId, zoneDbId] of Object.entries(zoneMap)) {
      const zoneRecord = records.find(r => r.zone_id === zoneId);
      const zoneName = zoneRecord?.zone_name || zoneId;

      // Determine facility type based on zone name
      let facilityType = 'other';
      if (zoneName.includes('Entrance') || zoneName.includes('Gate')) facilityType = 'entrance';
      else if (zoneName.includes('Food') || zoneName.includes('Court')) facilityType = 'concession';
      else if (zoneName.includes('Restroom')) facilityType = 'restroom';
      else if (zoneName.includes('Seating')) facilityType = 'seating';
      else if (zoneName.includes('VIP')) facilityType = 'vip';

      const result = await connection.execute(
        `INSERT INTO facilities (zone_id, facility_name, facility_type) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [zoneDbId, zoneName, facilityType]
      );
      facilityMap[zoneId] = result[0].insertId;
    }
    console.log(`✅ Created/verified ${Object.keys(facilityMap).length} facilities`);

    // Step 4: Insert crowd density and wait time data
    console.log('\n📊 Importing real-time data...');
    let importedCount = 0;
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = [];

      for (const record of batch) {
        const zoneDbId = zoneMap[record.zone_id];
        if (!zoneDbId) continue;

        const timestamp = new Date(record.timestamp);
        const crowdDensity = parseFloat(record.crowd_density) || 0;
        const waitTimeSeconds = parseInt(record.avg_wait_time_sec) || 0;
        const entryFlow = parseInt(record.entry_flow_rate_per_min) || 0;
        const exitFlow = parseInt(record.exit_flow_rate_per_min) || 0;
        const incidentFlag = parseInt(record.incident_flag) || 0;
        const staffRequired = parseInt(record.staff_required) || 0;
        const temperature = parseFloat(record.temperature_c) || 20;

        // Determine crowd status
        let crowdStatus = 'low';
        if (crowdDensity >= 0.7) crowdStatus = 'high';
        else if (crowdDensity >= 0.4) crowdStatus = 'medium';

        // Determine wait status
        let waitStatus = 'low';
        if (waitTimeSeconds >= 900) waitStatus = 'high'; // > 15 min
        else if (waitTimeSeconds >= 300) waitStatus = 'medium'; // > 5 min

        values.push([
          zoneDbId,
          crowdDensity,
          crowdStatus,
          waitTimeSeconds,
          waitStatus,
          entryFlow,
          exitFlow,
          incidentFlag,
          staffRequired,
          temperature,
          timestamp,
        ]);
      }

      if (values.length > 0) {
        // Insert crowd density records
        const placeholders = values.map(() => 
          '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).join(',');

        const flatValues = values.flat();
        
        await connection.execute(
          `INSERT INTO crowd_density 
           (zone_id, density_level, density_status, avg_wait_time_seconds, wait_status, 
            entry_flow_per_min, exit_flow_per_min, incident_flag, staff_required, 
            temperature_celsius, recorded_at) 
           VALUES ${placeholders}`,
          flatValues
        );

        importedCount += values.length;
        console.log(`  ✓ Imported ${importedCount}/${records.length} records...`);
      }
    }

    console.log(`\n✅ Successfully imported ${importedCount} crowd density records!`);

    // Step 5: Update wait_times table with latest data
    console.log('\n⏱️  Updating wait times...');
    for (const [zoneId, facilityId] of Object.entries(facilityMap)) {
      const latestRecord = records
        .filter(r => r.zone_id === zoneId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      if (latestRecord) {
        const waitMinutes = Math.ceil(parseInt(latestRecord.avg_wait_time_sec) / 60);
        let status = 'low';
        if (waitMinutes >= 15) status = 'high';
        else if (waitMinutes >= 5) status = 'medium';

        await connection.execute(
          `INSERT INTO wait_times (facility_id, wait_minutes, status, updated_at) 
           VALUES (?, ?, ?, NOW()) 
           ON DUPLICATE KEY UPDATE wait_minutes=?, status=?, updated_at=NOW()`,
          [facilityId, waitMinutes, status, waitMinutes, status]
        );
      }
    }
    console.log(`✅ Updated wait times for ${Object.keys(facilityMap).length} facilities`);

    console.log('\n🎉 Data import completed successfully!');
    console.log(`\n📈 Summary:`);
    console.log(`  • Venue: Smart Stadium`);
    console.log(`  • Zones: ${uniqueZones.length}`);
    console.log(`  • Facilities: ${Object.keys(facilityMap).length}`);
    console.log(`  • Records Imported: ${importedCount}`);
    console.log(`  • Time Range: ${records[0].timestamp} to ${records[records.length - 1].timestamp}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

// Run import
importData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
