# Job Board Static Website

## Quick Start

1. **Using Python (recommended)**:
   ```bash
   python -m http.server 8000
   ```
   Then open: http://localhost:8000

2. **Using Node.js**:
   ```bash
   npx http-server
   ```
   Then open the URL shown in terminal

3. **Using PHP**:
   ```bash
   php -S localhost:8000
   ```
   Then open: http://localhost:8000

4. **Using VS Code**:
   Install "Live Server" extension
   Right click on index.html -> "Open with Live Server"

## File Structure
```
job-post/
├── index.html     # Main job listing page
├── admin.html     # Admin interface
├── assets/        # CSS and JavaScript
├── jobs.json      # Job data
└── README.md      # This file
```

## Testing
1. Open index.html through the server (not directly)
2. Use admin.html to add test jobs
3. Search and filter should work in index.html

## Common Issues
- If jobs don't load, check browser console for CORS errors
- Make sure jobs.json is in the root directory
- Verify all file paths in HTML files are correct
