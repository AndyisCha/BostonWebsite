import React, { useState } from 'react';
import '../../styles/LevelTestComponent.css';

export const LevelTestPreview: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState('B1');
  const [timeLeft, setTimeLeft] = useState(1800); // 30분

  const questions = [
    {
      id: '1',
      text: 'Choose the correct form of the verb to complete the sentence: "She _____ to the store every morning."',
      options: [
        { id: 'a', text: 'go' },
        { id: 'b', text: 'goes' },
        { id: 'c', text: 'going' },
        { id: 'd', text: 'gone' }
      ]
    },
    {
      id: '2',
      text: 'Read the following passage and answer the question below.',
      passage: 'Climate change is one of the most pressing issues of our time. Scientists around the world are working to understand its causes and develop solutions to mitigate its effects. The primary cause of climate change is the increase in greenhouse gases in the atmosphere, particularly carbon dioxide from burning fossil fuels.',
      question: 'According to the passage, what is the primary cause of climate change?',
      options: [
        { id: 'a', text: 'Scientists working around the world' },
        { id: 'b', text: 'Increase in greenhouse gases' },
        { id: 'c', text: 'Developing solutions' },
        { id: 'd', text: 'Pressing issues of our time' }
      ]
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeLeft < 300) return 'test-timer danger'; // 5분 미만
    if (timeLeft < 600) return 'test-timer warning'; // 10분 미만
    return 'test-timer';
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="level-test-container">
      <h2>CEFR 레벨 테스트</h2>

      <div className={getTimerClass()}>
        남은 시간: {formatTime(timeLeft)}
      </div>

      <div className="test-progress">
        <div className="progress-header">
          <span className="progress-text">진행률</span>
          <span>{currentQuestion + 1} / {questions.length}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="level-indicator">
        <h3>현재 추정 레벨</h3>
        <div className="current-level">{currentLevel}</div>
        <div className="level-badges">
          {['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2'].map(level => (
            <div
              key={level}
              className={`level-badge ${level.toLowerCase()} ${level === currentLevel ? 'active' : ''}`}
            >
              {level}
            </div>
          ))}
        </div>
      </div>

      <div className="question-area">
        <div className="question-number">
          Question {currentQuestion + 1}
        </div>
        <div className="question-text">
          {currentQ.text}
        </div>

        {currentQ.passage && (
          <div className="passage">
            {currentQ.passage}
          </div>
        )}

        {currentQ.question && (
          <div className="question-text">
            {currentQ.question}
          </div>
        )}

        <div className="options-container">
          {currentQ.options.map(option => (
            <div
              key={option.id}
              className={`option-item ${selectedAnswer === option.id ? 'selected' : ''}`}
              onClick={() => setSelectedAnswer(option.id)}
            >
              <div className="option-letter">
                {option.id.toUpperCase()}
              </div>
              <div className="option-text">
                {option.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-actions">
        <button
          className="btn-previous"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
        >
          이전
        </button>

        <div className="page-info">
          {currentQuestion + 1} / {questions.length}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            className="btn-next"
            disabled={!selectedAnswer}
            onClick={() => {
              setCurrentQuestion(currentQuestion + 1);
              setSelectedAnswer('');
            }}
          >
            다음
          </button>
        ) : (
          <button
            className="btn-submit"
            disabled={!selectedAnswer}
          >
            테스트 완료
          </button>
        )}
      </div>
    </div>
  );
};