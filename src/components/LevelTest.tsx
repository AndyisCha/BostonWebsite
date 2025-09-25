import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface LevelTestProps {
  userId: string;
  onComplete: () => void;
}

export const LevelTest: React.FC<LevelTestProps> = ({ userId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      question: "What is your name?",
      options: ["My name is John", "I am John", "John is my name", "All correct"]
    },
    // Add more sample questions as needed
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test complete
      onComplete();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        레벨 테스트
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          질문 {currentQuestion + 1} / {questions.length}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {questions[currentQuestion]?.question || "테스트가 완료되었습니다."}
        </Typography>

        {questions[currentQuestion] && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleAnswer(option)}
                sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {option}
              </Button>
            ))}
          </Box>
        )}
      </Paper>

      {!questions[currentQuestion] && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" onClick={onComplete}>
            테스트 완료
          </Button>
        </Box>
      )}
    </Box>
  );
};