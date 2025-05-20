const sheets = require('@googleapis/sheets');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../config.json');

exports.handler = async (event) => {
  try {
    // Validate environment variables
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID environment variable is missing');
    }

    // Initialize authentication
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize Sheets API client
    const sheetsClient = sheets.sheets({ version: 'v4', auth });

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      throw new Error(`Failed to parse request body: ${error.message}`);
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'airport', 'itemType', 'description', 'dateLost', 'trackingId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const values = [
      [
        new Date().toISOString(),
        body.name,
        body.email,
        body.phone,
        body.airport,
        body.itemType,
        body.description,
        body.dateLost,
        body.trackingId
      ]
    ];

    // Append data to sheet
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'LostItems!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', trackingId: body.trackingId })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: error.message })
    };
  }
};