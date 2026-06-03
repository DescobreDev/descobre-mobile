import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DiscQuestion, DiscProfile } from '../types/disc';

type Phase = 'loading' | 'q1' | 'q2' | 'q3_tiebreak' | 'result' | 'error';

export function useDiscTest() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<DiscQuestion[]>([]);
  const [answer1, setAnswer1] = useState<{ questionId: number; profile: DiscProfile } | null>(null);
  const [answer2, setAnswer2] = useState<{ questionId: number; profile: DiscProfile } | null>(null);
  const [tiebreakOptions, setTiebreakOptions] = useState<DiscQuestion['options']>([]);
  const [result, setResult] = useState<{ profileType: DiscProfile; profileTypeSecondary: DiscProfile } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DiscQuestion[]>('/disc/questions')
      .then(({ data }) => {
        setQuestions(data);
        setPhase('q1');
      })
      .catch(() => setPhase('error'));
  }, []);

  const answerQ1 = (questionId: number, profile: DiscProfile) => {
    setAnswer1({ questionId, profile });
    setPhase('q2');
  };

  const answerQ2 = (questionId: number, profile: DiscProfile) => {
    setAnswer2({ questionId, profile });

    if (profile === answer1!.profile) {
      const q3 = questions[2];
      const filtered = q3.options.filter(o => o.profile !== answer1!.profile);
      setTiebreakOptions(filtered);
      setPhase('q3_tiebreak');
    } else {
      submitAnswers(answer1!.profile, profile);
    }
  };

  const answerTiebreak = (profile: DiscProfile) => {
    submitAnswers(answer1!.profile, profile, questions[2].id, profile);
  };

  const submitAnswers = async (
    primary: DiscProfile,
    secondary: DiscProfile,
    question3Id?: number,
    answer3?: DiscProfile,
  ) => {
    try {

      console.log('ANSWER1', answer1);
      console.log('ANSWER2', answer2);
      console.log('submitAnswers executou');


      const { data } = await api.post('/disc/submit', {
        question1Id: answer1!.questionId,
        answer1: primary,
        question2Id: answer2!.questionId,
        answer2: secondary,
        ...(question3Id && { question3Id, answer3 }),
      });

      console.log('RESPOSTA API:', data);
      setResult(data);
      setPhase('result');
    } catch (err) {
      console.log('ERRO DISC:', err);
      setError('Erro ao salvar resultado. Tente novamente.');
      setPhase('error');
    }
  };

  const q1 = questions[0] ?? null;
  const q2 = questions[1] ?? null;
  const q3 = questions[2] ? { ...questions[2], options: tiebreakOptions } : null;

  return { phase, q1, q2, q3, answer1, answerQ1, answerQ2, answerTiebreak, result, error };
}