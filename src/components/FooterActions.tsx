import { ButtonType } from './CustomButton';
import CustomButton from './CustomButton';

export interface ButtonConfig {
  text: string;
  type: ButtonType;
  onClick: () => void;
}

interface FooterActionsProps {
  buttons: ButtonConfig[];
}

export default function FooterActions({ buttons }: FooterActionsProps) {
  return (
    <div className="flex justify-end p-2 space-x-2 border-t">
      {buttons.map((button, index) => (
        <CustomButton
          key={index}
          text={button.text}
          type={button.type}
          onClick={button.onClick}
        />
      ))}
    </div>
  );
}
  