// src/services/promptService.ts
import { v4 as uuidv4 } from "uuid";
import { Prompt, Folder, UIItem, NormalizedStore, NestedFolder } from "../types/types";
import { getLLMServiceForUrl } from "../config/llmServices";
// Our initial normalized data (using your sample store)
const store: NormalizedStore = {
  byId: {
    "1": { id: "1", type: "folder", title: "Work", children: ["2", "3", "4"], parentId: null },
    "2": {
      id: "2",
      type: "prompt",
      title: "Daily Standup",
      text: "What did you do yesterday?",
      lastUsed: "2024-01-01",
      usageCount: 15,
      parentId: "1",
    },
    "3": {
      id: "3",
      type: "prompt",
      title: "Code Review",
      text: "Please review this code...",
      lastUsed: "2024-01-02",
      usageCount: 25,
      parentId: "1",
    },
    "4": {
      id: "4",
      type: "prompt",
      title: "Bug Report",
      text: "Describe the bug and steps to reproduce...",
      lastUsed: "2024-01-03",
      usageCount: 10,
      parentId: "1",
    },
    "5": { id: "5", type: "folder", title: "Personal", children: ["6", "7", "8"], parentId: null },
    "6": {
      id: "6",
      type: "prompt",
      title: "Journal Entry",
      text: "Today I...",
      lastUsed: "2024-01-01",
      usageCount: 30,
      parentId: "5",
    },
    "7": {
      id: "7",
      type: "prompt",
      title: "Workout Plan",
      text: "Create a workout plan...",
      lastUsed: "2024-01-02",
      usageCount: 8,
      parentId: "5",
    },
    "8": {
      id: "8",
      type: "prompt",
      title: "Shopping List",
      text: "Items to buy...",
      lastUsed: "2024-01-03",
      usageCount: 12,
      parentId: "5",
    },
    "9": { id: "9", type: "folder", title: "School", children: ["10", "11", "12", "13"], parentId: null },
    "10": {
      id: "10",
      type: "prompt",
      title: "Essay Outline",
      text: "Create an outline for...",
      lastUsed: "2024-01-01",
      usageCount: 20,
      parentId: "9",
    },
    "11": {
      id: "11",
      type: "prompt",
      title: "Study Notes",
      text: "Key points from lecture...",
      lastUsed: "2024-01-02",
      usageCount: 18,
      parentId: "9",
    },
    "12": {
      id: "12",
      type: "prompt",
      title: "Research Questions",
      text: "Questions to explore...",
      lastUsed: "2024-01-03",
      usageCount: 22,
      parentId: "9",
    },
    "13": {
      id: "13",
      type: "prompt",
      title: "Bibliography Format",
      text: "Format citations...",
      lastUsed: "2024-01-04",
      usageCount: 5,
      parentId: "9",
    },
  },
  rootIds: ["1", "5", "9"],
};

/* Build a nested tree from the normalized data.
   This function is used to display the hierarchy in the UI. */
export function getAllItems(): UIItem[] {
  const buildItem = (id: string): UIItem => {
    const item = store.byId[id];
    if (item.type === "folder") {
      const folderWithItems: NestedFolder = {
        ...item,
        children: item.children.map(childId => buildItem(childId))
      };
      return folderWithItems;
    }
    return item;
  };
  return store.rootIds.map(id => buildItem(id));
}

/* Get a flattened array of all prompts */
export function getAllPrompts(): Prompt[] {
  const prompts: Prompt[] = [];

  const traverse = (id: string) => {
    const item = store.byId[id];
    if (!item) return;
    if (item.type === "prompt") {
      prompts.push(item);
    } else {
      item.children.forEach(childId => traverse(childId));
    }
  };
  store.rootIds.forEach(id => traverse(id));
  return prompts;
}

/* Get a specific prompt by its ID */
export function getPromptById(id: string): Prompt | undefined {
  const item = store.byId[id];
  if (item && item.type === "prompt") {
    return item;
  }
  return undefined;
}

/* Create a new prompt.
   If a parent folder ID is provided, add the prompt as a child; otherwise, add it to the root. */
export function createPrompt({ title, text, folderId }: { title: string; text: string; folderId?: string; }): Prompt {
  const newId = uuidv4();
  const newPrompt: Prompt = {
    id: newId,
    type: "prompt",
    title,
    text,
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    parentId: folderId || null,
  };
  store.byId[newId] = newPrompt;
  if (folderId && store.byId[folderId] && store.byId[folderId].type === "folder") {
    (store.byId[folderId] as Folder).children.push(newId);
  } else {
    store.rootIds.push(newId);
  }
  return newPrompt;
}

/* Create a new folder.
   If a parent folder ID is provided, add the folder as a child; otherwise, add it to the root. */
export function createFolder(title: string, parentFolderId?: string): Folder {
  const newId = uuidv4();
  const newFolder: Folder = {
    id: newId,
    type: "folder",
    title,
    children: [],
    parentId: parentFolderId || null,
  };
  store.byId[newId] = newFolder;
  if (parentFolderId && store.byId[parentFolderId] && store.byId[parentFolderId].type === "folder") {
    (store.byId[parentFolderId] as Folder).children.push(newId);
  } else {
    store.rootIds.push(newId);
  }
  return newFolder;
}

/* Get all folders for dropdown selection */
export function getAllFolders(): Folder[] {
  return Object.values(store.byId).filter(
    (item): item is Folder => item.type === "folder"
  );
}

/* Get parent folder ID for an item */
export function getParentFolderId(id: string): string | null {
  const item = store.byId[id];
  return item?.parentId || null;
}

/* Update an existing prompt with new folder location */
export function updatePrompt(
  id: string, 
  updates: { 
    title?: string; 
    text?: string; 
    usageCount?: number; 
    lastUsed?: string;
    folderId?: string | null;
  }
): void {
  const item = store.byId[id];
  if (!item || item.type !== "prompt") return;

  // Handle folder change if specified
  if (updates.folderId !== undefined && updates.folderId !== item.parentId) {
    // Remove from old parent's children if exists
    if (item.parentId) {
      const oldParent = store.byId[item.parentId] as Folder;
      oldParent.children = oldParent.children.filter(childId => childId !== id);
    } else {
      store.rootIds = store.rootIds.filter(rootId => rootId !== id);
    }

    // Add to new parent's children or root
    if (updates.folderId) {
      const newParent = store.byId[updates.folderId] as Folder;
      newParent.children.push(id);
    } else {
      store.rootIds.push(id);
    }
  }

  // Update the prompt
  store.byId[id] = {
    ...item,
    ...updates,
    parentId: updates.folderId ?? item.parentId
  };
}

/* Update a folder's title. */
export function updateFolder(id: string, updates: { title?: string; }): void {
  const item = store.byId[id];
  if (item && item.type === "folder") {
    const updatedFolder: Folder = {
      ...item,
      title: updates.title || item.title,
    };
    store.byId[id] = updatedFolder;
  }
}

/* Remove an item (prompt or folder) by ID.
   For folders, this recursively removes all nested children. */
export function removeItemById(id: string): void {
  const item = store.byId[id];
  if (!item) return;
  if (item.type === "folder") {
    item.children.forEach(childId => removeItemById(childId));
  }
  // Remove this ID from any folder's children arrays
  Object.values(store.byId).forEach(i => {
    if (i.type === "folder") {
      (i as Folder).children = (i as Folder).children.filter(childId => childId !== id);
    }
  });
  // Remove from root if necessary
  store.rootIds = store.rootIds.filter(rootId => rootId !== id);
  delete store.byId[id];
}

/* Populate a prompt by sending its text to the content script.
   If successful, update its usageCount and lastUsed timestamp. */
export async function populatePrompt(promptId: string): Promise<boolean> {
  const prompt = getPromptById(promptId);
  if (!prompt) return false;
  console.log("Populating prompt", prompt);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id || !tab.url) return false;
    const service = getLLMServiceForUrl(tab.url);
    if (!service) {
      console.error("Not on a supported LLM website");
      return false;
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [prompt.text, service.selector],
      func: (promptText: string, selector: string) => {
        const textarea = document.getElementById(selector);
        if (textarea && textarea.children.length > 0) {
          textarea.children[0].textContent = promptText;
          return true;
        }
        return false;
      },
    });
    const success = Boolean(results?.[0]?.result);
    if (success) {
      updatePrompt(promptId, { usageCount: prompt.usageCount + 1 });
    }
    return success;
  } catch (error) {
    console.error("Error populating prompt:", error);
    return false;
  }
}
