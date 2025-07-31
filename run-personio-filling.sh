#!/bin/bash

# Personio Monthly Timecard Filling Script
# This script loads environment variables and runs the Cypress test

set -e  # Exit on any error

# Check if PREVIOUS_MONTH parameter is provided
PREVIOUS_MONTH=${1:-false}

if [ "$PREVIOUS_MONTH" = "true" ] || [ "$PREVIOUS_MONTH" = "1" ]; then
    echo "🚀 Starting Personio Previous Month Timecard Filling..."
    PREVIOUS_MONTH_ENV="true"
else
    echo "🚀 Starting Personio Current Month Timecard Filling..."
    PREVIOUS_MONTH_ENV="false"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "PERSONIO_USERNAME=your_username"
    echo "PERSONIO_PASSWORD=your_password"
    echo "PERSONIO_EMPLOYEE_ID=your_employee_id"
    echo "PERSONIO_COMPANY_DOMAIN=your_company_domain"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
source .env

# Check if required variables are set
if [ -z "$PERSONIO_USERNAME" ] || [ -z "$PERSONIO_PASSWORD" ] || [ -z "$PERSONIO_EMPLOYEE_ID" ] || [ -z "$PERSONIO_COMPANY_DOMAIN" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please ensure all required variables are set in .env file:"
    echo "- PERSONIO_USERNAME"
    echo "- PERSONIO_PASSWORD"
    echo "- PERSONIO_EMPLOYEE_ID"
    echo "- PERSONIO_COMPANY_DOMAIN"
    exit 1
fi

echo "✅ Environment variables loaded successfully"
echo "👤 Username: $PERSONIO_USERNAME"
echo "🏢 Company Domain: $PERSONIO_COMPANY_DOMAIN"
echo "🆔 Employee ID: $PERSONIO_EMPLOYEE_ID"

# Run the Cypress test with environment variables
echo "🔄 Running Personio monthly filling test..."
npx cypress run \
    --spec "cypress/e2e/personio-monthly-filling.cy.js" \
    --env PERSONIO_USERNAME="$PERSONIO_USERNAME" \
    --env PERSONIO_PASSWORD="$PERSONIO_PASSWORD" \
    --env PERSONIO_EMPLOYEE_ID="$PERSONIO_EMPLOYEE_ID" \
    --env PERSONIO_COMPANY_DOMAIN="$PERSONIO_COMPANY_DOMAIN" \
    --env PREVIOUS_MONTH="$PREVIOUS_MONTH_ENV" \
    --headed

echo "✅ Personio monthly filling completed!" 