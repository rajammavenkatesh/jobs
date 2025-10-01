// State Management
let currentLang = 'kn';
let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
let jobs = [];
let viewMode = localStorage.getItem('viewMode') || 'grid';

// State Management
let jobGrid = null;
let savedJobsContainer = null;
const JOB_DATA_URL = './jobs.json';

// Initialize DOM elements
function initializeDOMElements() {
    debug('Initializing DOM elements');
    jobGrid = document.getElementById('jobGrid');
    savedJobsContainer = document.getElementById('savedJobs');
    
    debug('Found elements:', { 
        jobGrid: !!jobGrid, 
        savedJobsContainer: !!savedJobsContainer 
    });
}

// Debug logging function
function debug(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${message}`);
    if (data) {
        console.log('Data:', data);
    }
}

// Load and display jobs
async function loadJobs() {
  debug('Starting to load jobs from:', JOB_DATA_URL);
  try {
      // First try to fetch the jobs file
      const response = await fetch(JOB_DATA_URL);
      debug('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the text content and log it for debugging
      const text = await response.text();
      debug('Response text received, length:', text.length);
      
      // Try to parse the JSON
      try {
          const data = JSON.parse(text);
          debug('Successfully parsed JSON data');
          
          // Validate the data structure
          if (!Array.isArray(data)) {
              throw new Error('Jobs data is not an array');
          }
          
          debug(`Found ${data.length} jobs`);
          
          // Validate each job has the required fields
          const validJobs = data.filter(job => {
              const isValid = job && job.id && job.title && 
                            job.title.kn && job.title.en;
              if (!isValid) {
                  debug('Invalid job data:', job);
              }
              return isValid;
          });
          
          debug(`${validJobs.length} valid jobs found`);
          
          if (validJobs.length === 0) {
              throw new Error('No valid jobs found in data');
          }
          
          // Update the global jobs array
          jobs = validJobs;
          
          // Display the first job
          displayJobs(validJobs);
          
          return validJobs;
      } catch (parseError) {
          debug('JSON parse error:', parseError);
          throw new Error('Failed to parse jobs data: ' + parseError.message);
      }
  } catch (error) {
      debug('Error in loadJobs:', error);
      console.error('Error loading jobs:', error);
      const errorHtml = `
          <div class="error-message">
              <h2>ಕ್ಷಮಿಸಿ, ತಾಂತ್ರಿಕ ತೊಂದರೆ</h2>
              <p>ಉದ್ಯೋಗ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.</p>
              <button onclick="location.reload()">ಪುನಃ ಪ್ರಯತ್ನಿಸಿ</button>
          </div>
      `;
      
      if (jobGrid) {
          jobGrid.innerHTML = errorHtml;
      }
      throw error;
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    debug('Application starting...');
    try {
        debug('Initializing app...');
        const jobGridElement = document.getElementById('jobGrid');
        debug('Job grid element found:', jobGridElement);
        
        showLoading();
        debug('Loading jobs...');
        const jobsData = await loadJobs();
        debug('Jobs loaded:', jobsData);

        if (jobsData && jobsData.length > 0) {
            debug(`Found ${jobsData.length} jobs`);
            jobs = jobsData; // Update global jobs array
            hideLoading();
            debug('Displaying jobs...');
            displayJobs(jobsData);
            debug('Setting up event listeners...');
            setupEventListeners();
            if (savedJobsContainer) {
                debug('Updating saved jobs...');
                updateSavedJobs();
            }
        } else {
            debug('No jobs found in response');
            showErrorMessage('ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಲಭ್ಯವಿಲ್ಲ');
        }
    } catch (error) {
        debug('Error during initialization:', error);
        console.error('Failed to initialize app:', error);
        showErrorMessage('ಕ್ಷಮಿಸಿ, ಉದ್ಯೋಗ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ');
    }
});

async function initializeApp() {
    debug('Initializing app...');
    try {
        initializeDOMElements();
        showLoading();
        debug('Loading jobs...');
        const loadedJobs = await loadJobs();
        if (loadedJobs && loadedJobs.length > 0) {
            debug(`Loaded ${loadedJobs.length} jobs successfully`);
            jobs = loadedJobs; // Update global jobs array
            hideLoading();
            displayJobs(jobs);
            setupEventListeners();
            updateSavedJobs();
            debug('App initialized successfully');
        } else {
            debug('No jobs found in response');
            showErrorMessage('ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಲಭ್ಯವಿಲ್ಲ');
        }
    } catch (error) {
        debug('Error during app initialization:', error);
        showErrorMessage('ಕ್ಷಮಿಸಿ, ಉದ್ಯೋಗ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ');
    }
}

function showLoading() {
    const jobGrid = document.getElementById('jobGrid');
    if (jobGrid) {
        jobGrid.innerHTML = '<div class="loading">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>';
    }
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

function showErrorMessage(message) {
    const jobGrid = document.getElementById('jobGrid');
    if (jobGrid) {
        jobGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

function displayJobs(jobsToDisplay) {
    debug('Displaying jobs array:', jobsToDisplay);
    
    if (!jobGrid) {
        debug('Job grid element not found - reinitializing elements');
        initializeDOMElements();
        if (!jobGrid) {
            console.error('Could not find job grid element');
            return;
        }
    }

    try {
        if (!Array.isArray(jobsToDisplay) || jobsToDisplay.length === 0) {
            debug('No jobs to display');
            jobGrid.innerHTML = '<p>ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಲಭ್ಯವಿಲ್ಲ</p>';
            return;
        }
        
        // Update filter options
        updateFilterOptions(jobsToDisplay);

        const jobsHtml = jobsToDisplay.map(job => {
            try {
                debug('Processing job:', job);
                // Basic validation
                if (!job.id || !job.title || !job.title[currentLang]) {
                    debug('Invalid job data structure:', job);
                    return '';
                }

                // Create job card HTML with proper error handling for optional fields
                return `
                    <article class="job-card" data-job-id="${job.id}">
                        <h3 class="job-title">${job.title[currentLang]}</h3>
                        <div class="job-meta">
                            <span class="location">📍 ${job.location?.[currentLang] || ''}</span>
                            ${job.totalPosts ? `<span class="posts">👥 ${job.totalPosts} ಹುದ್ದೆಗಳು</span>` : ''}
                        </div>
                        ${job.qualification?.[currentLang] ? 
                            `<p class="qualification">${job.qualification[currentLang]}</p>` : ''}
                        ${job.salary?.amount ? 
                            `<div class="salary">💰 ವೇತನ: ${job.salary.currency || '₹'}${job.salary.amount}</div>` : ''}
                        ${job.importantDates?.end ? 
                            `<div class="last-date">📅 ಕೊನೆಯ ದಿನಾಂಕ: ${formatDate(job.importantDates.end)}</div>` : ''}
                        <div class="actions">
                            <button onclick="viewJobDetails('${job.id}')" class="view-btn">ವಿವರಗಳು</button>
                            <button onclick="toggleSaveJob('${job.id}')" class="save-btn ${savedJobs.includes(job.id) ? 'saved' : ''}">
                                ${savedJobs.includes(job.id) ? 'ಉಳಿಸಲಾಗಿದೆ' : 'ಉಳಿಸಿ'}
                            </button>
                        </div>
                    </article>
                `;
            } catch (error) {
                debug('Error processing individual job:', error);
                console.error('Error processing job:', error);
                return '';
            }
        }).join('');

        debug('Generated jobs HTML, length:', jobsHtml.length);
        
        if (!jobsHtml) {
            jobGrid.innerHTML = '<p>ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಲಭ್ಯವಿಲ್ಲ</p>';
        } else {
            jobGrid.innerHTML = jobsHtml;
            debug('Jobs displayed successfully');
        }
    } catch (error) {
        debug('Error in displayJobs:', error);
        console.error('Failed to display jobs:', error);
        jobGrid.innerHTML = '<p>ಉದ್ಯೋಗಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲು ವಿಫಲವಾಗಿದೆ</p>';
    }
}

// Job Details Modal
function showJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('jobDetailModal');
    const content = modal.querySelector('.job-detail-content');
    
    content.innerHTML = createDetailedJobCard(job);
    modal.style.display = 'block';

    // Close button handler
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Click outside to close
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function updateSavedJobs() {
    const savedJobsContainer = document.getElementById('savedJobs');
    if (!savedJobsContainer) return;

    if (savedJobs.length === 0) {
        savedJobsContainer.innerHTML = '<p>ಯಾವುದೇ ಉದ್ಯೋಗಗಳನ್ನು ಉಳಿಸಲಾಗಿಲ್ಲ</p>';
        return;
    }

    loadJobs().then(jobs => {
        const savedJobsData = jobs.filter(job => savedJobs.includes(job.id));
        savedJobsContainer.innerHTML = savedJobsData.map(job => `
            <div class="saved-job-card">
                <h4>${job.title[currentLang]}</h4>
                <p>${job.location[currentLang]}</p>
                <button onclick="toggleSaveJob('${job.id}')" class="remove-btn">ತೆಗೆದುಹಾಕಿ</button>
            </div>
        `).join('');
    });
}

function toggleSaveJob(jobId) {
    const index = savedJobs.indexOf(jobId);
    if (index === -1) {
        savedJobs.push(jobId);
    } else {
        savedJobs.splice(index, 1);
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    updateSavedJobs();
    
    // Update the save button in the main job grid
    const saveBtn = document.querySelector(`[data-job-id="${jobId}"] .save-btn`);
    if (saveBtn) {
        saveBtn.classList.toggle('saved');
        saveBtn.textContent = savedJobs.includes(jobId) ? 'ಉಳಿಸಲಾಗಿದೆ' : 'ಉಳಿಸಿ';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('kn-IN', options);
}

function createDetailedJobCard(job) {
    return `
        <article class="job-card" data-job-id="${job.id}">
            <div class="job-detail-header">
                <h2 class="job-title">${job.title[currentLang]}</h2>
                <div class="job-meta">
                    <span class="location">📍 ${job.location[currentLang]}</span>
                    <span class="posts">👥 ${job.totalPosts} ಹುದ್ದೆಗಳು</span>
                </div>
            </div>

            <div class="job-detail-section">
                <h3>🎓 ವಿದ್ಯಾರ್ಹತೆ</h3>
                <p>${job.qualification[currentLang]}</p>
            </div>

            <div class="job-detail-section">
                <h3>💰 ವೇತನ ಮತ್ತು ಪ್ರಯೋಜನಗಳು</h3>
                <p>${job.salary.currency}${job.salary.amount}</p>
                ${job.benefits ? `<ul class="benefits-list">
                    ${job.benefits[currentLang].map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>` : ''}
            </div>

            <div class="job-detail-section">
                <h3>📅 ಮುಖ್ಯ ದಿನಾಂಕಗಳು</h3>
                <div class="dates-grid">
                    <div>
                        <strong>ಅರ್ಜಿ ಪ್ರಾರಂಭ:</strong>
                        <span>${formatDate(job.importantDates.start)}</span>
                    </div>
                    <div>
                        <strong>ಕೊನೆಯ ದಿನಾಂಕ:</strong>
                        <span>${formatDate(job.importantDates.end)}</span>
                    </div>
                    ${job.importantDates.examDate ? `
                    <div>
                        <strong>ಪರೀಕ್ಷೆಯ ದಿನಾಂಕ:</strong>
                        <span>${formatDate(job.importantDates.examDate)}</span>
                    </div>` : ''}
                </div>
            </div>

            ${job.selectionProcess ? `
            <div class="job-detail-section">
                <h3>📋 ಆಯ್ಕೆ ಪ್ರಕ್ರಿಯೆ</h3>
                <ol class="selection-steps">
                    ${job.selectionProcess[currentLang].map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>` : ''}

            <div class="job-detail-section">
                <h3>💳 ಅರ್ಜಿ ಶುಲ್ಕ</h3>
                <div class="fee-details">
                    <p><strong>ಸಾಮಾನ್ಯ ವರ್ಗ:</strong> ₹${job.applicationFee.general}</p>
                    <p><strong>ಮೀಸಲಾತಿ ವರ್ಗಗಳು:</strong> ₹${job.applicationFee.reserved}</p>
                </div>
            </div>

            <div class="job-tags">
                ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>

            <div class="actions">
                <button onclick="viewJobDetails('${job.id}')" class="view-btn">ವಿವರಗಳು</button>
                <button onclick="toggleSaveJob('${job.id}')" 
                        class="save-btn ${savedJobs.includes(job.id) ? 'saved' : ''}">
                    ${savedJobs.includes(job.id) ? 'ಉಳಿಸಲಾಗಿದೆ' : 'ಉಳಿಸಿ'}
                </button>
                <button onclick="applyForJob('${job.id}')" class="apply-btn">ಅರ್ಜಿ ಸಲ್ಲಿಸಿ</button>
            </div>
        </article>
    `;
}

function updateFilterOptions(jobs) {
    const qualificationFilter = document.getElementById('qualificationFilter');
    const locationFilter = document.getElementById('locationFilter');
    const tagFilter = document.getElementById('tagFilter');

    // Collect unique values
    const qualifications = new Set();
    const locations = new Set();
    const tags = new Set();

    jobs.forEach(job => {
        if (job.qualification && job.qualification[currentLang]) {
            qualifications.add(job.qualification[currentLang]);
        }
        if (job.location && job.location[currentLang]) {
            locations.add(job.location[currentLang]);
        }
        if (job.tags) {
            job.tags.forEach(tag => tags.add(tag));
        }
    });

    // Update qualification filter
    if (qualificationFilter) {
        qualificationFilter.innerHTML = '<option value="">ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಹತೆಗಳು</option>' +
            Array.from(qualifications)
                .map(q => `<option value="${q}">${q}</option>`)
                .join('');
    }

    // Update location filter
    if (locationFilter) {
        locationFilter.innerHTML = '<option value="">ಎಲ್ಲಾ ಸ್ಥಳಗಳು</option>' +
            Array.from(locations)
                .map(l => `<option value="${l}">${l}</option>`)
                .join('');
    }

    // Update tags filter
    if (tagFilter) {
        tagFilter.innerHTML = '<option value="">ಎಲ್ಲಾ ವರ್ಗಗಳು</option>' +
            Array.from(tags)
                .map(t => `<option value="${t}">${t}</option>`)
                .join('');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const tagFilter = document.getElementById('tagFilter');
    const qualificationFilter = document.getElementById('qualificationFilter');
    const locationFilter = document.getElementById('locationFilter');
    const langToggle = document.getElementById('langToggle');
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');

    searchInput?.addEventListener('input', filterJobs);
    tagFilter?.addEventListener('change', filterJobs);
    qualificationFilter?.addEventListener('change', filterJobs);
    locationFilter?.addEventListener('change', filterJobs);
    
    langToggle?.addEventListener('click', () => {
        currentLang = currentLang === 'kn' ? 'en' : 'kn';
        langToggle.textContent = currentLang === 'kn' ? 'English' : 'ಕನ್ನಡ';
        loadJobs().then(displayJobs);
    });

    // View mode toggle
    gridViewBtn?.addEventListener('click', () => {
        viewMode = 'grid';
        localStorage.setItem('viewMode', 'grid');
        gridViewBtn.classList.add('active');
        listViewBtn?.classList.remove('active');
        jobGrid?.classList.remove('list-view');
        displayJobs(jobs);
    });

    listViewBtn?.addEventListener('click', () => {
        viewMode = 'list';
        localStorage.setItem('viewMode', 'list');
        listViewBtn.classList.add('active');
        gridViewBtn?.classList.remove('active');
        jobGrid?.classList.add('list-view');
        displayJobs(jobs);
    });

    // Set initial view mode
    if (viewMode === 'list') {
        listViewBtn?.click();
    } else {
        gridViewBtn?.click();
    }
}

function filterJobs() {
    const searchInput = document.getElementById('searchInput');
    const tagFilter = document.getElementById('tagFilter');
    
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const selectedTag = tagFilter?.value || '';

    loadJobs().then(jobs => {
        const filteredJobs = jobs.filter(job => {
            const matchesSearch = 
                job.title[currentLang].toLowerCase().includes(searchTerm) ||
                job.location[currentLang].toLowerCase().includes(searchTerm) ||
                job.qualification[currentLang].toLowerCase().includes(searchTerm);
            
            const matchesTag = !selectedTag || job.tags.includes(selectedTag);
            
            return matchesSearch && matchesTag;
        });
        
        displayJobs(filteredJobs);
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    debug('Starting initialization...');
    try {
        // Initialize DOM elements
        initializeDOMElements();
        
        // Show loading state
        if (jobGrid) {
            jobGrid.innerHTML = '<div class="loading">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>';
        }
        
        // Load and display jobs
        const loadedJobs = await loadJobs();
        if (loadedJobs && loadedJobs.length > 0) {
            debug('Jobs loaded successfully:', loadedJobs.length);
            displayJobs(loadedJobs);
            setupEventListeners();
        } else {
            debug('No jobs were loaded');
            if (jobGrid) {
                jobGrid.innerHTML = '<p>ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಲಭ್ಯವಿಲ್ಲ</p>';
            }
        }
    } catch (error) {
        debug('Error during initialization:', error);
        if (jobGrid) {
            jobGrid.innerHTML = '<p>ಉದ್ಯೋಗ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</p>';
        }
    }
});

function renderJob(job) {
    if (!job) return;

    // Update page title
    document.title = `${job.title.kn} | ಉದ್ಯೋಗ ಮಾಹಿತಿ`;

    // Update job title
    const titleElement = document.querySelector('.job-title');
    if (titleElement) titleElement.textContent = job.title.kn;

    // Update job summary
    const locationElement = document.querySelector('.job-summary .location');
    if (locationElement) locationElement.textContent = `📍 ಕರ್ತವ್ಯ ಸ್ಥಳ: ${job.location.kn}`;

    const postsElement = document.querySelector('.job-summary .posts');
    if (postsElement) postsElement.textContent = `👥 ಹುದ್ದೆಗಳು: ${job.totalPosts}`;

    // Set important dates
    const lastDateElement = document.querySelector('.job-summary .last-date');
    if (lastDateElement) {
        const endDate = new Date(job.importantDates.end);
        lastDateElement.textContent = `📅 ಕೊನೆಯ ದಿನಾಂಕ: ${formatDate(endDate)}`;
    }

    // Update other sections...
    updateQualification(job.qualification.kn);
    updateSalary(job.salary);
    updateSelectionProcess(job.selectionProcess.kn);
    updateApplicationFee(job.applicationFee);
    updateImportantDates(job.importantDates);
}

// Helper functions
function updateQualification(qualification) {
    const qualificationElement = document.querySelector('.qualification');
    if (qualificationElement) qualificationElement.textContent = qualification;
}

function updateSalary(salary) {
    const salaryElement = document.querySelector('.salary');
    if (salaryElement) {
        salaryElement.textContent = `ಮಾಸಿಕ ${salary.currency}${salary.amount.toLocaleString('kn-IN')}`;
    }
}

function updateSelectionProcess(process) {
    const processList = document.querySelector('.process-list');
    if (processList) {
        processList.innerHTML = process.map(step => `<li>${step}</li>`).join('');
    }
}

function updateApplicationFee(fee) {
    const feeDetails = document.querySelector('.fee-details');
    if (feeDetails) {
        feeDetails.innerHTML = `
            <p>SC, ST, PWD, ಮಹಿಳಾ, ಅಲ್ಪಸಂಖ್ಯಾತ, ಮಾಜಿ ಸೈನಿಕ, ಇಬಿಸಿ ಅಭ್ಯರ್ಥಿಗಳಿಗೆ: ₹${fee.reserved}</p>
            <p>ಉಳಿದವರಿಗೆ: ₹${fee.general}</p>
        `;
    }
}

function updateImportantDates(dates) {
    const datesContainer = document.querySelector('.dates');
    if (datesContainer) {
        datesContainer.innerHTML = `
            <p>ಅರ್ಜಿ ಪ್ರಾರಂಭ: ${formatDate(dates.start)}</p>
            <p>ಅರ್ಜಿ ಕೊನೆ ದಿನ: ${formatDate(dates.end)}</p>
            <p>ಶುಲ್ಕ ಪಾವತಿ ಕೊನೆ ದಿನ: ${formatDate(dates.feePaymentEnd)}</p>
        `;
    }
}

// TRANSLATIONS
const TRANSLATIONS = {
    kn: {
        title: 'ಉದ್ಯೋಗ ಮಾಹಿತಿ',
        apply: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
        save: 'ಉಳಿಸಿ',
        saved: 'ಉಳಿಸಲಾಗಿದೆ',
        share: 'ಹಂಚಿಕೊಳ್ಳಿ',
        copied: 'ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!'
    },
    en: {
        title: 'Job Information',
        apply: 'Apply Now',
        save: 'Save',
        saved: 'Saved',
        share: 'Share',
        copied: 'Link copied!'
    }
};

// Additional DOM Elements
const searchInput = document.getElementById('searchInput');
const tagFilter = document.getElementById('tagFilter');
const jobForm = document.getElementById('jobForm');

// Utility Functions
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const updateLocalStorage = () => {
    localStorage.setItem('savedJobs', JSON.stringify([...savedJobs]));
};

// Job Card Creation
const createJobCard = (job) => {
    const template = document.getElementById('job-card-template');
    const card = template.content.cloneNode(true);

    card.querySelector('.job-title').textContent = job.title;
    card.querySelector('.job-desc').textContent = job.desc;
    card.querySelector('.job-salary').textContent = job.salary;
    card.querySelector('.job-date').textContent = formatDate(job.posted_on);

    const tagsContainer = card.querySelector('.job-tags');
    job.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'job-tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
    });

    const saveButton = card.querySelector('.save-job');
    saveButton.textContent = savedJobs.has(job.id) ? 'Unsave' : 'Save Job';
    saveButton.addEventListener('click', () => toggleSaveJob(job));

    return card;
};

// Job Management
const toggleSaveJob = (job) => {
    if (savedJobs.has(job.id)) {
        savedJobs.delete(job.id);
    } else {
        savedJobs.add(job.id);
    }
    updateLocalStorage();
    renderJobs();
    renderSavedJobs();
};

const renderJobs = (filteredJobs = jobs) => {
    if (!jobGrid) return;
    
    jobGrid.innerHTML = '';
    filteredJobs.forEach(job => {
        jobGrid.appendChild(createJobCard(job));
    });
};

const renderSavedJobs = () => {
    if (!savedJobsContainer) return;

    savedJobsContainer.innerHTML = '';
    const savedJobsList = jobs.filter(job => savedJobs.has(job.id));
    
    savedJobsList.forEach(job => {
        savedJobsContainer.appendChild(createJobCard(job));
    });
};

// Filtering
const filterJobs = () => {
    const searchTerm = searchInput?.value.toLowerCase();
    const selectedTag = tagFilter?.value;

    const filtered = jobs.filter(job => {
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.desc.toLowerCase().includes(searchTerm);
        
        const matchesTag = !selectedTag || 
            job.tags.includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    renderJobs(filtered);
};

// Tag Management
const updateTagFilter = () => {
    if (!tagFilter) return;

    const allTags = new Set();
    jobs.forEach(job => {
        job.tags.forEach(tag => allTags.add(tag));
    });

    tagFilter.innerHTML = '<option value="">All Tags</option>';
    [...allTags].sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
};

// Admin Functions
const addNewJob = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newJob = {
        id: Date.now(),
        title: formData.get('title'),
        desc: formData.get('desc'),
        salary: formData.get('salary'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
        posted_by: 'admin',
        posted_on: new Date().toISOString()
    };

    jobs.unshift(newJob);
    await saveJobs();
    event.target.reset();
    renderJobsList();
};

const saveJobs = async () => {
    try {
        const response = await fetch(JOBS_FILE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobs, null, 2)
        });

        if (!response.ok) {
            throw new Error('Failed to save jobs');
        }
    } catch (error) {
        console.error('Error saving jobs:', error);
        alert('Failed to save job. Please try again.');
    }
};

const renderJobsList = () => {
    const jobsList = document.getElementById('jobsList');
    if (!jobsList) return;

    jobsList.innerHTML = '';
    jobs.forEach(job => {
        const item = document.createElement('div');
        item.className = 'job-list-item';
        item.innerHTML = `
            <h3>${job.title}</h3>
            <p>${formatDate(job.posted_on)}</p>
        `;
        jobsList.appendChild(item);
    });
};

// Event Listeners
searchInput?.addEventListener('input', filterJobs);
tagFilter?.addEventListener('change', filterJobs);
jobForm?.addEventListener('submit', addNewJob);

// Initialize
const init = async () => {
    try {
        const response = await fetch(JOBS_FILE);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        jobs = await response.json();
        renderJobs();
        renderSavedJobs();
        updateTagFilter();
    } catch (error) {
        console.error('Error loading jobs:', error);
        alert('Failed to load jobs. Please try again later.');
    }
};

// Start the application
init();