# timesheet

The purpose of a timesheet app is for employees to complete their requisite weekly work hours, for which they are compensated.

## Tech Stack

mySQL, Express, Node, HTML, CSS, JS & Libraries, hosted on `platforms`.

## How to Use

1. Open `website`.  
2. Valid login credentials are:  
'John', 'A1B2'  
'Doe', 'HJKL1'
3. Log hours for May. (Application can be scaled throughout months and years)

## Database Schema

**Table 1: Users**
userID - String
pass - String

**Table 2: Timesheet**  
Project Name (Project A / Project B / Leave) - String  
Month - Int  
Week - Int  
Date1, Date2, Date3, Date4, Date5 - Float

## How to build

```
git clone https://github.com/k2s09/timesheet.git
cd timesheet
npm install express body-parser mysql2 express-session
node server.js
```
