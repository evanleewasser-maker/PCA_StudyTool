import React, { useState, useEffect } from 'react';

export default function App() {
  const [appState, setAppState] = useState('loading'); // 'loading', 'setup', 'quiz', 'results', 'error'
  const [allQuestions, setAllQuestions] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('All');
  
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/evanleewasser-maker/PCA_StudyTool/dbedbfba44a01981125eb622f62e35b8968a7770/PCA_MQS_Bank_v4.json');
        if (!response.ok) {
          throw new Error('Failed to fetch the question bank.');
        }
        const data = await response.json();
        setAllQuestions(data);
        
        const chapters = [...new Set(data.map(q => q.chapter).filter(c => c !== undefined && c !== null))].sort((a,b) => a - b);
        setAvailableChapters(chapters);
        setAppState('setup');
      } catch (err) {
        setErrorMsg(err.message);
        setAppState('error');
      }
    };
    fetchData();
  }, []);

  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startQuiz = () => {
    let filtered = allQuestions;
    if (selectedChapter !== 'All') {
      filtered = allQuestions.filter(q => String(q.chapter) === String(selectedChapter));
    }
    
    if (filtered.length === 0) {
      alert("No questions found for the selected chapter.");
      return;
    }

    setCurrentQuestions(shuffleArray(filtered));
    setCurrentIndex(0);
    setScore(0);
    setAppState('quiz');
    resetTurn();
  };

  const resetTurn = () => {
    setSelectedAnswerIndex(null);
    setIsCorrect(null);
    setIsWaiting(false);
  };

  const handleHome = () => {
    setAppState('setup');
    resetTurn();
  };

  const handleOptionClick = (optionText, index) => {
    if (isWaiting) return;
    setIsWaiting(true);
    setSelectedAnswerIndex(index);
    
    const currentQ = currentQuestions[currentIndex];
    const correct = optionText === currentQ.answer_text;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        advanceQuestion();
      }, 1000);
    } else {
      setTimeout(() => {
        advanceQuestion();
      }, 3000);
    }
  };

  const advanceQuestion = () => {
    resetTurn();
    setCurrentIndex(prev => {
      if (prev + 1 < currentQuestions.length) {
        return prev + 1;
      } else {
        setAppState('results');
        return prev;
      }
    });
  };

  const getButtonStyles = (index) => {
    let baseStyle = "w-full p-4 text-left text-lg font-medium border-2 rounded-xl transition-all outline-none shadow-sm flex items-center justify-between ";

    if (selectedAnswerIndex === null) {
      return baseStyle + "bg-slate-800 text-slate-50 border-slate-700 hover:border-yellow-400 hover:bg-slate-700 cursor-pointer";
    }

    const currentQ = currentQuestions[currentIndex];
    const isUserSelection = index === selectedAnswerIndex;
    const isActuallyCorrect = currentQuestions[currentIndex].options[index] === currentQ.answer_text;

    if (isUserSelection && isCorrect) {
      return baseStyle + "bg-green-600 text-white border-green-500 opacity-100 cursor-default";
    }

    if (isUserSelection && !isCorrect) {
      return baseStyle + "bg-red-600 text-white border-red-500 opacity-100 cursor-default";
    }

    if (!isUserSelection && isActuallyCorrect && !isCorrect) {
      return baseStyle + "bg-yellow-500 text-slate-900 border-yellow-400 opacity-100 cursor-default font-bold shadow-[0_0_15px_rgba(234,179,8,0.5)]";
    }

    return baseStyle + "bg-slate-800/50 text-slate-400 border-slate-700/50 opacity-50 cursor-default";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-50 selection:bg-yellow-500 selection:text-slate-900">
      
      {/* Header */}
      <header className="bg-slate-950 border-b-2 border-yellow-500 p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-widest text-yellow-400 uppercase flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            PCA Study Tool
          </h1>
          <div className="flex items-center gap-4">
            {appState === 'quiz' && (
              <div className="flex gap-4 font-semibold hidden md:flex">
                <span className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner text-sm">
                  Q: <span className="text-yellow-400">{currentIndex + 1}</span> / {currentQuestions.length}
                </span>
                <span className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner text-sm">
                  Score: <span className="text-yellow-400">{score}</span>
                </span>
              </div>
            )}
            <button 
              onClick={handleHome}
              disabled={appState === 'loading' || appState === 'setup'}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-400 border border-yellow-500 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold shadow-md"
              title="Return to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          
          {appState === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold text-yellow-400">Loading Question Bank...</h2>
            </div>
          )}

          {appState === 'error' && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-8 rounded-xl text-center space-y-4 max-w-lg mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h2 className="text-2xl font-bold">Connection Error</h2>
              <p>{errorMsg}</p>
            </div>
          )}

          {appState === 'setup' && (
            <div className="bg-slate-800/80 p-10 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in duration-500 max-w-xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold text-yellow-400">Configure Quiz</h2>
              <p className="text-slate-300">Select a chapter to study, or choose 'All' for a comprehensive review.</p>
              
              <div className="flex flex-col gap-2 text-left w-full max-w-sm mx-auto">
                <label className="text-yellow-400 font-bold ml-1 uppercase tracking-wide text-sm">Chapter Selection</label>
                <select 
                  className="w-full p-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-white outline-none focus:border-yellow-400 transition-colors"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="All">All Chapters ({allQuestions.length} questions)</option>
                  {availableChapters.map(chap => {
                    const count = allQuestions.filter(q => String(q.chapter) === String(chap)).length;
                    return (
                      <option key={chap} value={chap}>Chapter {chap} ({count} questions)</option>
                    )
                  })}
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  onClick={startQuiz}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Start Quiz
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
              </div>
            </div>
          )}

          {appState === 'quiz' && currentQuestions.length > 0 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-8 overflow-hidden">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${((currentIndex) / currentQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Card */}
              <div className="bg-slate-800/80 p-8 rounded-2xl border-l-4 border-yellow-400 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                    Chapter {currentQuestions[currentIndex].chapter || 'N/A'}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                  {currentQuestions[currentIndex].question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className={`grid gap-4 ${currentQuestions[currentIndex].options.length > 4 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {currentQuestions[currentIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt, i)}
                    disabled={isWaiting}
                    className={getButtonStyles(i)}
                  >
                    <span>{opt}</span>
                    
                    {/* Render icons conditionally based on answer state */}
                    {selectedAnswerIndex !== null && currentQuestions[currentIndex].options[i] === currentQuestions[currentIndex].answer_text && (
                       <svg className="flex-shrink-0 ml-3 text-green-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {selectedAnswerIndex !== null && i === selectedAnswerIndex && currentQuestions[currentIndex].options[i] !== currentQuestions[currentIndex].answer_text && (
                       <svg className="flex-shrink-0 ml-3 text-red-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Feedback Alert */}
              {isWaiting && (
                <div className={`p-4 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 shadow-lg ${isCorrect ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
                  <div className={`p-2 rounded-full flex-shrink-0 mt-1 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isCorrect 
                      ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    {!isCorrect && (
                      <p className="text-slate-200 text-md mt-2">
                        The correct answer is: <br/>
                        <span className="font-bold text-yellow-400 text-xl block mt-1">{currentQuestions[currentIndex].answer_text}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {appState === 'results' && (
            <div className="bg-slate-800/80 p-10 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm text-center animate-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center p-6 rounded-full bg-slate-900 border-4 border-yellow-500 mb-6 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M12 15l-2 5l9-5l-9-5l2 5z" fill="currentColor"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wide">Evolution Complete</h2>
              <p className="text-slate-300 text-lg mb-10">Review your final assessment score below.</p>
              
              <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-10 max-w-sm mx-auto shadow-inner relative overflow-hidden mb-10">
                <div className="text-7xl font-black text-yellow-400 relative z-10 drop-shadow-md">
                  {Math.round((score / currentQuestions.length) * 100)}%
                </div>
                <div className="text-xl text-slate-300 mt-4 font-medium relative z-10 border-t border-slate-700 pt-4">
                  <span className="text-green-400 font-bold">{score}</span> correct out of <span className="font-bold">{currentQuestions.length}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button 
                  onClick={startQuiz}
                  className="px-8 py-4 rounded-xl font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                  Retake Chapter
                </button>
                <button 
                  onClick={handleHome}
                  className="px-8 py-4 rounded-xl font-bold text-yellow-400 bg-slate-900 border-2 border-yellow-500 hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Select New Chapter
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}