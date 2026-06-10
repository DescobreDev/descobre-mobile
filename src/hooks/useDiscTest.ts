import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DiscQuestion, DiscProfile } from '../types/disc';

type Phase =
  | 'loading'
  | 'q1'
  | 'q2'
  | 'q3_tiebreak'
  | 'result'
  | 'error';

type AnswerData = {
  questionId: number;
  profile: DiscProfile;
};

export function useDiscTest() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<DiscQuestion[]>([]);
  const [answer1, setAnswer1] = useState<AnswerData | null>(null);
  const [answer2, setAnswer2] = useState<AnswerData | null>(null);
  const [tiebreakOptions, setTiebreakOptions] = useState<
    DiscQuestion['options']
  >([]);
  const [result, setResult] = useState<{
    profileType: DiscProfile;
    profileTypeSecondary: DiscProfile;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DiscQuestion[]>('/disc/questions')
      .then(({ data }) => {
        setQuestions(data);
        setPhase('q1');
      })
      .catch(() => {
        setPhase('error');
      });
  }, []);

  const answerQ1 = (
    questionId: number,
    profile: DiscProfile,
  ) => {
    setAnswer1({
      questionId,
      profile,
    });

    setPhase('q2');
  };

  const answerQ2 = (
    questionId: number,
    profile: DiscProfile,
  ) => {
    if (!answer1) {
      setError('Primeira resposta não encontrada.');
      setPhase('error');
      return;
    }

    const currentAnswer2: AnswerData = {
      questionId,
      profile,
    };

    setAnswer2(currentAnswer2);

    if (profile === answer1.profile) {
      const q3 = questions[2];

      const filtered = q3.options.filter(
        option => option.profile !== answer1.profile,
      );

      setTiebreakOptions(filtered);
      setPhase('q3_tiebreak');
      return;
    }

    submitAnswers(
      answer1,
      currentAnswer2,
    );
  };

  const answerTiebreak = (
    profile: DiscProfile,
  ) => {
    if (!answer1 || !answer2) {
      setError('Respostas incompletas.');
      setPhase('error');
      return;
    }

    submitAnswers(
      answer1,
      answer2,
      questions[2].id,
      profile,
    );
  };

  const submitAnswers = async (
    answer1Data: AnswerData,
    answer2Data: AnswerData,
    question3Id?: number,
    answer3?: DiscProfile,
  ) => {
    try {
      console.log('ANSWER1', answer1Data);
      console.log('ANSWER2', answer2Data);
      console.log('submitAnswers executou');

      const payload = {
        question1Id: answer1Data.questionId,
        answer1: answer1Data.profile,

        question2Id: answer2Data.questionId,
        answer2: answer2Data.profile,

        ...(question3Id && {
          question3Id,
          answer3,
        }),
      };

      console.log('PAYLOAD', payload);

      const { data } = await api.post(
        '/disc/submit',
        payload,
      );

      console.log('RESPOSTA API:', data);

      setResult(data);
      setPhase('result');
    } catch (err) {
      console.log('ERRO DISC:', err);

      setError(
        'Erro ao salvar resultado. Tente novamente.',
      );

      setPhase('error');
    }
  };

  const q1 = questions[0] ?? null;
  const q2 = questions[1] ?? null;

  const q3 = questions[2]
    ? {
        ...questions[2],
        options: tiebreakOptions,
      }
    : null;

  return {
    phase,
    q1,
    q2,
    q3,
    answer1,
    answerQ1,
    answerQ2,
    answerTiebreak,
    result,
    error,
  };
}