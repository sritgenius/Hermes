// Графики для системы ГЕРМЕС
let dailyChart = null;
let sensorChart = null;

function initCharts() {
    createDailyChart();
    createSensorChart();
}

function createDailyChart() {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    // Получаем контекст Canvas
    const chartCtx = ctx.getContext('2d');
    
    // Создаем градиент для линии
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 102, 204, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 102, 204, 0.1)');
    
    // Данные для графика
    const data = generateChartData();
    
    // Создаем график
    dailyChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Средние показания',
                    data: data.values,
                    borderColor: '#0066CC',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0066CC',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Критические события',
                    data: data.alerts,
                    type: 'bar',
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    },
                    title: {
                        display: true,
                        text: 'Показания',
                        color: '#94A3B8'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#94A3B8'
                    },
                    title: {
                        display: true,
                        text: 'События',
                        color: '#94A3B8'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#E2E8F0'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 41, 56, 0.95)',
                    titleColor: '#E2E8F0',
                    bodyColor: '#E2E8F0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            }
        }
    });
}

function createSensorChart() {
    const ctx = document.getElementById('sensorChart');
    if (!ctx) return;
    
    sensorChart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Давление', 'Утечка', 'Температура', 'Вибрация', 'Уровень', 'Стабильность'],
            datasets: [{
                label: 'Текущие показания',
                data: [65, 59, 90, 81, 56, 55],
                backgroundColor: 'rgba(0, 102, 204, 0.2)',
                borderColor: '#0066CC',
                pointBackgroundColor: '#0066CC',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0066CC'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: '#94A3B8'
                    },
                    ticks: {
                        color: '#94A3B8',
                        backdropColor: 'transparent'
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

function generateChartData() {
    const labels = [];
    const values = [];
    const alerts = [];
    
    // Генерируем данные за последние 24 часа
    for (let i = 23; i >= 0; i--) {
        const hour = new Date().getHours() - i;
        const hourLabel = hour < 0 ? 24 + hour : hour;
        labels.push(`${hourLabel.toString().padStart(2, '0')}:00`);
        
        // Случайные значения с трендом
        const baseValue = 50 + Math.sin(i * 0.5) * 20;
        const randomValue = baseValue + (Math.random() * 10 - 5);
        values.push(Math.max(0, randomValue));
        
        // Случайное количество алертов
        alerts.push(Math.floor(Math.random() * 5));
    }
    
    return { labels, values, alerts };
}

function updateCharts(data) {
    if (dailyChart && data) {
        // Обновляем данные графика
        dailyChart.data.labels = data.map(d => d.time);
        dailyChart.data.datasets[0].data = data.map(d => parseFloat(d.value));
        dailyChart.data.datasets[1].data = data.map(d => d.alerts);
        dailyChart.update();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация графиков
    initCharts();
    
    // Обработчик изменения временного диапазона
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            // Обновляем график в зависимости от выбранного диапазона
            const data = generateChartDataForRange(this.value);
            updateCharts(data);
        });
    }
    
    // Автоматическое обновление графиков
    setInterval(() => {
        if (dailyChart) {
            const data = generateChartDataForRange(
                document.getElementById('timeRange')?.value || '24h'
            );
            updateCharts(data);
        }
    }, 10000); // Обновление каждые 10 секунд
});

function generateChartDataForRange(range) {
    let hours;
    switch(range) {
        case '1h': hours = 1; break;
        case '6h': hours = 6; break;
        case '12h': hours = 12; break;
        case '24h': hours = 24; break;
        default: hours = 24;
    }
    
    const data = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000 / hours));
        const label = time.getHours().toString().padStart(2, '0') + 
                     ':' + time.getMinutes().toString().padStart(2, '0');
        
        // Генерация реалистичных данных
        const baseValue = 50 + Math.sin(i * 0.5) * 15;
        const randomValue = baseValue + (Math.random() * 8 - 4);
        
        data.push({
            time: label,
            value: Math.max(0, randomValue).toFixed(2),
            alerts: Math.floor(Math.random() * 3)
        });
    }
    
    return data;
}

// Экспорт функций
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCharts,
        updateCharts,
        generateChartData
    };
}