import { useMemo, useState } from "react";
import { Header, ModeSelector, StatsBar } from "./components/layout";
import { ManageMode } from "./components/manage";
import { ParaphrasesMode } from "./components/paraphrases";
import { SynonymsMode } from "./components/synonyms";
import { StudyMode } from "./components/study";
import { TestMode } from "./components/test";
import { useCards, useParaphrases, useStudyQueue, useTest, useSynonyms } from "./hooks";

export default function App() {
  const [mode, setMode] = useState("study");
  const [isReverseMode, setIsReverseMode] = useState(false);

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
    goToNextCard,
    goToPreviousCard,
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
    startReviewTest,
    answerQuestion,
    resetTest,
    toggleUnit,
    setTestLimit,
  } = useTest(cards, paraphrases);

  const stats = useMemo(() => getStats(), [getStats]);

  const { synonyms, addSynonym, updateSynonym, deleteSynonym } = useSynonyms();

  const handleModeChange = (nextMode) => {
    if (nextMode === "test") resetTest();
    setMode(nextMode);
  };

  const handleRateCard = (quality) => {
    if (!currentCard) return;
    rateCard(currentCard.id, quality);
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
            isReverseMode={isReverseMode}
            showHint={showHint}
            onFlip={() => setIsFlipped((prev) => !prev)}
            onRate={handleRateCard}
            onReshuffle={reshuffle}
            onNextCard={goToNextCard}
            onPreviousCard={goToPreviousCard}
            onToggleReverseMode={() => setIsReverseMode((prev) => !prev)}
            onModeChange={handleModeChange}
          />
        )}

        {mode === "test" && (
          <TestMode
            cards={cards}
            reviewCards={studyQueue}
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
            onStartReviewTest={startReviewTest}
            onAnswerQuestion={answerQuestion}
            onResetTest={resetTest}
            onModeChange={handleModeChange}
            onTestLimitChange={setTestLimit}
            onRateCards={rateCard}
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

        {mode === "synonyms" && (
          <SynonymsMode
            synonyms={synonyms}
            onAdd={addSynonym}
            onUpdate={updateSynonym}
            onDelete={deleteSynonym}
          />
        )}

        {mode === "manage" && (
          <ManageMode
            cards={cards}
            onAddCard={addCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onResetProgress={resetProgress}
            onBulkAddCards={bulkAddCards}
          />
        )}
      </div>
    </div>
  );
}
