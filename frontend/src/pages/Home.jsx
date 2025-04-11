import { useState, useEffect } from "react";
import api from "../api/api"; // Import API for backend requests


const questions = [
  { question: "You enjoy social events with lots of people.", type: "E" },
  { question: "You prefer to plan things rather than being spontaneous.", type: "J" },
  { question: "You rely more on logic than emotions when making decisions.", type: "T" },
  { question: "You enjoy spending time alone rather than with people.", type: "I" },
  { question: "You focus more on details than the big picture.", type: "S" },
  { question: "You follow your heart rather than your head.", type: "F" },
  { question: "You like abstract ideas more than concrete facts.", type: "N" },
  { question: "You prefer structured environments over flexible ones.", type: "J" },
  { question: "You act first and think later.", type: "P" },
  { question: "You enjoy deep discussions rather than small talk.", type: "I" },
];

const personalityDescriptions = {
  ISTJ: "Practical, responsible, and organized. You value stability and are known for your reliability.",
  ISFJ: "Caring, dedicated, and detail-oriented. You're a loyal protector with excellent memory for details.",
  INFJ: "Insightful, creative, and idealistic. You seek meaning and connection in ideas and relationships.",
  INTJ: "Strategic, independent, and analytical. You excel at developing innovative solutions to complex problems.",
  ISTP: "Practical problem-solver who enjoys understanding how things work. You're adaptable and action-oriented.",
  ISFP: "Artistic, sensitive, and compassionate. You value personal space and appreciate beauty in the world.",
  INFP: "Idealistic, empathetic, and creative. You're driven by deep personal values and seek authenticity.",
  INTP: "Logical, curious, and inventive. You enjoy theoretical models and questioning assumptions.",
  ESTP: "Energetic, pragmatic, and spontaneous. You enjoy taking risks and are excellent at problem-solving.",
  ESFP: "Enthusiastic, friendly, and adaptable. You enjoy the present moment and bringing others together.",
  ENFP: "Creative, enthusiastic, and possibilities-focused. You enjoy connecting with people and ideas.",
  ENTP: "Innovative, strategic, and outspoken. You enjoy intellectual challenges and thinking outside the box.",
  ESTJ: "Efficient, logical, and traditional. You value structure and are natural at implementing systems.",
  ESFJ: "Caring, popular, and traditional. You're focused on creating harmony and are very people-oriented.",
  ENFJ: "Charismatic, empathetic, and inspiring. You're focused on helping others develop and grow.",
  ENTJ: "Strategic, decisive, and ambitious. You're a natural leader who enjoys creating efficient systems.",
};

function Home() {
  const [step, setStep] = useState(-1); // -1 means test has not started
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Reset any animation state when moving to a new question
  useEffect(() => {
    setSelectedAnswer(null);
  }, [step]);

  const handleAnswer = (type, value, strength) => {
    setSelectedAnswer(strength);

    // Short delay to show the selection animation
    setTimeout(() => {
      const newScores = { ...scores, [type]: scores[type] + value * strength };
      setScores(newScores);

      const newAnswers = [...answers];
      newAnswers[step] = strength;
      setAnswers(newAnswers);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setStep("result");
      }
    }, 300);
  };

  // New function to handle neutral selection
  const handleNeutral = () => {
    setSelectedAnswer(0);

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[step] = 0;
      setAnswers(newAnswers);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setStep("result");
      }
    }, 300);
  };

  const getPersonalityType = () => {
    return (
      (scores.E > scores.I ? "E" : "I") +
      (scores.S > scores.N ? "S" : "N") +
      (scores.T > scores.F ? "T" : "F") +
      (scores.J > scores.P ? "J" : "P")
    );
  };

  const saveTestResults = async () => {
    try {
      const personalityType = getPersonalityType();
      const testResult = {
        personalityType,
        scores,
        description: personalityDescriptions[personalityType],
        traits: calculateDominantTraits(), // Add trait details
        date: new Date().toISOString()
      };
  
      // ✅ Save to backend API only
      await api.post("/results", testResult);
  
      alert("✅ Test results saved successfully!");
    } catch (error) {
      console.error("🔥 Error saving test results:", error);
      alert("❌ Failed to save results to the server.");
    }
  };
  

  const calculateDominantTraits = () => {
    const traits = [];
    const eVsI = Math.abs(scores.E - scores.I);
    const sVsN = Math.abs(scores.S - scores.N);
    const tVsF = Math.abs(scores.T - scores.F);
    const jVsP = Math.abs(scores.J - scores.P);

    traits.push({
      name: scores.E > scores.I ? "Extroverted" : "Introverted",
      strength: Math.min(100, (eVsI / 2) * 20),
      letter: scores.E > scores.I ? "E" : "I"
    });

    traits.push({
      name: scores.S > scores.N ? "Sensing" : "Intuitive",
      strength: Math.min(100, (sVsN / 2) * 20),
      letter: scores.S > scores.N ? "S" : "N"
    });

    traits.push({
      name: scores.T > scores.F ? "Thinking" : "Feeling",
      strength: Math.min(100, (tVsF / 2) * 20),
      letter: scores.T > scores.F ? "T" : "F"
    });

    traits.push({
      name: scores.J > scores.P ? "Judging" : "Perceiving",
      strength: Math.min(100, (jVsP / 2) * 20),
      letter: scores.J > scores.P ? "J" : "P"
    });

    return traits;
  };

  const restartTest = () => {
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setAnswers(Array(questions.length).fill(null));
    setStep(-1);
  };

  const goToQuestion = (index) => {
    if (step !== "result" && index <= Math.max(...answers.map((a, i) => a !== null ? i : -1)) + 1) {
      setStep(index);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 bg-gradient-to-b from-green-50 to-white text-gray-800 px-6">
      <div className="max-w-4xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
          Personality Test
        </h1>

        {/* Welcome Screen */}
        {step === -1 && (
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-green-100 w-full max-w-3xl text-center animate-fade-in">
            <h2 className="text-3xl font-semibold mb-8 text-green-800">Discover Your Personality Type</h2>
            <p className="mb-10 text-gray-600 text-lg">
              This test will help you understand your personality traits based on the Myers-Briggs Type Indicator.
              Answer honestly for the most accurate results.
            </p>
            <button
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-xl text-xl font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105"
              onClick={() => setStep(0)}
            >
              Begin Your Journey
            </button>
            <div className="mt-10 text-gray-500 text-lg">
              Complete all 10 questions to discover your personality type
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {step >= 0 && step < questions.length && (
          <div className="w-full max-w-3xl mb-8">
            <div className="flex justify-between mb-3 text-sm text-gray-500">
              <span>Question {step + 1} of {questions.length}</span>
              <span>{Math.round((step / questions.length) * 100)}% Complete</span>
            </div>
            <div className="h-3 bg-green-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${(step / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex mt-4 justify-center">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  className={`w-4 h-4 mx-1 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === step
                      ? "bg-green-600 transform scale-125"
                      : idx < step
                        ? "bg-green-400"
                        : "bg-green-100"
                    } ${
                    idx <= Math.max(...answers.map((a, i) => a !== null ? i : -1)) + 1
                      ? "hover:bg-green-300"
                      : ""
                    }`}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {step >= 0 && step < questions.length && (
          <div className="mt-4 bg-white p-12 rounded-2xl shadow-xl w-full max-w-3xl text-center border border-green-100 transition-all duration-500">
            <p className="text-3xl font-semibold mb-12 text-green-800">{questions[step].question}</p>

            <div className="grid grid-cols-5 gap-2 mb-6">
              <div className="text-sm text-gray-500">Strongly Disagree</div>
              <div className="col-span-3"></div>
              <div className="text-sm text-gray-500">Strongly Agree</div>
            </div>

            <div className="flex justify-between gap-3 mb-10">
              {[2, 1, 0, 1, 2].map((strength, idx) => {
                const value = idx < 2 ? -1 : idx > 2 ? 1 : 0;
                return (
                  <button
                    key={idx}
                    className={`flex-1 py-5 rounded-lg font-medium transition-all transform ${
                      selectedAnswer === strength && ((value === -1 && idx < 2) || (value === 1 && idx > 2) || (value === 0 && idx === 2))
                        ? "scale-95"
                        : "hover:scale-105"
                      } ${
                      idx === 0
                        ? "bg-red-400 hover:bg-red-500 text-white"
                        : idx === 1
                          ? "bg-red-300 hover:bg-red-400 text-white"
                          : idx === 2
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : idx === 3
                              ? "bg-green-300 hover:bg-green-400 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                      } text-lg`}
                    onClick={() => {
                      if (idx === 2) {
                        // Handle neutral option
                        handleNeutral();
                      } else {
                        handleAnswer(
                          questions[step].type,
                          idx < 2 ? -1 : 1, // Direction (agree/disagree)
                          strength // Strength of response
                        );
                      }
                    }}
                  >
                    {idx === 0
                      ? "Strongly Disagree"
                      : idx === 1
                        ? "Disagree"
                        : idx === 2
                          ? "Neutral"
                          : idx === 3
                            ? "Agree"
                            : "Strongly Agree"}
                  </button>
                );
              })}
            </div>

            {step > 0 && (
              <button
                className="text-green-600 hover:text-green-800 transition mt-6 text-lg"
                onClick={() => step > 0 && setStep(step - 1)}
              >
                ← Previous Question
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {step === "result" && (
          <div className="mt-6 bg-white p-12 rounded-2xl shadow-xl w-full max-w-4xl border border-green-100 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-green-800">Your Personality Type</h2>
              <div className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700 mb-6">
                {getPersonalityType()}
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto px-6">
                {personalityDescriptions[getPersonalityType()]}
              </p>
            </div>

            <div className="mb-12 px-6">
              <h3 className="text-2xl font-semibold mb-8 text-green-800">Trait Breakdown</h3>
              {calculateDominantTraits().map((trait, idx) => (
                <div key={idx} className="mb-8">
                  <div className="flex justify-between mb-3">
                    <span className="font-medium text-xl text-gray-700">
                      {trait.name} ({trait.letter})
                    </span>
                    <span className="text-lg">{Math.round(trait.strength)}%</span>
                  </div>
                  <div className="h-8 bg-green-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        idx === 0
                          ? "bg-green-400"
                          : idx === 1
                            ? "bg-green-500"
                            : idx === 2
                              ? "bg-green-600"
                              : "bg-green-700"
                        }`}
                      style={{ width: `${trait.strength}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-8 mt-12">
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition duration-300 text-xl"
                onClick={restartTest}
              >
                Take Test Again
              </button>
              <button
                className="bg-gray-100 text-green-700 px-10 py-5 rounded-xl font-semibold shadow-lg hover:bg-gray-200 transition duration-300 text-xl border border-green-200"
                onClick={saveTestResults}
              >
                Save Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;