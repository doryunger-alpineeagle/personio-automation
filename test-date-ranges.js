#!/usr/bin/env node

// Test script to demonstrate date range logic for current vs previous month

function getTargetDateRange(previousMonth = false) {
  const currentDate = new Date()
  let targetDate
  
  if (previousMonth) {
    // Get previous month
    targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    console.log('🎯 Targeting PREVIOUS month')
  } else {
    // Use current month
    targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    console.log('🎯 Targeting CURRENT month')
  }
  
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth() + 1
  const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`
  
  // Calculate end date (last day of the target month)
  const lastDay = new Date(targetYear, targetMonth, 0).getDate()
  const endDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
  
  return { startDate, endDate, targetDate }
}

function isInTargetRange(dateString, startDate, endDate) {
  return dateString >= startDate && dateString <= endDate
}

// Test the logic
console.log('📅 Date Range Logic Test\n')

const currentDate = new Date()
console.log(`Current date: ${currentDate.toISOString().split('T')[0]}`)
console.log(`Current month: ${currentDate.getMonth() + 1}`)
console.log(`Current year: ${currentDate.getFullYear()}\n`)

// Test current month
const currentRange = getTargetDateRange(false)
console.log(`Current month range: ${currentRange.startDate} to ${currentRange.endDate}\n`)

// Test previous month
const previousRange = getTargetDateRange(true)
console.log(`Previous month range: ${previousRange.startDate} to ${previousRange.endDate}\n`)

// Test some sample dates
const testDates = [
  '2025-07-15', // Previous month
  '2025-07-31', // Previous month
  '2025-08-01', // Current month
  '2025-08-15', // Current month
  '2025-08-31', // Current month
]

console.log('📋 Sample date filtering:')
testDates.forEach(date => {
  const inCurrentRange = isInTargetRange(date, currentRange.startDate, currentRange.endDate)
  const inPreviousRange = isInTargetRange(date, previousRange.startDate, previousRange.endDate)
  
  console.log(`${date}:`)
  console.log(`  - In current month range: ${inCurrentRange ? '✅' : '❌'}`)
  console.log(`  - In previous month range: ${inPreviousRange ? '✅' : '❌'}`)
}) 