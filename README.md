# FREI Jobs Portal

A modern, responsive job board showcasing government and private sector jobs in Karnataka. Built for FREI (Future Ready Education Institute) with Kannada language support.

## Features

- 🔍 **Smart Search**: Quick job search functionality
- 🏷️ **Categories**: Easy filtering by job type (Karnataka Jobs, Central Jobs, etc.)
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🗺️ **Kannada Support**: Full local language implementation
- 📑 **Pagination**: Easy browsing through job listings (8 per page)
- 🔗 **Social Integration**: Telegram and WhatsApp channels

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

## Project Structure
```
job-post/
├── index.html           # Main landing page with job grid
├── contact.html         # Contact information
├── jobs.json           # Job listings data
├── job/                # Individual job detail pages
│   ├── job1.html      # Head Constable position
│   ├── job2.html      # Indian Bank Service
│   └── ... (jobs 3-16)
└── assets/
    ├── style.css      # Main stylesheet
    ├── app.js         # JavaScript functionality
    └── images/        # Job images
```

## Recent Updates

1. Added Kannada language support for all job pages
2. Implemented 8-jobs-per-page pagination system
3. Created 16 detailed job listing pages
4. Added search functionality and category filtering
5. Integrated social media buttons (Telegram/WhatsApp)
6. Fixed file paths and navigation structure

## Updating Jobs

To add or update job listings:

1. Create a new job detail page in `/job` directory
2. Add entry to `jobs.json`
3. Update images in `assets/images/`
4. Test pagination and links

For more detailed documentation, see [documentation.md](documentation.md).

## Contact

FREI - Future Ready Education Institute  
Website: [Your website]  
Email: [Your email]

## License

This project is licensed under the MIT License.
3. Search and filter should work in index.html

## Common Issues
- If jobs don't load, check browser console for CORS errors
- Make sure jobs.json is in the root directory
- Verify all file paths in HTML files are correct
