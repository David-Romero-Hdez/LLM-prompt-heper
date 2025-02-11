export type ButtonType = 'primary' | 'secondary' | 'success' | 'warning';

interface CustomButtonProps {
  text: string;
  type: ButtonType;
  onClick: () => void;
}

export default function CustomButton({ text, type, onClick }: CustomButtonProps) {
  const getButtonClass = () => {
    const baseClasses = 'px-4 py-1 rounded';
    switch (type) {
      case 'primary':
        return `${baseClasses} bg-blue-500 text-white`;
      case 'secondary':
        return `${baseClasses} bg-gray-300`;
      case 'success':
        return `${baseClasses} bg-green-500 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white`;
    }
  };

  return (
    <button 
      className={getButtonClass()}
      onClick={onClick}
    >
      {text}
    </button>
  );
} 