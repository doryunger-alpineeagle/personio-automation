# Personio Monthly Timecard Filling Automation

This project automates the filling of empty timecards in Personio with realistic work data.

## Features

- ✅ **Random Start Times**: Generates start times between 7:45 AM and 9:05 AM
- ✅ **Realistic Work Hours**: Calculates end times 8.5-9.5 hours after start time
- ✅ **Smart Filtering**: Skips weekends, holidays, and future dates
- ✅ **Secure Credentials**: Uses environment variables for sensitive data
- ✅ **UUID Generation**: Properly generates UUIDs for timecard and period IDs
- ✅ **API Integration**: Uses Personio's REST API for reliable updates

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
# Personio Credentials
PERSONIO_USERNAME=your_email@company.com
PERSONIO_PASSWORD=your_password
PERSONIO_EMPLOYEE_ID=your_employee_id
PERSONIO_COMPANY_DOMAIN=your-company-domain
```

### 3. Make Script Executable
```bash
chmod +x run-personio-filling.sh
```

## Usage

### Run the Automation
```bash
./run-personio-filling.sh
```

### Run Manually with Cypress
```bash
npx cypress run --spec "cypress/e2e/personio-monthly-filling.cy.js" --headed
```

## How It Works

1. **Login**: Authenticates with Personio using credentials from `.env`
2. **Fetch Timecards**: Retrieves current month's timecard data
3. **Filter Empty**: Identifies empty timecards (no periods) that are:
   - Not off days (weekends/holidays)
   - Today or in the past (no future updates)
4. **Generate Data**: Creates realistic work periods with:
   - Random start times (7:45-9:05)
   - Calculated end times (8.5-9.5 hours later)
   - Proper UUIDs for timecard and period IDs
5. **Update API**: Uses PUT requests to update timecards via Personio API

## Security

- ✅ Credentials stored in `.env` file (not in code)
- ✅ `.env` file added to `.gitignore`
- ✅ Environment variables passed securely to Cypress

## Files

- `cypress/e2e/personio-monthly-filling.cy.js` - Main automation script
- `run-personio-filling.sh` - Bash script to run with environment variables
- `.env` - Environment variables (create this file)
- `cypress/logs/` - Debug logs for troubleshooting

## Troubleshooting

Check the debug logs in `cypress/logs/personio-monthly-filling-debug.log` for detailed information about the automation process.

## Requirements

- Node.js 18+
- Cypress 14+
- Valid Personio account with API access 