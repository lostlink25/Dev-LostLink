const { google } = require('@googleapis/sheets');
const { GoogleAuth } = require('google-auth-library');

exports.handler = async (event) => {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is missing');
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID environment variable is missing');
    }

    // Parse service account key
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: ${error.message}`);
    }

    // Initialize authentication
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });

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
        body.apple,
        body.itemType,
        body.description,
        body.dateLost,
        body.trackingId
      ]
    ];

    // Append data to sheet
    await sheets.spreadsheets.values.append({
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