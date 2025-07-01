let totalCorrect = 0;
let currentQuestionIndex = 0;
let correctStreak = 0;
let incorrectStreak = 0;
let questions = [];
let usedQuestionIds = [];

let timerInterval;
const totalTime = 60 * 60; // 20 minutos em segundos
let timeLeft = totalTime;
const timerEl = document.getElementById('timer-value');
const timerContainer = document.getElementById('timer');


function startTimer() {
    clearInterval(timerInterval);
    timeLeft = totalTime;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResult();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    if (timeLeft <= 5 * 60) {
        timerContainer.style.color = '#dc2626'; 
    } else {
        timerContainer.style.color = '#16a34a';
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

async function loadQuestions() {
    try {
        const totalQuestions = 65;
        const distribution = {
            "Conceitos de Nuvem": Math.round(totalQuestions * 0.24), // 16 questões
            "Segurança e Conformidade": Math.round(totalQuestions * 0.30), // 20 questões
            "Tecnologia e Serviços de Nuvem": Math.round(totalQuestions * 0.34), // 22 questões
            "Faturamento, Preços e Suporte": Math.round(totalQuestions * 0.12) // 7 questões
        };

        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Erro ao carregar o arquivo JSON');
        let allQuestions = await response.json();

        // Agrupa questões por categoria
        const questionsByCategory = {};
        allQuestions.forEach(q => {
            if (!questionsByCategory[q.category]) {
                questionsByCategory[q.category] = [];
            }
            questionsByCategory[q.category].push(q);
        });

        // Verifica se há questões suficientes em cada categoria
        for (const category in distribution) {
            const available = questionsByCategory[category]?.filter(q => !usedQuestionIds.includes(q.question)) || [];
            if (available.length < distribution[category]) {
                throw new Error(`Não há questões suficientes na categoria "${category}". Necessário: ${distribution[category]}, Disponível: ${available.length}`);
            }
        }

        // Seleciona questões randomicamente por categoria
        questions = [];
        for (const category in distribution) {
            const count = distribution[category];
            const availableQuestions = questionsByCategory[category].filter(q => !usedQuestionIds.includes(q.question));
            const selectedQuestions = shuffleArray(availableQuestions).slice(0, count);
            questions = questions.concat(selectedQuestions);
        }

        // Salva os IDs das questões usadas
        usedQuestionIds = usedQuestionIds.concat(questions.map(q => q.question));

        // Embaralha a lista final de questões
        questions = shuffleArray(questions);

        // Carrega a primeira questão e inicia o timer
        loadQuestion();
        startTimer();

    } catch (error) {
        alert('Erro ao carregar as questões. Verifique o console para mais detalhes.');
        console.error('Erro ao carregar as questões:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.innerText = 'Erro ao carregar as questões. Verifique o console para mais detalhes.';
        }
    }
}

// Função para embaralhar um array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score-value');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
const finalScoreEl = document.getElementById('final-score');
const correctIncorrectEl = document.getElementById('correct-incorrect');
const studyTipsEl = document.getElementById('study-tips');
const restartBtn = document.getElementById('restart-btn');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');
const yesSSSSound = document.getElementById('yesSSS-sound');
const ohNooooSound = document.getElementById('ohNoooo-sound');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {    
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
}

let selectedOptions = [];

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }
    const q = questions[currentQuestionIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    selectedOptions = []; // Resetar seleções ao carregar nova questão
    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.classList.add('option');
        div.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        div.onclick = () => handleOptionClick(option, div); // Nova função para clique
        optionsEl.appendChild(div);
    });
    feedbackEl.textContent = '';
    nextBtn.style.display = 'none';
    updateProgressBar();
}

function handleOptionClick(selected, element) {
    const q = questions[currentQuestionIndex];
    const isMultipleAnswer = Array.isArray(q.answer); // Verifica se é múltipla resposta
    const options = optionsEl.querySelectorAll('.option');

    if (isMultipleAnswer) {
        // Lógica para múltiplas respostas
        if (selectedOptions.includes(selected)) {
            // Desmarcar se já selecionado
            selectedOptions = selectedOptions.filter(opt => opt !== selected);
            element.classList.remove('selected');
        } else {
            // Adicionar nova seleção
            selectedOptions.push(selected);
            element.classList.add('selected');
        }

        // Verificar se o número de seleções é igual ao número de respostas corretas
        if (selectedOptions.length === q.answer.length) {
            handleMultipleAnswer(selectedOptions);
        } else {
            // Destacar seleções parciais em cinza
            options.forEach(opt => {
                if (selectedOptions.some(sel => opt.textContent.includes(sel))) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected', 'correct', 'incorrect');
                }
            });
            feedbackEl.textContent = `Selecione ${q.answer.length} resposta${q.answer.length > 1 ? 's' : ''}.`;
            feedbackEl.style.color = '#6b7280'; // Cor cinza para feedback
            nextBtn.style.display = 'none';
        }
    } else {
        // Lógica para resposta única (mantida como está)
        handleAnswer(selected);
    }
}

function handleMultipleAnswer(selected) {
    const q = questions[currentQuestionIndex];
    const options = optionsEl.querySelectorAll('.option');

    // Desativar cliques após avaliação
    options.forEach(opt => {
        opt.onclick = null;
    });

    // Verificar se todas as seleções estão corretas
    const isCorrect = selected.length === q.answer.length &&
        selected.every(sel => q.answer.includes(sel));

    // Aplicar estilos às opções
    options.forEach(opt => {
        const optionText = opt.textContent.slice(2); // Remover "A) " ou similar
        if (q.answer.includes(optionText)) {
            opt.classList.add('correct');
        }
        if (selected.includes(optionText) && !q.answer.includes(optionText)) {
            opt.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        totalCorrect++;
        correctStreak++;
        incorrectStreak = 0;
        if (correctStreak === 5) {
            yesSSSSound.play().catch(e => console.log("Erro ao reproduzir som de YESSSS:", e));
        } else {
            correctSound.play().catch(e => console.log("Erro ao reproduzir som de acerto:", e));
        }
        feedbackEl.textContent = q.feedback;
        feedbackEl.style.color = '#22c55e';
    } else {
        incorrectStreak++;
        correctStreak = 0;
        if (incorrectStreak === 2) {
            ohNooooSound.play().catch(e => console.log("Erro ao reproduzir som de Oh, noooo:", e));
        }
        feedbackEl.textContent = `Ops! As respostas corretas são ${q.answer.join(' e ')}. ${q.feedback}`;
        feedbackEl.style.color = '#ef4444';
        incorrectSound.play().catch(e => console.log("Erro ao reproduzir som de erro:", e));
    }

    scoreEl.textContent = totalCorrect;
    nextBtn.style.display = 'block';
}

// A função handleAnswer original permanece para questões de resposta única
function handleAnswer(selected) {
    const q = questions[currentQuestionIndex];
    const options = optionsEl.querySelectorAll('.option');
    options.forEach(opt => {
        opt.onclick = null; // Desativa cliques após seleção
        if (opt.textContent.includes(q.answer)) {
            opt.classList.add('correct');
        }
        if (opt.textContent.includes(selected) && selected !== q.answer) {
            opt.classList.add('incorrect');
        }
    });

    if (selected === q.answer) {
        totalCorrect++;
        correctStreak++;
        incorrectStreak = 0;
        if (correctStreak === 5) {
            yesSSSSound.play().catch(e => console.log("Erro ao reproduzir som de YESSSS:", e));
        } else {
            correctSound.play().catch(e => console.log("Erro ao reproduzir som de acerto:", e));
        }
        feedbackEl.textContent = q.feedback;
        feedbackEl.style.color = '#22c55e';
    } else {
        incorrectStreak++;
        correctStreak = 0;
        if (incorrectStreak === 2) {
            ohNooooSound.play().catch(e => console.log("Erro ao reproduzir som de Oh, noooo:", e));
        }
        feedbackEl.textContent = `Ops! A resposta correta é ${q.answer}. ${q.feedback}`;
        feedbackEl.style.color = '#ef4444';
        incorrectSound.play().catch(e => console.log("Erro ao reproduzir som de erro:", e));
    }
    scoreEl.textContent = totalCorrect;
    nextBtn.style.display = 'block';
}



function showResult() {
      stopTimer();

    resultEl.style.display = 'block';
    document.getElementById('result').style.display = 'block';
    document.getElementById('final-score').textContent = `Você acertou ${totalCorrect} de ${questions.length} perguntas.`;
    document.getElementById('correct-incorrect').textContent = `Acertos: ${totalCorrect} | Erros: ${questions.length - totalCorrect}`;
    document.getElementById('study-tips').textContent = 'Dica: Revise os tópicos em que errou para melhorar seu desempenho!';

}

nextBtn.onclick = () => {
	currentQuestionIndex++;
    loadQuestion();
};


function resetQuiz() {
      stopTimer();

    totalCorrect = 0;
    currentQuestionIndex = 0;
    correctStreak = 0;
    incorrectStreak = 0;
    scoreEl.textContent = totalCorrect;
    resultEl.style.display = 'none';
    questionEl.textContent = '';
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    // Não limpa usedQuestionIds para garantir que não repita questões
    loadQuestions();
}

restartBtn.onclick = resetQuiz;

loadQuestions();
