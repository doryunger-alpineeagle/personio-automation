describe('Fill Empty Timecards', () => {
  it('should fill empty timecards with random start times and calculated end times', () => {
    // Clear the log file at the start of each test
    cy.writeFile('cypress/logs/fill-empty-timecards-debug.log', '')
    
    // Helper function to log to both console and file
    const logToFile = (message) => {
      cy.log(message)
      cy.writeFile('cypress/logs/fill-empty-timecards-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
    }
    
    const companyDomain = Cypress.env('PERSONIO_COMPANY_DOMAIN') || 'alpine-eagle-gmbh'
    const username = Cypress.env('PERSONIO_USERNAME') || 'dor.yunger@alpineeagle.com'
    const password = Cypress.env('PERSONIO_PASSWORD') || '1Z2w3c$r'
    const employeeId = Cypress.env('PERSONIO_EMPLOYEE_ID') || 27547954
    const previousMonth = Cypress.env('PREVIOUS_MONTH') === 'true'
    
    logToFile('Starting fill empty timecards test')
    logToFile(`Previous month mode: ${previousMonth}`)
    
    // Calculate the target month (current or previous)
    const currentDate = new Date()
    let targetDate
    
    if (previousMonth) {
      // Get previous month
      targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      logToFile('Targeting previous month for timecard filling')
    } else {
      // Use current month
      targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      logToFile('Targeting current month for timecard filling')
    }
    
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth() + 1
    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`
    
    // Calculate end date (last day of the target month)
    const lastDay = new Date(targetYear, targetMonth, 0).getDate()
    const endDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
    
    logToFile(`Target period: ${startDate} to ${endDate}`)
    
    // Step 1: Navigate to login page
    cy.visit('/login/')
    logToFile('Visited login page')
    
    // Step 2: Fill company domain with force
    cy.get('input[name="hostname"]').should('be.visible')
    cy.get('input[name="hostname"]').clear({ force: true }).type(companyDomain, { force: true })
    cy.get('button[type="submit"]').click({ force: true })
    logToFile('Submitted company domain')
    
    // Step 3: Handle cross-origin navigation to login.personio.com
    cy.origin('https://login.personio.com', { args: { username, password } }, ({ username, password }) => {
      const logToFile = (message) => {
        cy.log(message)
        cy.writeFile('cypress/logs/fill-empty-timecards-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
      }
      
      cy.wait(3000)
      
      // Fill in login credentials
      cy.get('input[name="username"]').clear().type(username)
      cy.get('button[type="submit"]').click()
      logToFile('Submitted username')
      
      cy.wait(2000)
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="password"]').clear().type(password)
      cy.get('button[type="submit"]').click()
      logToFile('Submitted password')
    })
    
    // Step 4: Navigate to company domain and fill empty timecards
    cy.origin('https://alpine-eagle-gmbh.app.personio.com', { args: { employeeId, startDate, endDate, previousMonth, targetDate } }, ({ employeeId, startDate, endDate, previousMonth, targetDate }) => {
      const logToFile = (message) => {
        cy.log(message)
        cy.writeFile('cypress/logs/fill-empty-timecards-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
      }
      
      cy.wait(5000)
      logToFile('Navigated to company app domain')
      
      // Verify successful login
      cy.url().should('include', 'alpine-eagle-gmbh.app.personio.com')
      logToFile('Successfully logged in to company domain')
      
      // Wait for page to fully load
      cy.wait(3000)
      
      // Helper function to generate random time between 7:45 and 9:05
      const generateRandomStartTime = () => {
        const startHour = 7
        const startMinute = 45
        const endHour = 9
        const endMinute = 5
        
        const startMinutes = startHour * 60 + startMinute // 7:45 = 465 minutes
        const endMinutes = endHour * 60 + endMinute // 9:05 = 545 minutes
        
        const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes
        const hours = Math.floor(randomMinutes / 60)
        const minutes = randomMinutes % 60
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
      
      // Helper function to generate UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }
      
      // Helper function to calculate end time (8.5-9.5 hours after start)
      const calculateEndTime = (startTime) => {
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const startTotalMinutes = startHour * 60 + startMinute
        
        // Random duration between 8.5 and 9.5 hours (510-570 minutes)
        const minDuration = 8.5 * 60 // 510 minutes
        const maxDuration = 9.5 * 60 // 570 minutes
        const randomDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration
        
        const endTotalMinutes = startTotalMinutes + randomDuration
        const endHours = Math.floor(endTotalMinutes / 60)
        const endMinutes = endTotalMinutes % 60
        
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
      }
      
      // Helper function to check if a timecard is empty (no periods)
      const isEmptyTimecard = (timecard) => {
        return !timecard.periods || timecard.periods.length === 0
      }
      
      // Helper function to check if a timecard should be skipped (holiday, weekend, etc.)
      const shouldSkipTimecard = (timecard) => {
        // Skip if it's an off day (weekends, holidays)
        if (timecard.is_off_day) {
          return true
        }
        
        // For previous month mode: only process timecards from the previous month
        // For current month mode: skip if it's in the future (only process today or past)
        if (previousMonth) {
          // Get the target month's date range
          const targetYear = targetDate.getFullYear()
          const targetMonth = targetDate.getMonth() + 1
          const targetStartDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`
          const lastDay = new Date(targetYear, targetMonth, 0).getDate()
          const targetEndDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
          
          // Only process timecards within the target month range
          if (timecard.date < targetStartDate || timecard.date > targetEndDate) {
            return true
          }
        } else {
          // Current month mode: skip if it's in the future
          const today = new Date().toISOString().split('T')[0]
          if (timecard.date > today) {
            return true
          }
        }
        
        return false
      }
      
      logToFile(`Starting to process empty timecards for period: ${startDate} to ${endDate}...`)
      
      // Use the exact cookie string provided by user
      const cookieString = '_vwo_uuid_v2=DC297C5C1656F50BDC95CBA2365657E3F|be8c4be57dc267e742a6ce3ca0460543; _fbp=fb.1.1744263825148.670913820242765381; ajs_user_id=null; ajs_group_id=null; ajs_anonymous_id=%220205d21b-be31-482b-afe6-6a79560a5ea3%22; _vwo_uuid=DC297C5C1656F50BDC95CBA2365657E3F; _ga=GA1.1.222114950.1744263825; hubspotutk=4ce5cf7561614f9e25d93c69cd5867ae; _pc=true; product_language=en-GB|27547954; ATHENA_SESSION=b83b1e27-9e93-4d7e-82f9-4c96909c2f69; ATHENA-XSRF-TOKEN=aba2daf9-4327-4dbb-95f0-b968b5523dd7.xbnVxnXS8s4kJ8DDKJ1uWDynZytMqQcKHx2Wi5Ig7oQ; personio_session=eyJpdiI6IlRlZ05JMUttVXFodzd2eXR6WEYzZmc9PSIsInZhbHVlIjoiSm9BVTJ4RXo3RmNOd1ZEUnFtM3FicTRZd3RyeDgvYm4wbUpyUnB4ck1mb2JXVW0vb0FlZTkvR0J1MThjQ2VpZmM2b0Q4Z3BMM21SR3JMbFl3V3B1N00zK3c1UE1vQUF6aHRWWUt0TGhXYU5pWVBpRHZjZFptMDU0QVY3eE5XNmQiLCJtYWMiOiJhZjYxNmU2YWZjMjJjYWM3OWYzYjhmNjM2YWM4NTQ3OTcyYjJjZWFjMzg2NDA3NTViYzIzM2U0OWI1YWZmMjIxIiwidGFnIjoiIn0%3D; _dd_s=aid=r7sp4zusof&rum=0&expire=1753860924146'
      
      const csrfToken = 'aba2daf9-4327-4dbb-95f0-b968b5523dd7.xbnVxnXS8s4kJ8DDKJ1uWDynZytMqQcKHx2Wi5Ig7oQ'
      
      logToFile(`Using exact cookie string: ${cookieString.substring(0, 100)}...`)
      logToFile(`Using CSRF token: ${csrfToken}`)
      
      logToFile(`Fetching timesheet for period: ${startDate} to ${endDate}`)
      
      // Test the timesheet API first
      cy.request({
        method: 'GET',
        url: `https://alpine-eagle-gmbh.app.personio.com/svc/attendance-bff/v1/timesheet/${employeeId}?start_date=${startDate}&end_date=${endDate}&timezone=Europe%2FBerlin`,
        headers: {
          'Cookie': cookieString,
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken,
          'X-ATHENA-XSRF-TOKEN': csrfToken
        },
        failOnStatusCode: false
      }).then((response) => {
        logToFile(`Timesheet API response status: ${response.status}`)
        
        if (response.status === 200 && response.body) {
          logToFile('✅ Successfully fetched timesheet data')
          
          const timesheetData = response.body
          
          // Log all timecards for debugging
          logToFile(`Total timecards in response: ${timesheetData.timecards.length}`)
          
          // Filter empty timecards that should be processed
          const emptyTimecards = timesheetData.timecards.filter(timecard => {
            const isEmpty = isEmptyTimecard(timecard)
            const shouldSkip = shouldSkipTimecard(timecard)
            
            if (isEmpty && !shouldSkip) {
              logToFile(`✅ Will process empty timecard for date: ${timecard.date}`)
            } else if (isEmpty && shouldSkip) {
              logToFile(`⏭️ Skipping empty timecard for date: ${timecard.date} (off day or outside target range)`)
            } else if (!isEmpty) {
              logToFile(`📝 Timecard for date: ${timecard.date} already has periods, skipping`)
            }
            
            return isEmpty && !shouldSkip
          })
          
          logToFile(`Found ${emptyTimecards.length} empty timecards to fill`)
          
          if (emptyTimecards.length > 0) {
            // Process each empty timecard
            emptyTimecards.forEach((timecard, index) => {
              logToFile(`Processing timecard ${index + 1}/${emptyTimecards.length} for date: ${timecard.date}`)
              
              // Generate random start time
              const startTime = generateRandomStartTime()
              const endTime = calculateEndTime(startTime)
              
              logToFile(`Generated start time: ${startTime}, end time: ${endTime}`)
              
              // Create new period data with proper UUID
              const newPeriod = {
                "id": generateUUID(), // Generate new UUID for the period
                "comment": null,
                "period_type": "work",
                "project_id": null,
                "start": `${timecard.date}T${startTime}:00`,
                "end": `${timecard.date}T${endTime}:00`,
                "auto_generated": false
              }
              
              const createPayload = {
                "employee_id": employeeId,
                "periods": [newPeriod],
                "original_periods": null,
                "geolocation": null,
                "is_from_clock_out": false
              }
              
              logToFile(`Create payload for ${timecard.date}: ${JSON.stringify(createPayload, null, 2)}`)
              
              // Always use PUT - generate day_id UUID if it's missing
              const dayId = timecard.day_id || generateUUID()
              const apiUrl = `https://alpine-eagle-gmbh.app.personio.com/svc/attendance-api/v1/days/${dayId}`
              const method = 'PUT'
              
              cy.request({
                method: method,
                url: apiUrl,
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': cookieString,
                  'X-Requested-With': 'XMLHttpRequest',
                  'X-CSRF-Token': csrfToken,
                  'X-ATHENA-XSRF-TOKEN': csrfToken
                },
                body: createPayload,
                failOnStatusCode: false
              }).then((response) => {
                logToFile(`PUT API response status for ${timecard.date}: ${response.status}`)
                logToFile(`PUT response body: ${JSON.stringify(response.body, null, 2)}`)
                
                if (response.status === 200 || response.status === 201) {
                  logToFile(`✅ Successfully updated timecard for ${timecard.date} with day_id: ${dayId}`)
                } else {
                  logToFile(`❌ Failed to update timecard for ${timecard.date} with status: ${response.status}`)
                  logToFile(`Error details: ${JSON.stringify(response.body, null, 2)}`)
                }
              })
            })
          } else {
            logToFile('No empty timecards found to fill')
          }
        } else {
          logToFile(`❌ Failed to fetch timesheet data: ${response.status}`)
        }
      })
    })
  })
}) 