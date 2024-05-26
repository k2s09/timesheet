const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rcvwzS4KJ',
    database: 'timesheet'
});

app.get('/getTimesheet', (req, res) => {
    const { userId, Week } = req.query; // Extracting userId and Week from the query parameters

    if (!userId ||!Week) {
        return res.status(400).json({ success: false, message: 'Missing userId or Week' });
    }

    // SQL Query to fetch data
    const query = `
        SELECT ProjectName, Date1, Date2, Date3, Date4, Date5 
        FROM Timesheet 
        WHERE UserID =? AND Week =? AND Month = 5
    `;

    db.query(query, [userId, Week], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Initialize arrays for each project name
        let projectA = [];
        let projectB = [];
        let leave = [];

        // Aggregate data into arrays based on ProjectName
        results.forEach(row => {
            switch (row.ProjectName) {
                case 'Project A':
                    projectA.push(row.Date1, row.Date2, row.Date3, row.Date4, row.Date5);
                    break;
                case 'Project B':
                    projectB.push(row.Date1, row.Date2, row.Date3, row.Date4, row.Date5);
                    break;
                case 'Leave':
                    leave.push(row.Date1, row.Date2, row.Date3, row.Date4, row.Date5);
                    break;
                default:
                    console.warn(`Unknown ProjectName: ${row.ProjectName}`);
            }
        });

        // Ensure each array has exactly 15 elements
        const maxLength = Math.max(projectA.length, projectB.length, leave.length);
        projectA = projectA.slice(0, maxLength);
        projectB = projectB.slice(0, maxLength);
        leave = leave.slice(0, maxLength);

        // Return the data as JSON
        return res.json({
            projectA,
            projectB,
            leave
        });
    });
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

/// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE userID =? AND pass =?'; // Adjust according to your schema
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (results.length > 0) {
            req.session.userID = results[0].userID; // Store userID in session
            res.cookie('userID', results[0].userID, { httpOnly: true }); // Set userID in a cookie
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});


// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('Failed to logout');
        }
        res.cookie('session_id', '', { maxAge: -1, httpOnly: true });
        res.redirect('/');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.post('/updateTimesheet', (req, res) => {
    const { userID, week, projectA, projectB, leave } = req.body;

    // Prepare the SQL query
    const query = `
        UPDATE Timesheet 
        SET Date1 =?, Date2 =?, Date3 =?, Date4 =?, Date5 =?
        WHERE UserID =? AND Week =? AND ProjectName IN (?,?,?)
    `;

    // Execute the query for each project
    const projects = ['Project A', 'Project B', 'Leave'];
    const dates = [projectA, projectB, leave];

    projects.forEach((project, index) => {
        db.query(query, [...dates[index], userID, week,...projects], (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    });

    // Send a success response
    res.json({ success: true, message: 'Timesheet updated successfully' });
});
