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

**Current Month (Default):**
```bash
./run-personio-filling.sh
```

**Previous Month:**
```bash
./run-personio-filling.sh true
```

### Run Manually with Cypress

**Current Month:**
```bash
npx cypress run --spec "cypress/e2e/personio-monthly-filling.cy.js" --env PREVIOUS_MONTH=false --headed
```

**Previous Month:**
```bash
npx cypress run --spec "cypress/e2e/personio-monthly-filling.cy.js" --env PREVIOUS_MONTH=true --headed
```

## How It Works

1. **Login**: Authenticates with Personio using credentials from `.env`
2. **Target Month**: Determines which month to process:
   - **Current Month** (default): Processes the current month's timecards
   - **Previous Month**: Processes the previous month's timecards (useful for catching missed days)
3. **Fetch Timecards**: Retrieves timecard data for the target month
4. **Filter Empty**: Identifies empty timecards (no periods) that are:
   - Not off days (weekends/holidays)
   - For current month: Today or in the past (no future updates)
   - For previous month: All days can be filled (no date restrictions)
5. **Generate Data**: Creates realistic work periods with:
   - Random start times (7:45-9:05)
   - Calculated end times (8.5-9.5 hours later)
   - Proper UUIDs for timecard and period IDs
6. **Update API**: Uses PUT requests to update timecards via Personio API

### Previous Month Mode
Use the `PREVIOUS_MONTH` parameter to fill timecards for the previous month. This is useful when:
- You missed filling some days in the previous month
- You want to ensure all timecards are complete before the month closes
- The system shows the current month by default, but you need to fill previous month data

**Important**: When `PREVIOUS_MONTH=true`, the script will **only** process timecards from the previous month and will **not** touch any current month timecards, even if they are empty.

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

## Automated Scheduling

### Cron Job Setup
The script is configured to run automatically on the last day of each month at 18:30.

**Cron Job Details:**
```bash
30 18 28-31 * * [ $(date +%d -d tomorrow) = 01 ] && cd /home/dory/git/personio-automation && ./run-personio-filling.sh >> logs/personio-cron.log 2>&1
```

**What this does:**
- Runs at 18:30 (6:30 PM) on days 28-31 of each month
- Only executes if tomorrow is the 1st (meaning today is the last day of the month)
- Changes to the project directory before running
- Logs output to `logs/personio-cron.log`

**To check if the cron job is active:**
```bash
crontab -l
```

**To view the logs:**
```bash
tail -f logs/personio-cron.log
```

**To test the cron logic:**
```bash
./test-cron-logic.sh
```

## Requirements

- Node.js 18+
- Cypress 14+
- Valid Personio account with API access 