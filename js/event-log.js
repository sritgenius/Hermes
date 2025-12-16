// Логика для страницы журнала событий
document.addEventListener('DOMContentLoaded', function() {
    // Элементы страницы
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContainer = document.getElementById('mainContainer');
    const eventTableBody = document.getElementById('eventTableBody');
    const totalEvents = document.getElementById('totalEvents');
    const lastEventTime = document.getElementById('lastEventTime');
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    const applyFilters = document.getElementById('applyFilters');
    const resetFilters = document.getElementById('resetFilters');
    const refreshEvents = document.getElementById('refreshEvents');
    const exportLog = document.getElementById('exportLog');
    const clearLog = document.getElementById('clearLog');
    const eventDetailModal = document.getElementById('eventDetailModal');
    const closeEventModal = document.getElementById('closeEventModal');
    const eventDetailContent = document.getElementById('eventDetailContent');
    
    // Данные событий
    let events = [];
    let filteredEvents = [];
    
    // Инициализация
    initEventLog();
    
    // Инициализация журнала событий
    function initEventLog() {
        // Скрываем загрузку
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'flex';
                loadEvents();
                initCharts();
            }, 500);
        }, 1000);
        
        // Обновление времени
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Инициализация обработчиков
        initEventHandlers();
    }
    
    // Обновление времени
    function updateDateTime() {
        const now = new Date();
        currentTime.textContent = now.toLocaleTimeString('ru-RU');
        currentDate.textContent = now.toLocaleDateString('ru-RU');
    }
    
    // Загрузка событий
    function loadEvents() {
        // Пытаемся загрузить из localStorage
        const savedEvents = localStorage.getItem('hermes_events');
        
        if (savedEvents) {
            events = JSON.parse(savedEvents);
        } else {
            // Генерируем тестовые события
            events = generateTestEvents(50);
            saveEvents();
        }
        
        // Применяем фильтры
        applyFilter();
        
        // Обновляем статистику
        updateStatistics();
    }
    
    // Генерация тестовых событий
    function generateTestEvents(count) {
        const eventTypes = ['danger', 'warning', 'normal', 'test'];
        const zones = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const sensors = Array.from({length: 24}, (_, i) => `Датчик СОР-${(i+1).toString().padStart(3, '0')}`);
        const operators = ['Иванов А.И.', 'Петров С.В.', 'Сидоров М.П.', 'Смирнов А.А.'];
        const descriptions = [
            'Обнаружена утечка жидкости',
            'Повышенное давление в системе',
            'Температура выше нормы',
            'Проверка работоспособности',
            'Плановое обслуживание',
            'Критическое значение достигнуто',
            'Восстановление после аварии',
            'Тестирование системы'
        ];
        
        const events = [];
        const now = new Date();
        
        for (let i = 0; i < count; i++) {
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const hoursAgo = Math.floor(Math.random() * 72); // События за последние 72 часа
            const eventTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
            
            events.push({
                id: Date.now() + i,
                timestamp: eventTime,
                sensor: sensors[Math.floor(Math.random() * sensors.length)],
                zone: zones[Math.floor(Math.random() * zones.length)],
                type: eventType,
                value: (Math.random() * 100).toFixed(2),
                operator: operators[Math.floor(Math.random() * operators.length)],
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                acknowledged: Math.random() > 0.5
            });
        }
        
        // Сортируем по времени (новые сверху)
        return events.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Применение фильтров
    function applyFilter() {
        const dateFilter = document.getElementById('dateFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const zoneFilter = document.getElementById('zoneFilter').value;
        
        filteredEvents = events.filter(event => {
            // Фильтр по дате
            if (dateFilter) {
                const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
                if (eventDate !== dateFilter) return false;
            }
            
            // Фильтр по типу
            if (typeFilter !== 'all' && event.type !== typeFilter) return false;
            
            // Фильтр по зоне
            if (zoneFilter !== 'all' && event.zone !== zoneFilter) return false;
            
            return true;
        });
        
        renderEvents();
    }
    
    // Отрисовка событий в таблице
    function renderEvents() {
        if (!eventTableBody) return;
        
        eventTableBody.innerHTML = filteredEvents.map(event => {
            const eventDate = new Date(event.timestamp);
            const timeString = eventDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const dateString = eventDate.toLocaleDateString('ru-RU');
            
            return `
                <tr class="event-${event.type}">
                    <td>
                        <div class="event-time">${dateString}</div>
                        <div class="event-time-small">${timeString}</div>
                    </td>
                    <td>${event.sensor}</td>
                    <td>${event.zone}</td>
                    <td>
                        <span class="event-type ${event.type}">
                            ${getEventTypeText(event.type)}
                        </span>
                    </td>
                    <td>${event.value}</td>
                    <td>${event.operator}</td>
                    <td>${event.description}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-table info" onclick="showEventDetails(${event.id})">
                                <i class="fas fa-eye"></i> Просмотр
                            </button>
                            ${!event.acknowledged ? `
                            <button class="btn-table success" onclick="acknowledgeEvent(${event.id})">
                                <i class="fas fa-check"></i> Подтвердить
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Обновляем статистику
        updateStatistics();
    }
    
    // Получение текста типа события
    function getEventTypeText(type) {
        const typeMap = {
            'danger': 'Авария',
            'warning': 'Предупреждение',
            'normal': 'Норма',
            'test': 'Тест'
        };
        return typeMap[type] || type;
    }
    
    // Обновление статистики
    function updateStatistics() {
        if (totalEvents) {
            totalEvents.textContent = events.length;
        }
        
        if (lastEventTime && events.length > 0) {
            const lastEvent = events[0];
            const lastTime = new Date(lastEvent.timestamp);
            lastEventTime.textContent = lastTime.toLocaleTimeString('ru-RU');
        }
        
        // Обновляем графики
        updateCharts();
    }
    
    // Инициализация графиков
    function initCharts() {
        // График по типам событий
        const typeCtx = document.getElementById('eventTypeChart');
        if (typeCtx) {
            window.eventTypeChart = new Chart(typeCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Аварии', 'Предупреждения', 'Норма', 'Тесты'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#EF4444',
                            '#F59E0B',
                            '#10B981',
                            '#8B5CF6'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#E2E8F0',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }
        
        // График по времени
        const timeCtx = document.getElementById('eventTimeChart');
        if (timeCtx) {
            window.eventTimeChart = new Chart(timeCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'],
                    datasets: [{
                        label: 'Количество событий',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(0, 102, 204, 0.6)',
                        borderColor: '#0066CC',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#94A3B8'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#94A3B8'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#E2E8F0'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Обновление графиков
    function updateCharts() {
        if (!window.eventTypeChart || !window.eventTimeChart) return;
        
        // Статистика по типам
        const typeCounts = {
            danger: events.filter(e => e.type === 'danger').length,
            warning: events.filter(e => e.type === 'warning').length,
            normal: events.filter(e => e.type === 'normal').length,
            test: events.filter(e => e.type === 'test').length
        };
        
        window.eventTypeChart.data.datasets[0].data = [
            typeCounts.danger,
            typeCounts.warning,
            typeCounts.normal,
            typeCounts.test
        ];
        window.eventTypeChart.update();
        
        // Статистика по времени суток
        const timeSlots = [0, 0, 0, 0, 0, 0];
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            if (hour < 4) timeSlots[0]++;
            else if (hour < 8) timeSlots[1]++;
            else if (hour < 12) timeSlots[2]++;
            else if (hour < 16) timeSlots[3]++;
            else if (hour < 20) timeSlots[4]++;
            else timeSlots[5]++;
        });
        
        window.eventTimeChart.data.datasets[0].data = timeSlots;
        window.eventTimeChart.update();
    }
    
    // Инициализация обработчиков событий
    function initEventHandlers() {
        // Применение фильтров
        if (applyFilters) {
            applyFilters.addEventListener('click', applyFilter);
        }
        
        // Сброс фильтров
        if (resetFilters) {
            resetFilters.addEventListener('click', function() {
                document.getElementById('dateFilter').value = '';
                document.getElementById('typeFilter').value = 'all';
                document.getElementById('zoneFilter').value = 'all';
                applyFilter();
            });
        }
        
        // Обновление событий
        if (refreshEvents) {
            refreshEvents.addEventListener('click', function() {
                this.querySelector('i').classList.add('fa-spin');
                setTimeout(() => {
                    loadEvents();
                    this.querySelector('i').classList.remove('fa-spin');
                    showNotification('Журнал событий обновлен', 'success');
                }, 500);
            });
        }
        
        // Экспорт журнала
        if (exportLog) {
            exportLog.addEventListener('click', exportEventLog);
        }
        
        // Очистка журнала
        if (clearLog) {
            clearLog.addEventListener('click', clearEventLog);
        }
        
        // Закрытие модального окна
        if (closeEventModal) {
            closeEventModal.addEventListener('click', function() {
                eventDetailModal.style.display = 'none';
            });
        }
        
        // Закрытие модального окна по клику вне его
        window.addEventListener('click', function(e) {
            if (e.target === eventDetailModal) {
                eventDetailModal.style.display = 'none';
            }
        });
    }
    
    // Экспорт журнала событий
    function exportEventLog() {
        const csv = convertToCSV(events);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `журнал_событий_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Журнал событий экспортирован', 'success');
    }
    
    // Конвертация в CSV
    function convertToCSV(data) {
        const headers = ['Дата', 'Время', 'Датчик', 'Зона', 'Тип', 'Значение', 'Оператор', 'Описание'];
        const rows = data.map(event => [
            new Date(event.timestamp).toLocaleDateString('ru-RU'),
            new Date(event.timestamp).toLocaleTimeString('ru-RU'),
            event.sensor,
            event.zone,
            getEventTypeText(event.type),
            event.value,
            event.operator,
            event.description
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }
    
    // Очистка журнала событий
    function clearEventLog() {
        if (confirm('Вы уверены, что хотите очистить весь журнал событий? Это действие нельзя отменить.')) {
            events = [];
            localStorage.removeItem('hermes_events');
            applyFilter();
            showNotification('Журнал событий очищен', 'warning');
        }
    }
    
    // Сохранение событий
    function saveEvents() {
        localStorage.setItem('hermes_events', JSON.stringify(events));
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        if (typeof Toastify === 'function') {
            const backgroundColor = {
                'success': '#10B981',
                'warning': '#F59E0B',
                'danger': '#EF4444',
                'info': '#3B82F6'
            }[type] || '#3B82F6';
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: backgroundColor,
                stopOnFocus: true,
            }).showToast();
        }
    }
});

// Глобальные функции для таблицы
function showEventDetails(eventId) {
    const events = JSON.parse(localStorage.getItem('hermes_events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (!event) return;
    
    const modal = document.getElementById('eventDetailModal');
    const content = document.getElementById('eventDetailContent');
    
    if (!modal || !content) return;
    
    const eventDate = new Date(event.timestamp);
    
    content.innerHTML = `
        <div class="event-detail-item">
            <div class="event-detail-label">Дата и время:</div>
            <div class="event-detail-value">
                ${eventDate.toLocaleDateString('ru-RU')} ${eventDate.toLocaleTimeString('ru-RU')}
            </div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Датчик:</div>
            <div class="event-detail-value">${event.sensor}</div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Зона:</div>
            <div class="event-detail-value">${event.zone}</div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Тип события:</div>
            <div class="event-detail-value">
                <span class="event-type ${event.type}">
                    ${getEventTypeText(event.type)}
                </span>
            </div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Значение:</div>
            <div class="event-detail-value">${event.value}</div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Оператор:</div>
            <div class="event-detail-value">${event.operator}</div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Описание:</div>
            <div class="event-detail-value">${event.description}</div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-label">Статус:</div>
            <div class="event-detail-value">
                ${event.acknowledged ? 
                    '<span class="event-type normal">Подтверждено</span>' : 
                    '<span class="event-type warning">Ожидает подтверждения</span>'}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function acknowledgeEvent(eventId) {
    const events = JSON.parse(localStorage.getItem('hermes_events') || '[]');
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        events[eventIndex].acknowledged = true;
        localStorage.setItem('hermes_events', JSON.stringify(events));
        
        // Перезагружаем события
        const eventLogScript = document.querySelector('script[src="js/event-log.js"]');
        if (eventLogScript) {
            eventLogScript.parentNode.removeChild(eventLogScript);
            const newScript = document.createElement('script');
            newScript.src = 'js/event-log.js';
            document.body.appendChild(newScript);
        }
        
        showNotification('Событие подтверждено', 'success');
    }
}

function getEventTypeText(type) {
    const typeMap = {
        'danger': 'Авария',
        'warning': 'Предупреждение',
        'normal': 'Норма',
        'test': 'Тест'
    };
    return typeMap[type] || type;
}