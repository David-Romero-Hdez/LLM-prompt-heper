import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import PromptList from "../components/PromptList";
import FooterActions from "../components/FooterActions";
import { getAllPrompts, removeItemById } from "../services/promptService";
import { Prompt } from "../types/types";
import { ButtonType } from "../components/CustomButton";
import { usePromptActions } from '../services/promptActions';

export default function MainScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const { handleCreatePrompt, handleEdit, handlePopulate, handleClose } = usePromptActions();

  // Load prompts when component mounts
  useEffect(() => {
    const loadPrompts = async () => {
      const loadedPrompts = await getAllPrompts();
      setPrompts(loadedPrompts.sort((a, b) => b.usageCount - a.usageCount));
    };
    loadPrompts();
  }, []);

  // Filter or slice the prompts for search results vs. frequently used
  const displayedPrompts = searchTerm
    ? prompts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3)
    : prompts.slice(0, 3);

  function handleSelectPrompt(promptId: string) {
    setSelectedPromptId(prev => (prev === promptId ? null : promptId));
  }

  async function handleDeletePrompt(id: string) {
    await removeItemById(id);
    const updatedPrompts = await getAllPrompts();
    setPrompts(updatedPrompts.sort((a, b) => b.usageCount - a.usageCount));
  }

  const getFooterButtons = () => {
    if (!selectedPromptId) {
      return [
        {
          text: 'Close',
          type: 'secondary' as ButtonType,
          onClick: handleClose
        },
        {
          text: 'New Prompt',
          type: 'primary' as ButtonType,
          onClick: () => handleCreatePrompt()
        }
      ];
    }

    return [
      {
        text: 'Edit',
        type: 'warning' as ButtonType,
        onClick: () => handleEdit(selectedPromptId)
      },
      {
        text: 'Populate',
        type: 'success' as ButtonType,
        onClick: () => handlePopulate(selectedPromptId)
      }
    ];
  };

  return (
    <>
    <div className="flex flex-col h-full">
      {/* Nav */}
      <NavBar />

      {/* Search */}
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Prompt List */}
      <PromptList 
        prompts={displayedPrompts}
        selectedPromptId={selectedPromptId}
        onSelectPrompt={handleSelectPrompt}
        onDeletePrompt={handleDeletePrompt}  
      />

      {/* Footer */}
      <FooterActions buttons={getFooterButtons()} />
    </div>
    </>
  ); 
}
