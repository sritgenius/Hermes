// Основной скрипт системы ГЕРМЕС
document.addEventListener('DOMContentLoaded', function() {
    // Глобальные переменные
    let soundEnabled = true;
    let currentUser = null;
    
    // Инициализация системы
    initSystem();
    
    // Элементы интерфейса
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContainer = document.getElementById('mainContainer');
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    // Симуляция загрузки системы
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContainer.style.display = 'flex';
            
            // Проверка авторизации
            checkAuth();
        }, 500);
    }, 2000);
    
    // Обновление времени в реальном времени
    function updateDateTime() {
        const now = new Date();
        
        // Форматирование времени
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Форматирование даты
        const dateString = now.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        currentTime.textContent = timeString;
        currentDate.textContent = dateString;
        
        // Обновление времени в футере
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = timeString;
        }
    }
    
    // Инициализация обновления времени
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Проверка авторизации
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('hermes_user'));
        
        if (!user) {
            // Показываем модальное окно авторизации
            loginModal.style.display = 'flex';
        } else {
            // Обновляем информацию о пользователе
            updateUserInfo(user);
        }
    }
    
    // Обновление информации о пользователе
    function updateUserInfo(user) {
        currentUser = user;
        
        if (userName) userName.textContent = user.name;
        if (userRole) {
            const roleMap = {
                'operator': 'Оператор',
                'engineer': 'Инженер',
                'admin': 'Администратор'
            };
            userRole.textContent = roleMap[user.role] || 'Оператор';
        }
        
        // Показываем кнопку администратора только для админов
        const adminBtn = document.getElementById('adminTestSensor');
        if (adminBtn) {
            adminBtn.style.display = user.role === 'admin' ? 'flex' : 'none';
        }
    }
    
    // Обработка входа в систему
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Валидация
            if (!username || !password || !role) {
                showNotification('Заполните все поля', 'warning');
                return;
            }
            
            // Симуляция проверки учетных данных
            const users = {
                'operator': 'operator123',
                'engineer': 'engineer123',
                'admin': 'admin123'
            };
            
            if (password === users[role]) {
                // Сохраняем пользователя
                const user = {
                    name: username,
                    role: role,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('hermes_user', JSON.stringify(user));
                
                // Обновляем интерфейс
                updateUserInfo(user);
                
                // Скрываем модальное окно
                loginModal.style.display = 'none';
                
                // Показываем уведомление
                showNotification(`Добро пожаловать, ${username}!`, 'success');
                
                // Инициализируем дашборд
                if (typeof initDashboard === 'function') {
                    initDashboard();
                }
            } else {
                showNotification('Неверные учетные данные', 'danger');
            }
        });
    }
    
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('hermes_user');
            window.location.reload();
        });
    }
    
    // Закрытие модального окна
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }
    
    // Инициализация системы
    function initSystem() {
        console.log('🚀 Система ГЕРМЕС инициализирована');
        
        // Инициализация компонентов
        initEventListeners();
        initQuickActions();
        loadRecentEvents();
        
        // Запуск симуляции данных
        if (typeof startDataSimulation === 'function') {
            startDataSimulation();
        }
    }
    
    // Инициализация обработчиков событий
    function initEventListeners() {
        // Управление звуком
        const silenceBtn = document.getElementById('silenceAlarm');
        const enableSoundBtn = document.getElementById('enableSound');
        
        if (silenceBtn) {
            silenceBtn.addEventListener('click', function() {
                soundEnabled = false;
                showNotification('Звуковые оповещения отключены', 'info');
                silenceBtn.style.display = 'none';
                if (enableSoundBtn) enableSoundBtn.style.display = 'flex';
            });
        }
        
        if (enableSoundBtn) {
            enableSoundBtn.addEventListener('click', function() {
                soundEnabled = true;
                showNotification('Звуковые оповещения включены', 'success');
                enableSoundBtn.style.display = 'none';
                if (silenceBtn) silenceBtn.style.display = 'flex';
            });
        }
        
        // Быстрые действия
        const acknowledgeBtn = document.getElementById('acknowledgeAll');
        const notifyBtn = document.getElementById('notifyTeam');
        const reportBtn = document.getElementById('generateReport');
        
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', function() {
                showNotification('Все инциденты подтверждены', 'success');
                // Логика подтверждения
            });
        }
        
        if (notifyBtn) {
            notifyBtn.addEventListener('click', function() {
                showNotification('Уведомление отправлено смене', 'info');
                // Логика уведомления
            });
        }
        
        if (reportBtn) {
            reportBtn.addEventListener('click', function() {
                window.location.href = 'report.html';
            });
        }
        
        // Кнопка тестирования для администратора
        const adminTestBtn = document.getElementById('adminTestSensor');
        if (adminTestBtn) {
            adminTestBtn.addEventListener('click', openTestSensorModal);
        }
        
        // Навигация
        const eventLogBtn = document.getElementById('eventLogBtn');
        const sensorsBtn = document.getElementById('sensorsBtn');
        
        if (eventLogBtn) {
            eventLogBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Журнал событий загружается...', 'info');
                // Загрузка журнала
            });
        }
        
        if (sensorsBtn) {
            sensorsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Панель датчиков загружается...', 'info');
                // Загрузка датчиков
            });
        }
        
        // Клики по датчикам на карте
        const sensors = document.querySelectorAll('.sensor');
        sensors.forEach(sensor => {
            sensor.addEventListener('click', function() {
                const sensorId = this.getAttribute('data-sensor');
                showSensorDetails(sensorId);
            });
        });
        
        // Модальное окно тестирования
        const testModal = document.getElementById('testSensorModal');
        const closeTestModal = document.getElementById('closeTestModal');
        const runTestBtn = document.getElementById('runTest');
        const cancelTestBtn = document.getElementById('cancelTest');
        
        if (closeTestModal) {
            closeTestModal.addEventListener('click', function() {
                testModal.style.display = 'none';
            });
        }
        
        if (cancelTestBtn) {
            cancelTestBtn.addEventListener('click', function() {
                testModal.style.display = 'none';
            });
        }
        
        if (runTestBtn) {
            runTestBtn.addEventListener('click', startSensorTest);
        }
        
        // Закрытие модальных окон при клике вне
        window.addEventListener('click', function(e) {
            const loginModal = document.getElementById('loginModal');
            const testModal = document.getElementById('testSensorModal');
            
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === testModal) {
                testModal.style.display = 'none';
            }
        });
    }
    
    // Загрузка последних событий
    function loadRecentEvents() {
        const eventsContainer = document.getElementById('recentEvents');
        if (!eventsContainer) return;
        
        // Пример данных событий
        const events = [
            {
                id: 1,
                type: 'info',
                icon: 'info-circle',
                title: 'Система запущена',
                description: 'Все датчики в норме',
                time: '14:30:22'
            },
            {
                id: 2,
                type: 'info',
                icon: 'check-circle',
                title: 'Проверка связи',
                description: 'Связь с датчиками стабильная',
                time: '14:28:15'
            },
            {
                id: 3,
                type: 'info',
                icon: 'shield-alt',
                title: 'Система активна',
                description: 'Мониторинг в реальном времени',
                time: '14:25:10'
            }
        ];
        
        eventsContainer.innerHTML = events.map(event => `
            <div class="event-item">
                <div class="event-icon ${event.type}">
                    <i class="fas fa-${event.icon}"></i>
                </div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description}</div>
                </div>
                <div class="event-time">${event.time}</div>
            </div>
        `).join('');
    }
    
    // Показать детали датчика
    function showSensorDetails(sensorId) {
        const details = {
            '101': { name: 'Датчик давления', zone: 'A1', value: '3.2 Бар', status: 'Норма' },
            '102': { name: 'Датчик утечки', zone: 'A2', value: '0.8 л/мин', status: 'Норма' },
            '103': { name: 'Аварийный датчик', zone: 'B1', value: '0.0 л/мин', status: 'Норма' },
            '104': { name: 'Датчик температуры', zone: 'B2', value: '28°C', status: 'Норма' }
        };
        
        const sensor = details[sensorId];
        if (sensor) {
            showNotification(
                `${sensor.name} (${sensor.zone}): ${sensor.value} - ${sensor.status}`,
                sensor.status === 'Авария' ? 'danger' : 
                sensor.status === 'Предупреждение' ? 'warning' : 'info'
            );
        }
    }
    
    // Инициализация быстрых действий
    function initQuickActions() {
        console.log('⚡ Быстрые действия инициализированы');
    }
    
    // Открытие модального окна тестирования
    function openTestSensorModal() {
        const modal = document.getElementById('testSensorModal');
        const sensorSelect = document.getElementById('sensorSelect');
        
        if (!modal || !sensorSelect || !dataSimulator) return;
        
        // Заполняем список датчиков
        sensorSelect.innerHTML = '';
        const sensors = dataSimulator.getSensorList();
        
        sensors.forEach(sensor => {
            const option = document.createElement('option');
            option.value = sensor.id;
            option.textContent = `${sensor.name} (${sensor.zone}, ${sensor.type})`;
            sensorSelect.appendChild(option);
        });
        
        // Сбрасываем статус
        const testStatus = document.getElementById('testStatus');
        if (testStatus) {
            testStatus.className = 'test-status';
            testStatus.innerHTML = `
                <div class="status-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="status-text">Готов к тестированию. Выберите датчик и параметры</div>
            `;
        }
        
        modal.style.display = 'flex';
    }
    
    // Запуск теста датчика
    function startSensorTest() {
        const sensorId = document.getElementById('sensorSelect').value;
        const testType = document.getElementById('testType').value;
        const duration = parseInt(document.getElementById('testDuration').value);
        const testStatus = document.getElementById('testStatus');
        
        if (!sensorId) {
            showNotification('Выберите датчик для тестирования', 'warning');
            return;
        }
        
        if (!testStatus) return;
        
        // Обновляем статус
        testStatus.className = 'test-status test-running';
        testStatus.innerHTML = `
            <div class="status-icon">
                <i class="fas fa-spinner"></i>
            </div>
            <div class="status-text">Запуск теста датчика ${sensorId} (${testType})...</div>
        `;
        
        // Запускаем тест через симулятор
        if (typeof runSensorTest === 'function') {
            const success = runSensorTest(sensorId, testType, duration);
            
            if (success) {
                setTimeout(() => {
                    testStatus.className = 'test-status test-success';
                    testStatus.innerHTML = `
                        <div class="status-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="status-text">Тест запущен успешно! Длительность: ${duration} сек</div>
                    `;
                    
                    // Закрываем модальное окно через 2 секунды
                    setTimeout(() => {
                        const modal = document.getElementById('testSensorModal');
                        if (modal) modal.style.display = 'none';
                    }, 2000);
                }, 1000);
            } else {
                testStatus.className = 'test-status test-danger';
                testStatus.innerHTML = `
                    <div class="status-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="status-text">Ошибка запуска теста</div>
                `;
            }
        }
    }
    
    // Обновленная функция показа уведомлений с проверкой звука
    function showNotification(message, type = 'info') {
        // Проверяем, включен ли звук
        if (soundEnabled && (type === 'danger' || type === 'warning')) {
            // Воспроизводим звуковое оповещение
            playAlertSound(type);
        }
        
        // Показываем визуальное уведомление
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
    
    // Воспроизведение звукового оповещения
    function playAlertSound(type) {
        try {
            // Создаем звуковой контекст
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (type === 'danger') {
                // Громкий прерывистый звук для аварии
                playBeep(audioContext, 800, 0.3, 0.1, 5);
            } else if (type === 'warning') {
                // Более спокойный звук для предупреждения
                playBeep(audioContext, 600, 0.2, 0.3, 3);
            }
        } catch (e) {
            console.log('Браузер не поддерживает Web Audio API');
        }
    }
    
    // Функция для генерации звукового сигнала
    function playBeep(audioContext, frequency, volume, duration, repeat = 1) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        for (let i = 0; i < repeat; i++) {
            const startTime = audioContext.currentTime + i * (duration + 0.1);
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + repeat * (duration + 0.1));
    }
});