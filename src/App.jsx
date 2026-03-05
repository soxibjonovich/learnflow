import { useMemo, useState } from "react";
import { FileText, TrendingUp } from "lucide-react";
import { useCards, useStudyQueue, useTest } from "./hooks";
import { Header, ModeSelector, StatsBar } from "./components/layout";
import { StudyMode } from "./components/study";
import { CreateMode } from "./components/create";
import { TestMode } from "./components/test";

const DEFAULT_NEW_CARD = {
  front: "",
  back: "",
  example: "",
  translation: "",
  unit: "General",
  level: "Beginner",
};

export default function App() {
  const [mode, setMode] = useState("study");
  const [newCard, setNewCard] = useState(DEFAULT_NEW_CARD);

  const { cards, isLoading, error, addCard, rateCard, getStats } = useCards();

  const {
    studyQueue,
    currentCard,
    currentCardIndex,
    isFlipped,
    showHint,
    setIsFlipped,
    reshuffle,
    nextCard,
  } = useStudyQueue(cards);

  const {
    testCards,
    currentTestIndex,
    testAnswers,
    testComplete,
    testType,
    multipleChoiceOptions,
    selectedUnits,
    testWholeUnit,
    startTest,
    startUnitTest,
    answerQuestion,
    resetTest,
    toggleUnit,
  } = useTest(cards);

  const stats = useMemo(() => getStats(), [getStats]);

  const handleModeChange = (nextMode) => {
    if (nextMode === "test") {
      resetTest();
    }
    setMode(nextMode);
  };

  const handleAddCard = async (cardData) => {
    await addCard(cardData);
    setNewCard(DEFAULT_NEW_CARD);
    setMode("study");
  };

  const handleRateCard = (isCorrect) => {
    if (!currentCard) return;
    rateCard(currentCard.id, isCorrect);
    nextCard();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Header />

        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />

        <StatsBar
          stats={stats}
          progress={stats.progress}
          isLoadingFromDb={isLoading}
          dbError={error}
        />

        {mode === "study" && (
          <StudyMode
            studyQueue={studyQueue}
            currentCardIndex={currentCardIndex}
            isFlipped={isFlipped}
            showHint={showHint}
            onFlip={() => setIsFlipped((prev) => !prev)}
            onRate={handleRateCard}
            onReshuffle={reshuffle}
            onModeChange={handleModeChange}
          />
        )}

        {mode === "create" && (
          <CreateMode
            newCard={newCard}
            onCardChange={setNewCard}
            onAddCard={handleAddCard}
          />
        )}

        {mode === "test" && (
          <TestMode
            cards={cards}
            testCards={testCards}
            currentTestIndex={currentTestIndex}
            testAnswers={testAnswers}
            testComplete={testComplete}
            testType={testType}
            multipleChoiceOptions={multipleChoiceOptions}
            selectedUnits={selectedUnits}
            testWholeUnit={testWholeUnit}
            onToggleUnit={toggleUnit}
            onStartTest={startTest}
            onStartUnitTest={startUnitTest}
            onAnswerQuestion={answerQuestion}
            onResetTest={resetTest}
            onModeChange={handleModeChange}
          />
        )}

        {mode === "paraphrases" && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg slide-in">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Paraphrases</h2>
            </div>
            <p className="text-slate-600">
              This mode will be moved from `App_old.jsx` in the next split step.
            </p>
          </div>
        )}

        {mode === "manage" && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg slide-in">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Manage</h2>
            </div>
            <p className="text-slate-600">
              This mode will be moved from `App_old.jsx` in the next split step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
