let tg = window.Telegram.WebApp;
let score = 0;
let timeLeft = 30;
let gameInterval;
let isGameActive = false;
let currentStreak = 0;
let highScore = localStorage.getItem('highScore') || 0;

// В начале файла, после объявления переменных
tg.MainButton.text = "Заново";
tg.MainButton.onClick(() => {
    document.getElementById('startScreen').style.display = 'flex';
    tg.MainButton.hide();
});

const questions = [
    // Математика (базовый уровень)
    { text: "2 + 2 = ?", correct: "4", wrong: ["3", "5", "6"], category: "math", points: 5 },
    { text: "5 × 5 = ?", correct: "25", wrong: ["20", "30", "15"], category: "math", points: 5 },
    { text: "10 ÷ 2 = ?", correct: "5", wrong: ["4", "6", "8"], category: "math", points: 5 },
    { text: "7 + 3 = ?", correct: "10", wrong: ["9", "11", "13"], category: "math", points: 5 },
    
    // География
    { text: "Столица России?", correct: "Москва", wrong: ["Париж", "Лондон", "Берлин"], category: "geo", points: 8 },
    { text: "Самый большой океан?", correct: "Тихий", wrong: ["Атлантический", "Индийский", "Северный Ледовитый"], category: "geo", points: 8 },
    { text: "Самая длинная река мира?", correct: "Нил", wrong: ["Амазонка", "Янцзы", "Миссисипи"], category: "geo", points: 8 },
    { text: "Самая высокая гора мира?", correct: "Эверест", wrong: ["Монблан", "Килиманджаро", "Эльбрус"], category: "geo", points: 8 },
    
    // География (средний уровень)
    { text: "Столица Японии?", correct: "Токио", wrong: ["Пекин", "Сеул", "Бангкок"], category: "geo", points: 10 },
    { text: "Самая большая страна мира?", correct: "Россия", wrong: ["Китай", "США", "Канада"], category: "geo", points: 10 },
    { text: "Самая маленькая страна мира?", correct: "Ватикан", wrong: ["Монако", "Науру", "Мальта"], category: "geo", points: 10 },
    
    // Логика
    { text: "Продолжите ряд: 2,4,8,16,...", correct: "32", wrong: ["24", "20", "28"], category: "logic", points: 12 },
    { text: "Яблоко : Фрукт = Морковь : ?", correct: "Овощ", wrong: ["Еда", "Растение", "Корень"], category: "logic", points: 12 },
    { text: "1, 3, 6, 10, ...", correct: "15", wrong: ["14", "16", "13"], category: "logic", points: 12 },
    { text: "2, 5, 10, 17, ...", correct: "26", wrong: ["24", "25", "27"], category: "logic", points: 12 },
    
    // Общие знания
    { text: "Сколько цветов в радуге?", correct: "7", wrong: ["6", "8", "5"], category: "knowledge", points: 8 },
    { text: "Самая быстрая сухопутная птица?", correct: "Страус", wrong: ["Павлин", "Индюк", "Курица"], category: "knowledge", points: 10 },
    { text: "Сколько костей у человека?", correct: "206", wrong: ["205", "207", "208"], category: "knowledge", points: 10 },
    { text: "В каком году началась Вторая мировая война?", correct: "1939", wrong: ["1941", "1938", "1940"], category: "knowledge", points: 10 },

    // Искусство
    { text: "Кто написал 'Мону Лизу'?", correct: "Да Винчи", wrong: ["Ван Гог", "Пикассо", "Рембрандт"], category: "art", points: 12 },
    { text: "Какой художник отрезал себе ухо?", correct: "Ван Гог", wrong: ["Дали", "Моне", "Мане"], category: "art", points: 12 },
    
    // Наука
    { text: "Химический символ золота?", correct: "Au", wrong: ["Ag", "Fe", "Cu"], category: "science", points: 10 },
    { text: "Самая близкая к Земле звезда?", correct: "Солнце", wrong: ["Сириус", "Альфа Центавра", "Вега"], category: "science", points: 12 },
    { text: "Скорость света (км/с)?", correct: "300000", wrong: ["200000", "400000", "250000"], category: "science", points: 15 }
];

function showFloatingPoints(points, isPositive) {
    const pointsEl = document.createElement('div');
    pointsEl.className = 'floating-points';
    pointsEl.textContent = isPositive ? `+${points}` : `-${points}`;
    pointsEl.style.color = isPositive ? '#4CAF50' : '#f44336';
    document.body.appendChild(pointsEl);
    
    setTimeout(() => pointsEl.remove(), 1000);
}

function updateGame() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    const answers = [question.correct, ...question.wrong].sort(() => Math.random() - 0.5);
    
    // Показываем категорию и стоимость вопроса
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category-badge';
    categoryEl.textContent = `${question.category.toUpperCase()} • ${question.points} очков`;
    gameArea.appendChild(categoryEl);
    
    const questionEl = document.createElement('div');
    questionEl.className = 'tap-button question animate__animated animate__fadeIn';
    questionEl.textContent = question.text;
    questionEl.style.gridColumn = '1 / span 2';
    gameArea.appendChild(questionEl);
    
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'tap-button animate__animated animate__fadeInUp';
        button.textContent = answer;
        
        button.onclick = () => {
            if (!isGameActive) return;
            
            if (answer === question.correct) {
                score += question.points;
                currentStreak++;
                button.classList.add('correct-answer');
                showFloatingPoints(question.points, true);
                
                // Бонус за серию правильных ответов
                if (currentStreak >= 3) {
                    const bonus = Math.floor(question.points * 0.5);
                    score += bonus;
                    showFloatingPoints(bonus, true);
                }
            } else {
                score = Math.max(0, score - Math.floor(question.points / 2));
                currentStreak = 0;
                button.classList.add('wrong-answer');
                showFloatingPoints(Math.floor(question.points / 2), false);
            }
            
            document.getElementById('score').textContent = score;
            document.getElementById('streak').textContent = currentStreak;
            
            setTimeout(updateGame, 500);
        };
        
        gameArea.appendChild(button);
    });
}

function startGame() {
    if (isGameActive) return;
    
    isGameActive = true;
    score = 0;
    currentStreak = 0;
    timeLeft = 30;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = currentStreak;
    document.getElementById('startScreen').style.display = 'none';
    
    updateGame();
    gameInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 10) {
            document.getElementById('timer').classList.add('timer-warning');
        }
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="end-screen animate__animated animate__fadeIn">
            <h2>Игра окончена!</h2>
            <p>Ваш счёт: ${score}</p>
            <p>Рекорд: ${highScore}</p>
            <p>Серия правильных ответо��: ${currentStreak}</p>
        </div>
    `;
    
    tg.MainButton.show();
} 