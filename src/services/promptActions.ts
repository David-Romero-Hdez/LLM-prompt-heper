import { useNavigate } from "react-router-dom";
import { populatePrompt } from "./promptService";
import { getLLMServiceForUrl } from "../config/llmServices";

export function usePromptActions() {
  const navigate = useNavigate();

  const handleCreatePrompt = (parentFolderId?: string) => {
    navigate('/new', { 
      state: { 
        itemType: 'prompt',
        parentFolderId: parentFolderId 
      }
    });
  };

  const handleCreateFolder = (parentFolderId?: string) => {
    navigate('/new', {
      state: {
        itemType: 'folder',
        parentFolderId
      }
    });
  };

  const handleEdit = (promptId: string) => {
    navigate(`/edit/${promptId}`);
  };

  const handlePopulate = async (promptId: string) => {
    try {
      // Get current tab to check if we're on a supported LLM site
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url) {
        alert("Unable to determine current website");
        return;
      }

      const service = getLLMServiceForUrl(tab.url);
      if (!service) {
        alert(
          "Please navigate to a supported LLM website (ChatGPT or Google Gemini) to use this feature"
        );
        return;
      }

      const success = await populatePrompt(promptId);
      if (success) {
        // window.close();
      } else {
        alert(
          "Failed to populate prompt. Please make sure you are on the chat input page."
        );
      }
    } catch (error) {
      console.error("Error in handlePopulate:", error);
      alert("An error occurred while trying to populate the prompt");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleClose = () => {
    window.close();
  };

  return {
    handleCreatePrompt,
    handleCreateFolder,
    handleEdit,
    handlePopulate,
    handleCancel,
    handleClose,
  };
}
