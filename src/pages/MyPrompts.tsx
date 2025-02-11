import { useState } from 'react';
import { NestedFolder, UIItem } from '../types/types';
import ItemCard from '../components/ItemCard';
import FooterActions from '../components/FooterActions';
import NavBar from '../components/NavBar';
import { ButtonType } from '../components/CustomButton';
import { getAllItems } from '../services/promptService';
import SearchBar from '../components/SearchBar';
import { usePromptActions } from '../services/promptActions';
import { removeItemById } from '../services/promptService';

export default function MyPrompts() {
  const [items, setItems] = useState<UIItem[]>(getAllItems());

  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const { handleCreatePrompt, handleCreateFolder, handleEdit, handlePopulate } = usePromptActions();

  const handleSelect = (id: string, type: string) => {
    setSelectedItem(prev => (prev?.id === id ? null : { id, type }));
  };

  const handleToggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = (id: string) => {
    // Implement recursive delete logic
    removeItemById(id);
    setItems(getAllItems());
    //reset selected item
    setSelectedItem(null);
  };

  const getFooterButtons = () => {
    const selectedFolderId = selectedItem?.type === 'folder' ? selectedItem.id : undefined;

    const defaultButtons = [
      {
        text: 'Create New Folder',
        type: 'secondary' as ButtonType,
        onClick: () => handleCreateFolder(selectedFolderId)
      },
      {
        text: 'Create New Prompt',
        type: 'primary' as ButtonType,
        onClick: () => handleCreatePrompt(selectedFolderId)
      }
    ];

    if (!selectedItem || selectedItem.type === 'folder') {
      return defaultButtons;
    }

    return [
      {
        text: 'Edit Prompt',
        type: 'warning' as ButtonType,
        onClick: () => handleEdit(selectedItem.id)
      },
      {
        text: 'Populate Prompt',
        type: 'success' as ButtonType,
        onClick: () => handlePopulate(selectedItem.id)
      }
    ];
  };

  // Add this helper function to filter and extract matching items
  const getFilteredItems = (items: UIItem[], searchTerm: string): UIItem[] => {
    const matchingPrompts: UIItem[] = [];
    const filteredFolders: NestedFolder[] = [];

    items.forEach(item => {
      if (item.type === 'prompt') {
        if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchingPrompts.push(item);
        }
      } else {
        // For folders
        const folderCopy = { ...item };
        
        // First check all prompts in this folder
        const matchingChildren = folderCopy.children.filter(child => 
          child.type === 'prompt' && child.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingChildren.length > 0) {
          matchingPrompts.push(...matchingChildren);
        }

        // Then check if folder itself matches
        if (folderCopy.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          filteredFolders.push(folderCopy);
        }
      }
    });

    return [...matchingPrompts, ...filteredFolders];
  };

  // Update the search change handler
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setExpandedFolders(new Set()); // Reset expanded folders
  };

  return (
    <div className="flex flex-col h-full">
      <NavBar />
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <div className="flex-1 p-4">
        {(searchTerm ? getFilteredItems(items, searchTerm) : items).map(item => (
          <ItemCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedItem?.id}
            expandedFolders={expandedFolders}
            selectedItemId={selectedItem?.id || null}
            onSelect={(id, type) => handleSelect(id, type)}
            onDelete={handleDelete}
            onToggleFolder={handleToggleFolder}
          />
        ))}
      </div>

      <FooterActions buttons={getFooterButtons()} />
    </div>
  );
}