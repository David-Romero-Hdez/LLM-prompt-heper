import { Prompt } from "../types/types";

  interface PromptCardProps {
    prompt: Prompt;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
  }
  
  export default function PromptCard({ prompt, isSelected, onSelect, onDelete }: PromptCardProps) {
    const { id, title, text, lastUsed } = prompt;

    function handleCardClick() {
      onSelect(id);
    }

    function handleDeleteClick(e: React.MouseEvent) {
      e.stopPropagation(); 
      onDelete(id); 
    }
  
    return (
      <div
        className={`relative mb-2 p-2 border rounded cursor-pointer transition-all
          ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onClick={handleCardClick}
      >
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{text.slice(0, 30)}...</p>
        <p className="text-xs text-gray-400">Last used: {lastUsed}</p>
  
        {isSelected && (
          <button
            onClick={handleDeleteClick}
            className="absolute right-2 top-2 bg-red-600 text-white px-3 py-1 text-xs rounded"
          >
            Delete
          </button>
        )}
      </div>
    );
  }
  