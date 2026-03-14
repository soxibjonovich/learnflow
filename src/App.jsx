import { useMemo, useState } from "react";
import { CreateMode } from "./components/create";
import { Header, ModeSelector, StatsBar } from "./components/layout";
import { ManageMode } from "./components/manage";
import { ParaphrasesMode } from "./components/paraphrases";
import { StudyMode } from "./components/study";
import { TestMode } from "./components/test";
import { useCards, useParaphrases, useStudyQueue, useTest } from "./hooks";

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

  const {
    cards,
    isLoading,
    error,
    addCard,
    updateCard,
    deleteCard,
    bulkAddCards,
    rateCard,
    resetProgress,
    getStats,
  } = useCards();

  const {
    paraphrases,
    isLoading: isLoadingParaphrases,
    error: paraphraseError,
    addParaphrase,
    updateParaphrase,
    deleteParaphrase,
  } = useParaphrases();

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
    testCategory,
    testLimit,
    multipleChoiceOptions,
    selectedUnits,
    testWholeUnit,
    startTest,
    startUnitTest,
    answerQuestion,
    resetTest,
    toggleUnit,
    setTestLimit,
  } = useTest(cards, paraphrases);

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
          isLoadingFromDb={isLoading || isLoadingParaphrases}
          dbError={error || paraphraseError}
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
            paraphrases={paraphrases}
            testCards={testCards}
            currentTestIndex={currentTestIndex}
            testAnswers={testAnswers}
            testComplete={testComplete}
            testType={testType}
            testCategory={testCategory}
            testLimit={testLimit}
            multipleChoiceOptions={multipleChoiceOptions}
            selectedUnits={selectedUnits}
            testWholeUnit={testWholeUnit}
            onToggleUnit={toggleUnit}
            onStartTest={startTest}
            onStartUnitTest={startUnitTest}
            onAnswerQuestion={answerQuestion}
            onResetTest={resetTest}
            onModeChange={handleModeChange}
            onTestLimitChange={setTestLimit}
          />
        )}

        {mode === "paraphrases" && (
          <ParaphrasesMode
            paraphrases={paraphrases}
            isLoading={isLoadingParaphrases}
            error={paraphraseError}
            onAddParaphrase={addParaphrase}
            onUpdateParaphrase={updateParaphrase}
            onDeleteParaphrase={deleteParaphrase}
          />
        )}

        {mode === "manage" && (
          <ManageMode
            cards={cards}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onResetProgress={resetProgress}
            onBulkAddCards={bulkAddCards}
            onSwitchToCreate={() => handleModeChange("create")}
          />
        )}
      </div>
    </div>
  );
}
