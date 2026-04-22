import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, ClipboardCheck, FileText, Settings, Layers } from "lucide-react";

export default function ModeSelector({ currentMode, onModeChange }) {
  const modes = [
    { id: "study",       label: "Study",       icon: Brain,          description: "Review flashcards with spaced repetition" },
    { id: "test",        label: "Test",         icon: ClipboardCheck, description: "Test your knowledge" },
    { id: "paraphrases", label: "Paraphrases",  icon: FileText,       description: "Practice paraphrasing" },
    { id: "manage",      label: "Manage",       icon: Settings,       description: "Edit and organise cards" },
    { id: "synonyms",    label: "Synonyms",     icon: Layers,         description: "A → B → C synonym progressions" },
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
            className="flex-1 font-medium min-w-[110px]"
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

ModeSelector.defaultProps = {
  currentMode: "study",
  onModeChange: () => {},
};
