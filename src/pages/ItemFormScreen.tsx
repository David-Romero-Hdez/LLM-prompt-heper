import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePromptActions } from "../services/promptActions";
import {
  getAllFolders,
  getPromptById,
  createPrompt, 
  updatePrompt, 
  createFolder, 
  updateFolder 
} from "../services/promptService";

export default function ItemFormScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCancel } = usePromptActions();

  // Get itemType and parentFolderId from location state
  const locationState = location.state as { 
    itemType?: "prompt" | "folder";
    parentFolderId?: string;
  } || {};
  
  const itemType = locationState.itemType || "prompt";
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(locationState.parentFolderId || null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  
  const isEditMode = Boolean(id);
  const folders = getAllFolders();

  useEffect(() => {
    if (isEditMode && id) {
      const existingPrompt = getPromptById(id);
      if (existingPrompt) {
        setTitle(existingPrompt.title);
        setText(existingPrompt.text);
        setCurrentFolderId(existingPrompt.parentId);
      }
    }
  }, [isEditMode, id]);

  function handleSave() {
    if (isEditMode && id) {
      if (itemType === "prompt") {
        updatePrompt(id, { 
          title, 
          text,
          folderId: currentFolderId || undefined
        });
      } else {
        updateFolder(id, { title });
      }
    } else {
      if (itemType === "prompt") {
        createPrompt({ 
          title, 
          text, 
          folderId: currentFolderId || undefined
        });
      } else {
        createFolder(title, currentFolderId || undefined);
      }
    }
    navigate(-1);
  }

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-bold mb-4">
        {isEditMode
          ? `Edit ${itemType === "prompt" ? "Prompt" : "Folder"}`
          : `Create New ${itemType === "prompt" ? "Prompt" : "Folder"}`}
      </h2>

      {/* Folder Location Dropdown */}
      <div className="mb-4">
        <label className="font-semibold mb-1 block">
          Folder Location
        </label>
        <select
          className="w-full border rounded p-2"
          value={currentFolderId || ""}
          onChange={(e) => setCurrentFolderId(e.target.value || null)}
        >
          <option value="">Root Level</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.title}
            </option>
          ))}
        </select>
      </div>

      {/* Title Input */}
      <label className="font-semibold mb-1">Title</label>
      <input
        className="border p-1 mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title here"
      />

      {/* For prompts, show a text area */}
      {itemType === "prompt" && (
        <>
          <label className="font-semibold mb-1">Prompt Text</label>
          <textarea
            className="border p-1 mb-4"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter prompt details here..."
          />
        </>
      )}

      {/* Footer with Cancel and Save buttons */}
      <div className="mt-auto flex justify-end space-x-2 border-t pt-2">
        <button onClick={handleCancel} className="bg-gray-300 px-4 py-1 rounded">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {isEditMode ? "Confirm Edit" : "Create"}
        </button>
      </div>
    </div>
  );
} 