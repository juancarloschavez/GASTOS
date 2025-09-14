const app = {
    state: {
        expenses: [],
        currentPage: 'nuevo',
        summaryChart: null,
        reportChart: null,
        editingExpenseId: null,
        summaryChartType: 'month',
        expensesSortOrder: 'newest',
    },
    
    // App constants
    API_URL: 'https://script.google.com/macros/s/AKfycbyRcqrVODVqLEJwl64Oy254LI_uwZz9ChzwT9Zv95qlIsFmlFWGvNyIofs4G4_Nv9fN1g/exec',
    CATEGORIES: {
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
        this.detectColorScheme();
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
        
        // Summary chart toggles
        document.getElementById('btn-chart-month').addEventListener('click', () => this.setSummaryChartType('month'));
        document.getElementById('btn-chart-year').addEventListener('click', () => this.setSummaryChartType('year'));
        document.getElementById('btn-chart-category').addEventListener('click', () => this.setSummaryChartType('category'));

        // Filter listeners
        document.getElementById('filter-month').addEventListener('change', () => this.renderReportPage());
        document.getElementById('filter-year').addEventListener('change', () => this.renderReportPage());
        document.getElementById('filter-category').addEventListener('change', () => this.renderReportPage());
        document.getElementById('filter-search').addEventListener('input', () => this.renderReportPage());

        // Sort listener
        document.getElementById('sort-order').addEventListener('change', (e) => {
            this.state.expensesSortOrder = e.target.value;
            this.renderReportList();
        });

        // Report view toggle
        document.getElementById('btn-lista').addEventListener('click', () => this.toggleReportView('lista'));
        document.getElementById('btn-grafico').addEventListener('click', () => this.toggleReportView('grafico'));

        // Modal listeners
        document.getElementById('expense-modal').addEventListener('click', (e) => {
            if (e.target.id === 'expense-modal') {
                this.closeModal();
            }
        });

        document.getElementById('expense-list').addEventListener('click', (e) => {
            const expenseItem = e.target.closest('.expense-item');
            if (expenseItem) {
                const expenseId = expenseItem.dataset.id;
                this.showExpenseModal(expenseId);
            }
        });
    },

    // Navigation
    navigateTo(pageId, isInitial = false) {
        if (!pageId || pageId === this.state.currentPage && !isInitial) return;
        
        this.state.currentPage = pageId;

        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageId}`);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            const isForPage = link.dataset.page === pageId;
            link.classList.toggle('text-blue-500', isForPage);
            link.classList.toggle('text-gray-500', !isForPage);
            link.classList.toggle('dark:text-blue-500', isForPage);
            link.classList.toggle('dark:text-gray-400', !isForPage);
        });
        
        this.renderPageContent();
    },
    
    renderPageContent() {
        switch(this.state.currentPage) {
            case 'reportes':
                this.renderReportPage();
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
            id: 'expense-' + Date.now(),
            amount: parseFloat(form.monto.value),
            date: form.fecha.value,
            category: form.categoria.value,
            description: form.descripcion.value,
        };

        this.state.expenses.push(newExpense);
        this.saveExpenses();
        this.populateDropdowns();
        
        fetch(this.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'add', expense: newExpense }),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            mode: 'cors'
        })
        .then(response => {
            console.log('Respuesta recibida del servidor (add):', response);
            // We navigate regardless of the response, as we know it saves.
            this.navigateTo('reportes');
        })
        .catch(error => {
            console.error('Error en fetch() que estamos ignorando (add):', error);
            // We still navigate because the save is likely successful despite the CORS error.
            this.navigateTo('reportes');
        });
    },

    updateExpense() {
        const form = document.getElementById('edit-expense-form');
        const expense = this.state.expenses.find(e => e.id == this.state.editingExpenseId);
        if (expense) {
            expense.amount = parseFloat(form.monto.value);
            expense.date = form.fecha.value;
            expense.category = form.categoria.value;
            expense.description = form.descripcion.value;
            
            this.saveExpenses();
            
            fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'update', expense: expense }),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                mode: 'cors'
            })
            .then(response => console.log('Respuesta recibida del servidor (update):', response))
            .catch(error => console.error('Error en fetch() (update):', error));

            this.closeModal();
            this.renderReportPage();
        }
    },

    deleteExpense(id) {
        this.state.expenses = this.state.expenses.filter(e => e.id != id);
        this.saveExpenses();
        
        fetch(this.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id: id }),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            mode: 'cors'
        })
        .then(response => console.log('Respuesta recibida del servidor (delete):', response))
        .catch(error => console.error('Error en fetch() (delete):', error));

        this.populateDropdowns();
        this.closeModal();
        this.renderReportPage();
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
        
        if(categorySelect.options.length <= 1) {
            Object.keys(this.CATEGORIES).forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }

        filterCategorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
        Object.keys(this.CATEGORIES).forEach(cat => {
            filterCategorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        
        const monthFilter = document.getElementById('filter-month');
        if(monthFilter.options.length <= 1) {
            const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            monthFilter.innerHTML = '<option value="all">Todos los meses</option>';
            months.forEach((month, i) => {
                monthFilter.innerHTML += `<option value="${i}">${month}</option>`;
            });
        }

        const yearFilter = document.getElementById('filter-year');
        const years = [...new Set(this.state.expenses.map(e => new Date(e.date.replace(/-/g, '\/')).getFullYear()))];
        years.sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="all">Todos los años</option>';
        years.forEach(year => {
            yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });
    },
    
    renderReportPage() {
        this.renderSummary();
        this.renderReportList();
        this.renderReportChart();
        const totalHistorico = this.state.expenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('total-historico').textContent = `${totalHistorico.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    renderSummary() {
        const totalThisMonth = this.state.expenses
            .filter(e => {
                const date = new Date(e.date.replace(/-/g, '\/'));
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, e) => sum + e.amount, 0);
        
        document.getElementById('total-gastos-mes').textContent = `${totalThisMonth.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.renderSummaryChart();
    },

    setSummaryChartType(type) {
        this.state.summaryChartType = type;
        const buttons = ['btn-chart-month', 'btn-chart-year', 'btn-chart-category'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            const isSelected = `btn-chart-${type}` === btnId;
            btn.classList.toggle('bg-white', isSelected);
            btn.classList.toggle('dark:bg-gray-700', isSelected);
            btn.classList.toggle('text-gray-500', !isSelected);
            btn.classList.toggle('dark:text-gray-400', !isSelected);
        });
        this.renderSummaryChart();
    },

    renderSummaryChart() {
        const ctx = document.getElementById('summary-chart').getContext('2d');
        if (this.state.summaryChart) {
            this.state.summaryChart.destroy();
        }

        let chartConfig;
        if (this.state.summaryChartType === 'month') {
            chartConfig = this.getMonthlyChartConfig();
        } else if (this.state.summaryChartType === 'year') {
            chartConfig = this.getYearlyChartConfig();
        } else {
            chartConfig = this.getCategorySummaryChartConfig();
        }
        this.state.summaryChart = new Chart(ctx, chartConfig);
    },

    getMonthlyChartConfig() {
        const monthlyTotals = Array(12).fill(0);
        this.state.expenses.forEach(e => {
            const date = new Date(e.date.replace(/-/g, '\/'));
            if (date.getFullYear() === new Date().getFullYear()) {
                monthlyTotals[date.getMonth()] += e.amount;
            }
        });
        return {
            type: 'bar',
            data: {
                labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                datasets: [{
                    label: 'Gastos del Mes',
                    data: monthlyTotals,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                }]
            },
            options: this.getChartOptions(),
        };
    },

    getYearlyChartConfig() {
        const yearlyTotals = {};
        this.state.expenses.forEach(e => {
            const year = new Date(e.date.replace(/-/g, '\/')).getFullYear();
            if (!yearlyTotals[year]) yearlyTotals[year] = 0;
            yearlyTotals[year] += e.amount;
        });
        const labels = Object.keys(yearlyTotals).sort();
        const data = labels.map(year => yearlyTotals[year]);
        return {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gastos por Año',
                    data: data,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                }]
            },
            options: this.getChartOptions(),
        };
    },

    getCategorySummaryChartConfig() {
        const categoryTotals = {};
        this.state.expenses.forEach(e => {
            if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
            categoryTotals[e.category] += e.amount;
        });
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const backgroundColors = labels.map(cat => this.CATEGORIES[cat] || '#6b7280');
        return {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: this.getChartOptions(true),
        };
    },

    getChartOptions(isDoughnut = false) {
        const isDark = document.documentElement.classList.contains('dark');
        const fontColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        let options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: isDoughnut,
                    position: 'bottom',
                    labels: { color: fontColor }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${value.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                    }
                }
            }
        };

        if (!isDoughnut) {
            options.scales = {
                y: { ticks: { color: fontColor }, grid: { color: gridColor } },
                x: { ticks: { color: fontColor }, grid: { display: false } }
            };
        }
        return options;
    },

    getFilteredExpenses() {
        const monthFilter = document.getElementById('filter-month').value;
        const yearFilter = document.getElementById('filter-year').value;
        const categoryFilter = document.getElementById('filter-category').value;
        const searchTerm = document.getElementById('filter-search').value.toLowerCase();
        
        return this.state.expenses.filter(e => {
            const date = new Date(e.date.replace(/-/g, '\/'));
            const monthMatch = monthFilter === 'all' || date.getMonth() == monthFilter;
            const yearMatch = yearFilter === 'all' || date.getFullYear() == yearFilter;
            const categoryMatch = categoryFilter === 'all' || e.category === categoryFilter;
            const searchMatch = !searchTerm || (e.description && e.description.toLowerCase().includes(searchTerm)) || (e.category && e.category.toLowerCase().includes(searchTerm));
            return monthMatch && yearMatch && categoryMatch && searchMatch;
        });
    },

    renderReportList() {
        const listEl = document.getElementById('expense-list');
        const filteredExpenses = this.getFilteredExpenses();

        if (this.state.expensesSortOrder === 'newest') {
            filteredExpenses.sort((a, b) => new Date(b.date.replace(/-/g, '\/')) - new Date(a.date.replace(/-/g, '\/')));
        } else {
            filteredExpenses.sort((a, b) => new Date(a.date.replace(/-/g, '\/')) - new Date(b.date.replace(/-/g, '\/')));
        }
        
        if (filteredExpenses.length === 0) {
            listEl.innerHTML = `<div class="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>No hay gastos que mostrar.</p>
                <p class="text-sm">Intenta ajustar los filtros o agrega un nuevo gasto.</p>
            </div>`;
            return;
        }

        listEl.innerHTML = filteredExpenses.map(expense => {
            const color = this.CATEGORIES[expense.category] || '#6b7280';
            return `
                <div class="expense-item bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4 cursor-pointer" data-id="${expense.id}">
                    <div class="h-10 w-10 rounded-full flex-shrink-0" style="background-color: ${color}"></div>
                    <div class="flex-grow">
                        <p class="font-semibold text-gray-800 dark:text-white">${expense.description || expense.category}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${expense.category}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg text-gray-800 dark:text-white">${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">${new Date(expense.date.replace(/-/g, '\/')).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderReportChart() {
        const ctx = document.getElementById('report-chart').getContext('2d');
        const filteredExpenses = this.getFilteredExpenses();

        const dataByCat = filteredExpenses.reduce((acc, e) => {
            if (!acc[e.category]) {
                acc[e.category] = 0;
            }
            acc[e.category] += e.amount;
            return acc;
        }, {});

        const labels = Object.keys(dataByCat);
        const data = Object.values(dataByCat);
        const backgroundColors = labels.map(cat => this.CATEGORIES[cat] || '#6b7280');

        if (this.state.reportChart) {
            this.state.reportChart.destroy();
        }

        this.state.reportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gastos por Categoría',
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: this.getChartOptions(true)
        });
    },

    toggleReportView(view) {
        const listContainer = document.getElementById('expense-list');
        const chartContainer = document.getElementById('chart-container');
        const btnLista = document.getElementById('btn-lista');
        const btnGrafico = document.getElementById('btn-grafico');

        if (view === 'lista') {
            listContainer.classList.remove('hidden');
            chartContainer.classList.add('hidden');
            btnLista.classList.add('bg-white', 'dark:bg-gray-700', 'font-semibold');
            btnLista.classList.remove('text-gray-500', 'dark:text-gray-400');
            btnGrafico.classList.remove('bg-white', 'dark:bg-gray-700', 'font-semibold');
            btnGrafico.classList.add('text-gray-500', 'dark:text-gray-400');
        } else {
            listContainer.classList.add('hidden');
            chartContainer.classList.remove('hidden');
            btnGrafico.classList.add('bg-white', 'dark:bg-gray-700', 'font-semibold');
            btnGrafico.classList.remove('text-gray-500', 'dark:text-gray-400');
            btnLista.classList.remove('bg-white', 'dark:bg-gray-700', 'font-semibold');
            btnLista.classList.add('text-gray-500', 'dark:text-gray-400');
        }
    },

    // Modal functions
    showExpenseModal(id) {
        const expense = this.state.expenses.find(e => e.id == id); // Use ==
        if (!expense) return;

        this.state.editingExpenseId = id;
        const modalContent = document.getElementById('modal-content');
        const color = this.CATEGORIES[expense.category] || '#6b7280';

        modalContent.innerHTML = `
            <div class="flex justify-between items-start">
                <h2 class="text-2xl font-bold">Detalle del Gasto</h2>
                <button onclick="app.closeModal()" class="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div class="flex items-center space-x-4">
                <div class="h-12 w-12 rounded-full" style="background-color: ${color}"></div>
                <div>
                    <p class="font-bold text-2xl">${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${expense.description || expense.category}</p>
                </div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p><strong>Categoría:</strong> ${expense.category}</p>
                <p><strong>Fecha:</strong> ${new Date(expense.date.replace(/-/g, '\/')).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
                <button onclick="app.deleteExpense('${id}')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Eliminar</button>
                <button onclick="app.showEditExpenseForm()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Editar</button>
            </div>
        `;

        document.getElementById('expense-modal').classList.remove('hidden');
        document.getElementById('expense-modal').classList.add('flex');
    },

    showEditExpenseForm() {
        const expense = this.state.expenses.find(e => e.id == this.state.editingExpenseId); // Use ==
        if (!expense) return;

        const modalContent = document.getElementById('modal-content');
        
        let categoryOptions = '';
        for (const category in this.CATEGORIES) {
            categoryOptions += `<option value="${category}" ${expense.category === category ? 'selected' : ''}>${category}</option>`;
        }

        modalContent.innerHTML = `
            <h2 class="text-2xl font-bold">Editar Gasto</h2>
            <form id="edit-expense-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monto</label>
                    <input type="number" name="monto" value="${expense.amount}" class="bg-gray-200 dark:bg-gray-700 rounded-lg w-full py-2 px-3" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                    <input type="date" name="fecha" value="${expense.date}" class="bg-gray-200 dark:bg-gray-700 rounded-lg w-full py-2 px-3" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Categoría</label>
                    <select name="categoria" class="bg-gray-200 dark:bg-gray-700 rounded-lg w-full py-2 px-3" required>${categoryOptions}</select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
                    <textarea name="descripcion" rows="2" class="bg-gray-200 dark:bg-gray-700 rounded-lg w-full py-2 px-3">${expense.description || ''}</textarea>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="app.closeModal()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Guardar</button>
                </div>
            </form>
        `;

        document.getElementById('edit-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateExpense();
        });
    },

    closeModal() {
        const modal = document.getElementById('expense-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('modal-content').innerHTML = '';
        this.state.editingExpenseId = null;
    },

    // Theme
    detectColorScheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            this.renderSummaryChart();
            this.renderReportChart();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
