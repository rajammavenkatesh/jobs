# Static Job Board – Technical Architecture Guide

## Core Architecture
This is a serverless job board implementation using static files and client-side JavaScript. The application follows a JSON-first architecture where `jobs.json` acts as the primary data store.

### Key Technical Decisions
- **No Database**: Static JSON file storage enables simple hosting and deployment
- **Client-Side State**: User preferences stored in localStorage
- **Zero Backend**: All logic runs in browser for maximum portability

### Data Flow Patterns
```
[admin.html] --> (Create/Update) --> [jobs.json] --> (Read) --> [index.html]
                                       ^
                                       |
[localStorage] <-- (Save Friends) <-- (User Actions)
```

### Development Prerequisites
text
/
├── index.html           # Main job listing grid
├── admin.html           # Admin interface for adding jobs
├── jobs.json            # Stores all job posts (static JSON)
├── assets/
│   ├── style.css        # Grid layout and UI styles
│   └── app.js           # Handles UI and job logic
└── README.md            # This file
Installation Steps
Clone the Repository

bash
git clone https://github.com/yourusername/job-board-static.git
cd job-board-static
Serving the Site Locally

No database is needed.

To avoid browser CORS issues with JSON, start a static server:

bash
# Using Python 3
python3 -m http.server
# or using Node.js http-server
npx http-server .
Open http://localhost:8000 (Python) or the given port in your browser.

Admin: Posting New Jobs
Visit admin.html

Fill job details and submit.

The new job is appended to jobs.json and appears instantly on index.html.

For a production repo, admins can create Pull Requests to update jobs.json in GitHub.

Note: Direct writing to jobs.json in static hosting is simulated! For live data, instruct admin to update JSON in repo and push changes.

How Jobs Are Displayed
Job cards are shown in a CSS Grid on index.html.

Jobs are sorted by posted_on date (latest first).

Each card features title, description, tags, and an 'Add Friend' button.

Friend Feature
Users click 'Add Friend' on a job card.

The saved jobs are stored in localStorage; no backend required.

"Your Friends" list appears on the page showing all jobs user saved.

Ad Integration
Add your ad code snippet inside index.html wherever required (e.g., between grid rows or footer).

Job Data Format (jobs.json)
json
[
  {
    "id": 1,
    "title": "East Central Railway Recruitment 2025",
    "desc": "Multiple Group C openings.",
    "posted_by": "admin",
    "posted_on": "2025-09-28T22:00:00",
    "tags": ["Railway", "10th Pass"],
    "salary": "35,400 - 1,12,400"
  },
  ...
]
Customization
Grid: Edit assets/style.css for responsive column count and card design.

Job Card Fields: Modify app.js and jobs.json schema as desired.

Admin Security: For real deployments, restrict admin.html to authorized users using GitHub branch protection or Netlify Identity.

Deployment
Push to GitHub.

Enable GitHub Pages (or deploy to Netlify, Vercel, S3 static site hosting).

Ensure jobs.json is publicly readable.

Support
Raise issues or Pull Requests via GitHub if new features or bugfixes are required.

License
MIT or Apache-2.0