import React from "react";
import CardForm from "./CardForm";

/**
 * CreateMode Component
 * Container for creating new flashcards
 *
 * @param {Object} props
 * @param {Object} props.newCard - Current new card data
 * @param {Function} props.onCardChange - Callback when card data changes
 * @param {Function} props.onAddCard - Callback when adding card
 */
export default function CreateMode({ newCard, onCardChange, onAddCard }) {
  const handleSubmit = (card) => {
    onAddCard(card);
  };

  return (
    <div className="slide-in">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Create New Card
        </h2>

        <CardForm
          card={newCard}
          onChange={onCardChange}
          onSubmit={handleSubmit}
          submitLabel="Add Card"
        />
      </div>
    </div>
  );
}

// Default props
CreateMode.defaultProps = {
  newCard: {
    front: "",
    back: "",
    translation: "",
    example: "",
    unit: "General",
    level: "Beginner",
  },
  onCardChange: () => {},
  onAddCard: () => {},
};
