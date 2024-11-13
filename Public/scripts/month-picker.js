class MonthRangePicker {
    constructor() {
        // Configuration
        this.minYear = 2000;
        this.maxYear = 2024;
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        // State
        this.leftYear = this.maxYear;
        this.rightYear = this.maxYear + 1;
        this.startDate = null;
        this.endDate = null;
        this.isSelecting = false;
        
        // Initialize
        this.initElements();
        this.initEventListeners();
        this.renderMonthGrids();

        // Event callback for external use
        this.onRangeSelected = null;
    }

    initElements() {
        // Main elements
        this.input = document.getElementById('monthRange');
        this.dropdown = document.getElementById('pickerDropdown');
        this.overlay = document.getElementById('overlay');
        this.selectedRange = document.getElementById('selectedRange');
        this.confirmBtn = document.getElementById('confirmSelection');
        
        // Year displays and grids
        this.yearDisplays = {
            left: document.querySelector('#monthGrid2024').previousElementSibling.querySelector('span'),
            right: document.querySelector('#monthGrid2025').previousElementSibling.querySelector('span')
        };
        this.monthGrids = {
            left: document.getElementById('monthGrid2024'),
            right: document.getElementById('monthGrid2025')
        };
    }

    initEventListeners() {
        // Input field events
        this.input.addEventListener('click', () => this.showPicker());
        this.input.addEventListener('input', (e) => this.handleManualInput(e.target.value));
        this.input.addEventListener('focus', () => this.input.select());
        
        // Navigation and overlay
        this.overlay.addEventListener('click', () => this.hidePicker());
        document.getElementById('prevYear2024').addEventListener('click', () => this.navigateYear('left', -1));
        document.getElementById('nextYear2024').addEventListener('click', () => this.navigateYear('left', 1));
        document.getElementById('prevYear2025').addEventListener('click', () => this.navigateYear('right', -1));
        document.getElementById('nextYear2025').addEventListener('click', () => this.navigateYear('right', 1));
        
        // Confirm button
        this.confirmBtn.addEventListener('click', () => {
            if (this.startDate && this.endDate) {
                this.updateInputValue();
                this.hidePicker();
                
                // Trigger callback if defined
                if (this.onRangeSelected) {
                    this.onRangeSelected({
                        startDate: this.startDate,
                        endDate: this.endDate,
                        formattedValue: this.input.value
                    });
                }
            }
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handlePresetClick(btn.dataset.range));
        });

        // Close picker on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePicker();
            }
        });
    }

    showPicker() {
        this.dropdown.classList.add('show');
        this.overlay.classList.add('show');
    }

    hidePicker() {
        this.dropdown.classList.remove('show');
        this.overlay.classList.remove('show');
    }

    navigateYear(side, direction) {
        const currentYear = side === 'left' ? this.leftYear : this.rightYear;
        const newYear = currentYear + direction;
        
        if (newYear >= this.minYear && newYear <= this.maxYear + 1) {
            if (side === 'left') {
                this.leftYear = newYear;
                if (this.leftYear >= this.rightYear) {
                    this.rightYear = this.leftYear + 1;
                }
            } else {
                this.rightYear = newYear;
                if (this.rightYear <= this.leftYear) {
                    this.leftYear = this.rightYear - 1;
                }
            }
            this.renderMonthGrids();
        }
    }

    renderMonthGrids() {
        // Update year displays
        this.yearDisplays.left.textContent = this.leftYear;
        this.yearDisplays.right.textContent = this.rightYear;
        
        // Render month grids
        this.renderGrid('left', this.leftYear);
        this.renderGrid('right', this.rightYear);
    }

    renderGrid(side, year) {
        const grid = this.monthGrids[side];
        grid.innerHTML = '';
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        this.months.forEach((month, index) => {
            const btn = document.createElement('button');
            btn.className = 'month-btn';
            btn.textContent = month;
            
            const date = new Date(year, index);
            
            // Disable future months in both current and future years
            if (year > currentYear || (year === currentYear && index > currentMonth)) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
            
            this.updateMonthButtonStyle(btn, date);
            
            if (!btn.disabled) {
                btn.addEventListener('click', () => this.handleMonthClick(date));
            }
            grid.appendChild(btn);
        });
    }

    updateMonthButtonStyle(btn, date) {
        btn.classList.remove('selected', 'in-range');
        
        if (this.startDate && this.endDate) {
            if (this.isSameMonth(date, this.startDate) || this.isSameMonth(date, this.endDate)) {
                btn.classList.add('selected');
            } else if (date > this.startDate && date < this.endDate) {
                btn.classList.add('in-range');
            }
        } else if (this.startDate && this.isSameMonth(date, this.startDate)) {
            btn.classList.add('selected');
        }
    }

    handleMonthClick(date) {
        if (!this.startDate || (this.startDate && this.endDate) || date < this.startDate) {
            this.startDate = date;
            this.endDate = null;
        } else {
            this.endDate = date;
        }
        
        this.updateSelectedRange();
        this.renderMonthGrids();
    }

    handleManualInput(value) {
        const regex = /^(0[1-9]|1[0-2])\/(\d{4})\s*-\s*(0[1-9]|1[0-2])\/(\d{4})$/;
        const match = value.match(regex);
        
        if (match) {
            const [, startMonth, startYear, endMonth, endYear] = match;
            
            if (this.isValidYear(startYear) && this.isValidYear(endYear)) {
                const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1);
                const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1);
                
                // Validate dates are not in future
                const now = new Date();
                if (startDate <= now && endDate <= now) {
                    this.startDate = startDate;
                    this.endDate = endDate;
                    
                    // Adjust visible years if necessary
                    this.leftYear = parseInt(startYear);
                    this.rightYear = parseInt(endYear);
                    if (this.leftYear === this.rightYear) {
                        this.rightYear++;
                    }
                    
                    this.updateSelectedRange();
                    this.renderMonthGrids();
                }
            }
        }
    }

    handlePresetClick(range) {
        const now = new Date();
        
        switch(range) {
            case 'this-year':
                this.startDate = new Date(now.getFullYear(), 0);
                this.endDate = new Date(now.getFullYear(), now.getMonth());
                break;
            case 'last-year':
                this.startDate = new Date(now.getFullYear() - 1, 0);
                this.endDate = new Date(now.getFullYear() - 1, 11);
                break;
            case 'last-6':
                this.endDate = new Date(now.getFullYear(), now.getMonth());
                this.startDate = new Date(now.getFullYear(), now.getMonth() - 5);
                break;
            case 'last-12':
                this.endDate = new Date(now.getFullYear(), now.getMonth());
                this.startDate = new Date(now.getFullYear(), now.getMonth() - 11);
                break;
        }
        
        this.leftYear = this.startDate.getFullYear();
        this.rightYear = this.endDate.getFullYear();
        if (this.leftYear === this.rightYear) {
            this.rightYear++;
        }
        
        this.updateSelectedRange();
        this.renderMonthGrids();
    }

    updateSelectedRange() {
        if (this.startDate && this.endDate) {
            const start = `${this.monthNames[this.startDate.getMonth()]} ${this.startDate.getFullYear()}`;
            const end = `${this.monthNames[this.endDate.getMonth()]} ${this.endDate.getFullYear()}`;
            this.selectedRange.textContent = `${start} - ${end}`;
        } else if (this.startDate) {
            const start = `${this.monthNames[this.startDate.getMonth()]} ${this.startDate.getFullYear()}`;
            this.selectedRange.textContent = `${start} - Select end date`;
        } else {
            this.selectedRange.textContent = 'Select date range';
        }
    }

    updateInputValue() {
        if (this.startDate && this.endDate) {
            const formatDate = (date) => {
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${month}/${date.getFullYear()}`;
            };
            this.input.value = `${formatDate(this.startDate)} - ${formatDate(this.endDate)}`;
        } else if (this.startDate) {
            const month = (this.startDate.getMonth() + 1).toString().padStart(2, '0');
            this.input.value = `${month}/${this.startDate.getFullYear()} - `;
        } else {
            this.input.value = '';
        }
    }

    // Utility methods
    isSameMonth(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() && 
               date1.getMonth() === date2.getMonth();
    }

    isValidYear(year) {
        const numYear = parseInt(year);
        return numYear >= this.minYear && numYear <= this.maxYear;
    }

    // Public methods for external use
    getSelectedRange() {
        return {
            startDate: this.startDate,
            endDate: this.endDate,
            formattedValue: this.input.value
        };
    }

    setOnRangeSelected(callback) {
        this.onRangeSelected = callback;
    }

    reset() {
        this.startDate = null;
        this.endDate = null;
        this.leftYear = this.maxYear;
        this.rightYear = this.maxYear + 1;
        this.input.value = '';
        this.updateSelectedRange();
        this.renderMonthGrids();
    }
}

// Initialize the picker
let monthPicker;
document.addEventListener('DOMContentLoaded', () => {
    monthPicker = new MonthRangePicker();
    
    // Example of using the callback
    monthPicker.setOnRangeSelected(range => {
        console.log('Selected range:', range);
        // You can trigger your data updates here
    });
});