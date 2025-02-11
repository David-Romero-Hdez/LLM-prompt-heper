import PromptCard from "../components/PromptCard";
import { Prompt } from "../types/types";
interface PromptListProps {
  prompts: Prompt[];
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
}

export default function PromptList({ prompts, selectedPromptId, onSelectPrompt, onDeletePrompt }: PromptListProps) {
  if (prompts.length === 0) {
    return <div className="p-4 text-gray-500">You don't have any prompts yet, click create new prompt to get started!</div>;
  }

  return (
    <div className="p-2">
      {prompts.map(prompt => (
        <PromptCard 
          key={prompt.id}
          prompt={prompt}
          isSelected={prompt.id === selectedPromptId}
          onSelect={onSelectPrompt}
          onDelete={onDeletePrompt}  
        />
      ))}
    </div>
  );
}
