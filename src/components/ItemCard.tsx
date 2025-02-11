import { UIItem } from '../types/types';
import { FaFolder, FaFolderOpen, FaFile, FaTrash } from 'react-icons/fa';

interface ItemCardProps {
  item: UIItem;
  isSelected: boolean;
  expandedFolders: Set<string>;
  selectedItemId: string | null;
  onSelect: (id: string, type: string) => void;
  onDelete: (id: string) => void;
  onToggleFolder: (id: string) => void;
}

export default function ItemCard({
  item,
  isSelected,
  expandedFolders,
  selectedItemId,
  onSelect,
  onDelete,
  onToggleFolder,
}: ItemCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') onToggleFolder(item.id);  
    onSelect(item.id, item.type);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const isExpanded = item.type === 'folder' && expandedFolders.has(item.id);

  return (
    <div>
      <div
        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedItemId === item.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1">
          <span className="mr-2">
            {item.type === 'folder' ? (
              isExpanded ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-500" />
            ) : (
              <FaFile className="text-gray-500" />
            )}
          </span>
          <span>{item.title}</span>
        </div>
        
        {selectedItemId === item.id && (
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-gray-200 rounded"
              title="Delete"
            >
              <FaTrash className="text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Render children if it's an expanded folder */}
      {item.type === 'folder' && isExpanded && item.children && (
        <div className="ml-6">
          {item.children.map(child => (
            <ItemCard
              key={child.id}
              item={child}
              selectedItemId={selectedItemId}
              isSelected={isSelected}
              expandedFolders={expandedFolders}
              onSelect={onSelect}
              onDelete={onDelete}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
} 