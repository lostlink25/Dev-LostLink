const { google } = require('@googleapis/sheets');

exports.handler = async (event) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const body = JSON.parse(event.body);

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