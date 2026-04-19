# StadiumSync Data Import Guide

## Overview

StadiumSync provides a built-in data import feature that allows venue administrators to upload real-time crowd density and wait time data from CSV files. This guide explains how to prepare your data and import it into the system.

## Accessing the Data Import Page

1. **Log in as an admin or staff member** to your StadiumSync account
2. Navigate to the **Admin** section (bottom navigation)
3. Click the **"Import Data"** button in the admin tab navigation
4. You'll be taken to the Data Import page

## CSV File Format

Your CSV file must contain the following columns in this exact order:

| Column Name | Data Type | Description | Example |
|---|---|---|---|
| `timestamp` | DateTime | Date and time of the record | `2026-04-17 16:00:00` |
| `zone_id` | String | Unique zone identifier | `Z01`, `Z02`, `Z03` |
| `zone_name` | String | Human-readable zone name | `Main Entrance`, `Food Court A` |
| `crowd_density` | Float | Crowd density level (0.0 to 1.0) | `0.56`, `0.87`, `0.92` |
| `avg_wait_time_sec` | Integer | Average wait time in seconds | `300`, `900`, `1200` |
| `entry_flow_rate_per_min` | Integer | Number of people entering per minute | `100`, `250`, `50` |
| `exit_flow_rate_per_min` | Integer | Number of people exiting per minute | `80`, `200`, `40` |
| `incident_flag` | Integer | Incident indicator (0 = no incident, 1 = incident) | `0`, `1` |
| `staff_required` | Integer | Number of staff members needed | `5`, `10`, `15` |
| `temperature_c` | Float | Temperature in Celsius | `20.5`, `22.3`, `25.0` |

## CSV Format Example

```csv
timestamp,zone_id,zone_name,crowd_density,avg_wait_time_sec,entry_flow_rate_per_min,exit_flow_rate_per_min,incident_flag,staff_required,temperature_c
2026-04-17 16:00:00,Z01,Main Entrance,0.56,521,296,215,0,17,26
2026-04-17 16:00:30,Z02,North Gate,0.51,452,104,83,0,23,29
2026-04-17 16:01:00,Z03,South Gate,0.83,659,197,135,0,14,24
2026-04-17 16:01:30,Z04,East Gate,0.49,135,241,164,0,13,22
2026-04-17 16:02:00,Z05,West Gate,0.88,340,19,214,0,21,34
```

## Data Mapping

The system automatically maps your data to the following internal structures:

### Crowd Density Levels
- **Low**: `crowd_density` < 0.4
- **Medium**: `crowd_density` >= 0.4 and < 0.7
- **High**: `crowd_density` >= 0.7

### Wait Time Status
- **Low**: `avg_wait_time_sec` < 300 seconds (< 5 minutes)
- **Medium**: `avg_wait_time_sec` >= 300 and < 900 seconds (5-15 minutes)
- **High**: `avg_wait_time_sec` >= 900 seconds (> 15 minutes)

### Facility Type Detection
The system automatically detects facility types based on zone names:
- **Entrance**: Zone names containing "Entrance" or "Gate"
- **Concession**: Zone names containing "Food" or "Court"
- **Restroom**: Zone names containing "Restroom"
- **Seating**: Zone names containing "Seating"
- **VIP**: Zone names containing "VIP"

## How to Import Data

### Step 1: Prepare Your CSV File
Ensure your CSV file:
- Contains all required columns
- Has proper column headers in the first row
- Uses comma as the delimiter
- Has no empty rows between data rows

### Step 2: Upload the File
1. Click **"Choose File"** on the Data Import page
2. Select your CSV file from your computer
3. The file name and size will be displayed

### Step 3: Import the Data
1. Click the **"Import Data"** button
2. Wait for the import to complete (this may take a few moments for large files)
3. You'll see a success message with import statistics

### Step 4: Verify the Import
After successful import, you can verify the data by:
- Checking the **Wait Times** page to see updated facility wait times
- Viewing the **Venue Map** to see crowd density indicators
- Reviewing the **Admin Panel** to see zone and facility details

## Import Statistics

After a successful import, the system displays:
- **Records Imported**: Total number of data records processed
- **Zones Created**: Number of unique zones created or updated
- **Facilities Created**: Number of facilities created for those zones

## Troubleshooting

### "CSV file is empty"
- Ensure your CSV file contains data rows (not just headers)
- Check that you selected the correct file

### "Please select a CSV file"
- Make sure the file has a `.csv` extension
- Try renaming the file if it doesn't have the correct extension

### Import fails with an error
- Verify all required columns are present
- Check that data types match the expected format
- Ensure there are no special characters in zone IDs
- Verify timestamps are in the correct format: `YYYY-MM-DD HH:MM:SS`

### Data doesn't appear after import
- Refresh the page to see updated data
- Check the Admin Panel to verify zones and facilities were created
- Navigate to the Wait Times page to see facility data

## Best Practices

1. **Regular Updates**: Import data at regular intervals to keep crowd information current
2. **Data Validation**: Review your CSV file for errors before importing
3. **Backup**: Keep backups of your data files for record-keeping
4. **Batch Imports**: For large datasets, consider splitting into multiple files if needed
5. **Timezone Consistency**: Ensure all timestamps use the same timezone

## API Integration (Advanced)

For automated data imports, you can use the tRPC API directly:

```typescript
const result = await trpc.dataImport.importCrowdDensityBatch.mutate({
  venueId: 1,
  records: [
    {
      zoneCode: "Z01",
      zoneName: "Main Entrance",
      crowdDensity: 0.56,
      avgWaitTimeSec: 521,
      entryFlowPerMin: 296,
      exitFlowPerMin: 215,
      incidentFlag: 0,
      staffRequired: 17,
      temperatureCelsius: 26,
      timestamp: "2026-04-17 16:00:00",
    },
    // ... more records
  ],
});
```

## Support

If you encounter issues with data import:
1. Check this guide for troubleshooting steps
2. Verify your CSV format matches the requirements
3. Contact your venue administrator for assistance

---

**Last Updated**: April 2026
**Version**: 1.0
