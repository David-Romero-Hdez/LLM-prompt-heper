
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="flex items-center p-2">
      <input 
        type="text"
        className="border rounded px-2 py-1 w-full"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search prompts..."
      />
    </div>
  );
}
