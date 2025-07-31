#!/bin/bash

# Test script to verify cron job logic for last day of month
echo "Testing cron job logic for last day of month..."

# Get tomorrow's date
tomorrow=$(date +%d -d tomorrow)
echo "Tomorrow's day: $tomorrow"

# Check if tomorrow is the 1st (meaning today is the last day of month)
if [ "$tomorrow" = "01" ]; then
    echo "✅ Today is the last day of the month!"
    echo "✅ Cron job would run today at 18:30"
else
    echo "❌ Today is NOT the last day of the month"
    echo "❌ Cron job would NOT run today"
fi

# Show current date info
echo "Current date: $(date)"
echo "Current day: $(date +%d)"
echo "Current month: $(date +%m)"
echo "Current year: $(date +%Y)" 