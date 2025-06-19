let totalCorrect = 0;
let currentQuestionIndex = 0;
let correctStreak = 0;
let incorrectStreak = 0;
let questions = [];

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Erro ao carregar o arquivo JSON');
        let allQuestions = await response.json();

        // Verifica se há pelo menos 80 perguntas
        if (allQuestions.length < 80) {
            throw new Error('O arquivo JSON contém menos de 80 perguntas');
        }

        // Embaralha e seleciona 40 perguntas
        questions = shuffleArray(allQuestions).slice(0, 40);
        
        // Verifica se 40 perguntas foram selecionadas
        if (questions.length !== 40) {
            throw new Error('Erro ao selecionar 40 perguntas');
        }

        console.log('40 perguntas selecionadas:', questions);
        loadQuestion();

    } catch (error) {
        alert('Erro ao carregar as questões. Verifique o console para mais detalhes.');
        console.error('Erro ao carregar as questões:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.innerText = 
                'Erro ao carregar as questões. Verifique o console para mais detalhes.';
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

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }
    const q = questions[currentQuestionIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.classList.add('option');
        div.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        div.onclick = () => handleAnswer(option);
        optionsEl.appendChild(div);
    });
    feedbackEl.textContent = '';
    nextBtn.style.display = 'none';
  	updateProgressBar();
}

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
        }
		else correctSound.play().catch(e => console.log("Erro ao reproduzir som de acerto:", e));
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
    document.querySelector('.quiz-container').style.display = 'none';
    resultEl.style.display = 'block';
    finalScoreEl.textContent = `Pontuação Final: ${totalCorrect} de ${questions.length}`;
    correctIncorrectEl.textContent = `Acertos: ${totalCorrect}, Erros: ${questions.length - totalCorrect}`;
    studyTipsEl.textContent = totalCorrect >= questions.length * 0.7 ? "Ótimo trabalho! Você está bem preparado para o exame." : "Bom esforço! Revise os conceitos que errou.";
}

nextBtn.onclick = () => {
	currentQuestionIndex++;
    loadQuestion();
};

restartBtn.onclick = () => {
    totalCorrect = 0;
    currentQuestionIndex = 0;
    correctStreak = 0;
    incorrectStreak = 0;
    scoreEl.textContent = totalCorrect;
    document.querySelector('.quiz-container').style.display = 'block';
    resultEl.style.display = 'none';
    
};

loadQuestions();
