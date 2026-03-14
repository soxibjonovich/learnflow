import React from "react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Plus,
  ClipboardCheck,
  FileText,
  TrendingUp,
} from "lucide-react";

/**
 * ModeSelector Component
 * Navigation tabs for switching between different app modes
 *
 * @param {Object} props
 * @param {string} props.currentMode - Currently active mode
 * @param {Function} props.onModeChange - Callback when mode changes
 */
export default function ModeSelector({ currentMode, onModeChange }) {
  const modes = [
    {
      id: "study",
      label: "Study",
      icon: Brain,
      description: "Review flashcards with spaced repetition",
    },
    {
      id: "create",
      label: "Create",
      icon: Plus,
      description: "Add new flashcards",
    },
    {
      id: "test",
      label: "Test",
      icon: ClipboardCheck,
      description: "Test your knowledge",
    },
    {
      id: "paraphrases",
      label: "Paraphrases",
      icon: FileText,
      description: "Practice paraphrasing",
    },
    {
      id: "manage",
      label: "Manage",
      icon: TrendingUp,
      description: "Edit and organize cards",
    },
  ];

  return (
    <div className="flex gap-2 mb-6 slide-in flex-wrap">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <Button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            variant={isActive ? "default" : "outline"}
            className="flex-1 font-medium min-w-[120px]"
            title={mode.description}
          >
            <Icon className="w-4 h-4 mr-2" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
}

// Default props
ModeSelector.defaultProps = {
  currentMode: "study",
  onModeChange: () => {},
};
