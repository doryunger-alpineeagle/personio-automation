describe('Examine Timecard Structure', () => {
  it('should examine timecard structure to understand attributes', () => {
    // Clear the log file at the start of each test
    cy.writeFile('cypress/logs/examine-timecard-structure-debug.log', '')
    
    // Helper function to log to both console and file
    const logToFile = (message) => {
      cy.log(message)
      cy.writeFile('cypress/logs/examine-timecard-structure-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
    }
    
    const companyDomain = 'alpine-eagle-gmbh'
    const username = 'dor.yunger@alpineeagle.com'
    const password = '1Z2w3c$r'
    const employeeId = 27547954
    
    logToFile('Starting timecard structure examination')
    
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
        cy.writeFile('cypress/logs/examine-timecard-structure-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
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
    
    // Step 4: Navigate to company domain and examine timecard structure
    cy.origin('https://alpine-eagle-gmbh.app.personio.com', { args: { employeeId } }, ({ employeeId }) => {
      const logToFile = (message) => {
        cy.log(message)
        cy.writeFile('cypress/logs/examine-timecard-structure-debug.log', `${new Date().toISOString()}: ${message}\n`, { flag: 'a+' })
      }
      
      cy.wait(5000)
      logToFile('Navigated to company app domain')
      
      // Verify successful login
      cy.url().should('include', 'alpine-eagle-gmbh.app.personio.com')
      logToFile('Successfully logged in to company domain')
      
      // Wait for page to fully load
      cy.wait(3000)
      
      // Use the exact cookie string provided by user
      const cookieString = '_vwo_uuid_v2=DC297C5C1656F50BDC95CBA2365657E3F|be8c4be57dc267e742a6ce3ca0460543; _fbp=fb.1.1744263825148.670913820242765381; ajs_user_id=null; ajs_group_id=null; ajs_anonymous_id=%220205d21b-be31-482b-afe6-6a79560a5ea3%22; _vwo_uuid=DC297C5C1656F50BDC95CBA2365657E3F; _ga=GA1.1.222114950.1744263825; hubspotutk=4ce5cf7561614f9e25d93c69cd5867ae; _pc=true; product_language=en-GB|27547954; ATHENA_SESSION=b83b1e27-9e93-4d7e-82f9-4c96909c2f69; ATHENA-XSRF-TOKEN=aba2daf9-4327-4dbb-95f0-b968b5523dd7.xbnVxnXS8s4kJ8DDKJ1uWDynZytMqQcKHx2Wi5Ig7oQ; personio_session=eyJpdiI6IlRlZ05JMUttVXFodzd2eXR6WEYzZmc9PSIsInZhbHVlIjoiSm9BVTJ4RXo3RmNOd1ZEUnFtM3FicTRZd3RyeDgvYm4wbUpyUnB4ck1mb2JXVW0vb0FlZTkvR0J1MThjQ2VpZmM2b0Q4Z3BMM21SR3JMbFl3V3B1N00zK3c1UE1vQUF6aHRWWUt0TGhXYU5pWVBpRHZjZFptMDU0QVY3eE5XNmQiLCJtYWMiOiJhZjYxNmU2YWZjMjJjYWM3OWYzYjhmNjM2YWM4NTQ3OTcyYjJjZWFjMzg2NDA3NTViYzIzM2U0OWI1YWZmMjIxIiwidGFnIjoiIn0%3D; _dd_s=aid=r7sp4zusof&rum=0&expire=1753860924146'
      
      const csrfToken = 'aba2daf9-4327-4dbb-95f0-b968b5523dd7.xbnVxnXS8s4kJ8DDKJ1uWDynZytMqQcKHx2Wi5Ig7oQ'
      
      logToFile(`Using exact cookie string: ${cookieString.substring(0, 100)}...`)
      logToFile(`Using CSRF token: ${csrfToken}`)
      
      // Get current month's timesheet data
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
      const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`
      
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
          logToFile(`Total timecards in response: ${timesheetData.timecards.length}`)
          
          // Examine each timecard structure
          timesheetData.timecards.forEach((timecard, index) => {
            logToFile(`\n=== Timecard ${index + 1} ===`)
            logToFile(`Date: ${timecard.date}`)
            logToFile(`Day ID: ${timecard.day_id}`)
            logToFile(`Status: ${timecard.status}`)
            logToFile(`Type: ${timecard.type}`)
            logToFile(`Periods count: ${timecard.periods ? timecard.periods.length : 'undefined'}`)
            
            // Log all available attributes
            logToFile(`All timecard keys: ${Object.keys(timecard).join(', ')}`)
            
            // Log detailed timecard structure
            logToFile(`Full timecard structure: ${JSON.stringify(timecard, null, 2)}`)
            
            // Check if it's empty
            const isEmpty = !timecard.periods || timecard.periods.length === 0
            logToFile(`Is empty: ${isEmpty}`)
            
            // Check if it's today or in the past
            const today = new Date().toISOString().split('T')[0]
            const isTodayOrPast = timecard.date <= today
            logToFile(`Is today or past: ${isTodayOrPast} (today: ${today})`)
            
            // Check if it's a weekend
            const date = new Date(timecard.date)
            const day = date.getDay()
            const isWeekend = day === 0 || day === 6
            logToFile(`Is weekend: ${isWeekend} (day: ${day})`)
          })
          
          // Find empty timecards that are today or in the past
          const today = new Date().toISOString().split('T')[0]
          const emptyPastTimecards = timesheetData.timecards.filter(timecard => {
            const isEmpty = !timecard.periods || timecard.periods.length === 0
            const isTodayOrPast = timecard.date <= today
            return isEmpty && isTodayOrPast
          })
          
          logToFile(`\n=== SUMMARY ===`)
          logToFile(`Empty timecards (today or past): ${emptyPastTimecards.length}`)
          emptyPastTimecards.forEach((timecard, index) => {
            logToFile(`Empty timecard ${index + 1}: ${timecard.date} (status: ${timecard.status})`)
          })
          
        } else {
          logToFile(`❌ Failed to fetch timesheet data: ${response.status}`)
        }
      })
    })
  })
}) 