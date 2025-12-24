/**
 * Class: PlantReportHandler
 * Handles form validation, data persistence, and UI feedback.
 */
class PlantReportHandler {
    constructor() {
        this.reports = JSON.parse(localStorage.getItem('plantReports')) || [];
        this.form = document.getElementById('plantForm');
        
        // Initialize based on which page we are on
        if (this.form) {
            this.initFormListeners();
        } else if (document.getElementById('reportsGrid')) {
            this.initViewListeners();
        }

        this.initTheme();
    }

    // --- Core Logic: Form Handling ---

    initFormListeners() {
        // Event Delegation for real-time validation
        this.form.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.validateField(e.target);
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.saveReport();
            }
        });
    }

    validateField(input) {
        let isValid = true;
        let errorMessage = "";
        const errorSpan = document.getElementById(`error-${input.id}`);

        // Validation Rules
        if (input.id === 'plantName') {
            if (input.value.trim().length < 3) {
                isValid = false;
                errorMessage = "Plant name must be at least 3 characters.";
            }
        }
        
        if (input.id === 'waterFrequency') {
            if (input.value <= 0 || input.value === "") {
                isValid = false;
                errorMessage = "Frequency must be a number greater than 0.";
            }
        }

        if (input.id === 'lastWatered') {
            const selectedDate = new Date(input.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today to midnight
            
            if (!input.value || selectedDate >= today) {
                isValid = false;
                errorMessage = "Please enter a valid past date.";
            }
        }

        if (input.id === 'plantNotes') {
            if (input.value.trim().length < 15) {
                isValid = false;
                errorMessage = "Notes must be at least 15 characters long.";
            }
        }

        // UI Feedback
        if (!isValid) {
            input.classList.add('input-error');
            if (errorSpan) errorSpan.textContent = errorMessage;
        } else {
            input.classList.remove('input-error');
            if (errorSpan) errorSpan.textContent = "";
        }

        return isValid;
    }

    validateForm() {
        const inputs = Array.from(this.form.querySelectorAll('input, select, textarea'));
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage("Please correct the errors above.", "error");
        }
        return isFormValid;
    }

    saveReport() {
        const formData = {
            id: Date.now(), // Unique ID for deletion
            name: document.getElementById('plantName').value,
            location: document.getElementById('plantLocation').value,
            frequency: document.getElementById('waterFrequency').value,
            date: document.getElementById('lastWatered').value,
            notes: document.getElementById('plantNotes').value
        };

        this.reports.push(formData);
        this.saveToLocalStorage();
        this.clearForm();
        this.showMessage("Report saved successfully!", "success");
    }

    saveToLocalStorage() {
        localStorage.setItem('plantReports', JSON.stringify(this.reports));
    }

    clearForm() {
        this.form.reset();
        // Clear error classes
        this.form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        this.form.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    }

    showMessage(msg, type) {
        const box = document.getElementById('messageBox');
        box.textContent = msg;
        box.className = `message-box ${type}`;
        box.style.display = 'block';
        
        // Auto-hide success messages
        if(type === 'success') {
            setTimeout(() => { box.style.display = 'none'; }, 3000);
        }
    }

    // --- Core Logic: View Page ---

    initViewListeners() {
        this.renderReports(this.reports);

        // Search Filter
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this.reports.filter(r => 
                r.name.toLowerCase().includes(term) || 
                r.location.toLowerCase().includes(term)
            );
            this.renderReports(filtered);
        });

        // Session Storage Bonus: Last Viewed
        const lastViewed = sessionStorage.getItem('lastViewedDate');
        const now = new Date().toLocaleString();
        if(lastViewed) {
            document.getElementById('lastViewedMsg').textContent = `Last visited: ${lastViewed}`;
        }
        sessionStorage.setItem('lastViewedDate', now);
    }

    renderReports(data) {
        const grid = document.getElementById('reportsGrid');
        const noData = document.getElementById('noDataMsg');
        grid.innerHTML = '';

        if (data.length === 0) {
            noData.classList.remove('hidden');
            return;
        } else {
            noData.classList.add('hidden');
        }

        data.forEach(report => {
            const card = document.createElement('div');
            card.className = 'report-card';
            card.innerHTML = `
                <h3>${report.name}</h3>
                <p><strong>📍 Location:</strong> ${report.location}</p>
                <p><strong>💧 Every:</strong> ${report.frequency} days</p>
                <p><strong>📅 Last Watered:</strong> ${report.date}</p>
                <p><em>"${report.notes}"</em></p>
                <button class="delete-btn" onclick="app.deleteReport(${report.id})">Delete</button>
            `;
            grid.appendChild(card);
        });
    }

    deleteReport(id) {
        if(confirm('Are you sure you want to delete this report?')) {
            this.reports = this.reports.filter(r => r.id !== id);
            this.saveToLocalStorage();
            this.renderReports(this.reports);
        }
    }

    // --- Bonus: Theme Toggle ---
    initTheme() {
        const toggleBtn = document.getElementById('themeToggle');
        const isDark = localStorage.getItem('darkMode') === 'true';
        
        if (isDark) document.body.classList.add('dark-mode');
        
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
        });
    }
}

// Initialize App
const app = new PlantReportHandler();