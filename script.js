const app = {
    state: {
        expenses: [],
        currentPage: 'panel',
        chart: null,
    },
    
    // App constants
    CATEGORIES: {
        'Operativo': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>`,
        'Maquila': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>`,
        'Impresión': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        'Suela': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
        'Corte': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,
        'Empaque': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'Insumos': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'Publicidad y Eventos': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'Paquetería Salidas': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'Paquetería Entradas': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'SAT': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
        'Gas': `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`
    },
    CATEGORY_COLORS: {
        'Operativo': '#ef4444', 
        'Maquila': '#3b82f6', 
        'Impresión': '#a855f7', 
        'Suela': '#22c55e',
        'Corte': '#ec4899',
        'Empaque': '#f97316',
        'Insumos': '#14b8a6',
        'Publicidad y Eventos': '#6366f1',
        'Paquetería Salidas': '#f59e0b',
        'Paquetería Entradas': '#10b981',
        'SAT': '#8b5cf6',
        'Gas': '#d946ef'
    },

    // Initialization
    init() {
        this.loadExpenses();
        this.setupEventListeners();
        this.populateDropdowns();
        this.navigateTo(this.state.currentPage, true);
    },

    // Event Listeners
    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        document.getElementById('new-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
        
        // Filter listeners
        document.getElementById('filter-month').addEventListener('change', () => this.renderReportList());
        document.getElementById('filter-year').addEventListener('change', () => this.renderReportList());
        document.getElementById('filter-category').addEventListener('change', () => this.renderReportList());
    },

    // Navigation
    navigateTo(pageId, isInitial = false) {
        if (!pageId || pageId === this.state.currentPage && !isInitial) return;
        
        this.state.currentPage = pageId;

        // Handle page visibility
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageId}`);
        });

        // Handle nav link active state
        document.querySelectorAll('.nav-link').forEach(link => {
            const isForPage = link.dataset.page === pageId;
            link.classList.toggle('text-blue-500', isForPage);
            link.classList.toggle('text-gray-400', !isForPage);
        });
        
        // Render content for the new page
        this.renderPageContent();
    },
    
    renderPageContent() {
        switch(this.state.currentPage) {
            case 'panel':
                this.renderPanel();
                break;
            case 'reportes':
                this.renderReportList();
                break;
            case 'nuevo':
                this.resetNewExpenseForm();
                break;
        }
    },

    // Data Handling
    loadExpenses() {
        const expenses = localStorage.getItem('expenses');
        this.state.expenses = expenses ? JSON.parse(expenses) : [];
    },

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.state.expenses));
    },

    addExpense() {
        const form = document.getElementById('new-expense-form');
        const newExpense = {
            id: Date.now(),
            amount: parseFloat(form.monto.value),
            date: form.fecha.value,
            category: form.categoria.value,
            description: form.descripcion.value,
        };

        this.state.expenses.push(newExpense);
        this.state.expenses.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
        this.saveExpenses();
        this.navigateTo('reportes');
    },
    
    resetNewExpenseForm() {
        const form = document.getElementById('new-expense-form');
        form.reset();
        form.fecha.value = new Date().toISOString().split('T')[0];
    },

    // UI Rendering
    populateDropdowns() {
        const categorySelect = document.getElementById('categoria');
        const filterCategorySelect = document.getElementById('filter-category');
        
        // Add default option to filter
        filterCategorySelect.innerHTML = '<option value="all">Todas las categorías</option>';

        Object.keys(this.CATEGORIES).forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            filterCategorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        
        // Populate month and year filters
        const monthFilter = document.getElementById('filter-month');
        const yearFilter = document.getElementById('filter-year');
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        monthFilter.innerHTML = '<option value="all">Todos los meses</option>';
        months.forEach((month, i) => {
            monthFilter.innerHTML += `<option value="${i}">${month}</option>`;
        });

        const currentYear = new Date().getFullYear();
        yearFilter.innerHTML = '<option value="all">Todos los años</option>';
        for (let i = currentYear; i >= currentYear - 5; i--) {
            yearFilter.innerHTML += `<option value="${i}">${i}</option>`;
        }
    },
    
    renderPanel() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const expensesThisMonth = this.state.expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        const totalThisMonth = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('total-gastos-mes').textContent = `$${totalThisMonth.toFixed(2)}`;
        
        this.renderChart();
    },
    
    renderChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const currentYear = new Date().getFullYear();

        const monthlyTotals = Array(12).fill(0);
        this.state.expenses.forEach(e => {
            const date = new Date(e.date);
            if (date.getFullYear() === currentYear) {
                monthlyTotals[date.getMonth()] += e.amount;
            }
        });

        if (this.state.chart) {
            this.state.chart.destroy();
        }

        this.state.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gastos',
                    data: monthlyTotals,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    },

    renderReportList() {
        const listEl = document.getElementById('expense-list');
        const monthFilter = document.getElementById('filter-month').value;
        const yearFilter = document.getElementById('filter-year').value;
        const categoryFilter = document.getElementById('filter-category').value;
        
        const filteredExpenses = this.state.expenses.filter(e => {
            const date = new Date(e.date);
            const monthMatch = monthFilter === 'all' || date.getMonth() == monthFilter;
            const yearMatch = yearFilter === 'all' || date.getFullYear() == yearFilter;
            const categoryMatch = categoryFilter === 'all' || e.category === categoryFilter;
            return monthMatch && yearMatch && categoryMatch;
        });
        
        if (filteredExpenses.length === 0) {
            listEl.innerHTML = `<div class="text-center py-10 text-gray-500">
                <p>No hay gastos que mostrar.</p>
                <p class="text-sm">Intenta ajustar los filtros o agrega un nuevo gasto.</p>
            </div>`;
            return;
        }

        listEl.innerHTML = filteredExpenses.map(expense => {
            const iconColor = this.CATEGORY_COLORS[expense.category] || '#6b7280';
            return `
                <div class="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                    <div class="h-12 w-12 rounded-full flex items-center justify-center" style="background-color: ${iconColor}20; color: ${iconColor};">
                        ${this.CATEGORIES[expense.category] || this.CATEGORIES['Otros']}
                    </div>
                    <div class="flex-grow">
                        <p class="font-semibold text-white">${expense.description || expense.category}</p>
                        <p class="text-sm text-gray-400">${expense.category}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-white text-lg">$${expense.amount.toFixed(2)}</p>
                        <p class="text-xs text-gray-500">${new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        }).join('');
    },
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
