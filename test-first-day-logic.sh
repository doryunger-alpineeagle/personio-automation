#!/bin/bash

# Test script to verify first day of month logic for cron job

echo "📅 Testing First Day of Month Logic"
echo "=================================="

# Get current date info
current_date=$(date)
current_day=$(date +%d)
current_month=$(date +%m)
current_year=$(date +%Y)

echo "Current date: $current_date"
echo "Current day: $current_day"
echo "Current month: $current_month"
echo "Current year: $current_year"
echo ""

# Check if today is the first day of the month
if [ "$current_day" = "01" ]; then
    echo "✅ Today IS the first day of the month"
    echo "✅ Cron job would run today at 9:30 AM"
    echo "✅ Would fill timecards for the previous month"
    
    # Calculate previous month
    if [ "$current_month" = "01" ]; then
        # January -> December of previous year
        prev_month="12"
        prev_year=$((current_year - 1))
    else
        # Other months -> previous month of same year
        prev_month=$((current_month - 1))
        prev_year=$current_year
    fi
    
    echo "📋 Would fill timecards for: $prev_year-$prev_month"
else
    echo "❌ Today is NOT the first day of the month"
    echo "❌ Cron job would NOT run today"
fi

echo ""
echo "🎯 Cron job schedule: 30 9 1 * *"
echo "   - Runs at 9:30 AM"
echo "   - Only on day 1 of each month"
echo "   - With PREVIOUS_MONTH=true flag" 