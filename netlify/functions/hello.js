const { google } = require("googleapis");
const { JWT } = require("google-auth-library");
const fetch = require("node-fetch");
const { URL } = require("url");

// Google Sheets setup
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = "1-WUulbDfcim9IaB1K9ANLvoAj8NFvscKScrYzOp3nyk";

// Service account credentials from environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

const redColor = { red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0 };
const yellowColor = { red: 1.0, green: 1.0, blue: 0.0, alpha: 1.0 };

exports.handler = async function (event, context) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sheetInfos = spreadsheet.data.sheets;

    for (let s = 0; s < Math.min(sheetInfos.length, 16); s++) {
      const sheetInfo = sheetInfos[s];
      const sheetId = sheetInfo.properties.sheetId;
      const sheetName = sheetInfo.properties.title;

      const range = `${sheetName}!A1:A`;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range,
      });

      const rows = result.data.values || [];
      const requests = [];

      for (let i = 0; i < rows.length; i++) {
        const url = rows[i][0];
        if (!isValidUrl(url)) {
          requests.push(setCellColor(sheetId, i, yellowColor));
        } else {
          const redirected = await isRedirect(url);
          if (redirected) {
            requests.push(setCellColor(sheetId, i, redColor));
          }
        }
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { requests },
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sheets checked and formatted!" }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return !!parsed.hostname;
  } catch {
    return false;
  }
}

async function isRedirect(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return res.status >= 300 && res.status < 400;
  } catch (err) {
    console.warn(`Error checking URL ${url}:`, err.message);
    return false;
  }
}

function setCellColor(sheetId, rowIndex, color) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: rowIndex,
        endRowIndex: rowIndex + 1,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: color,
        },
      },
      fields: "userEnteredFormat.backgroundColor",
    },
  };
}
