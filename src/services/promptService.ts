// src/services/promptService.ts
import { v4 as uuidv4 } from "uuid";
import { Prompt, Folder, UIItem, NormalizedStore, NestedFolder } from "../types/types";
import { getLLMServiceForUrl } from "../config/llmServices";

// Import store key from config
import { STORE_KEY } from '../config/constants';

// Initialize store if it doesn't exist
async function initializeStore() {
  const result = await chrome.storage.local.get(STORE_KEY);
  if (!result[STORE_KEY]) {
    const initialStore: NormalizedStore = {
      byId: {},
      rootIds: []
    };
    await chrome.storage.local.set({ [STORE_KEY]: initialStore });
    return initialStore;
  }
  return result[STORE_KEY] as NormalizedStore;
}

// Helper to get store
async function getStore(): Promise<NormalizedStore> {
  const store = await initializeStore();
  return store;
}

// Helper to save store
async function saveStore(store: NormalizedStore): Promise<void> {
  await chrome.storage.local.set({ [STORE_KEY]: store });
}

/* Build a nested tree from the normalized data.
   This function is used to display the hierarchy in the UI. */
export async function getAllItems(): Promise<UIItem[]> {
  const store = await getStore();
  
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
export async function getAllPrompts(): Promise<Prompt[]> {
  const store = await getStore();
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
export async function getPromptById(id: string): Promise<Prompt | undefined> {
  const store = await getStore();
  const item = store.byId[id];
  if (item && item.type === "prompt") {
    return item;
  }
  return undefined;
}

/* Create a new prompt.
   If a parent folder ID is provided, add the prompt as a child; otherwise, add it to the root. */
export async function createPrompt({ title, text, folderId }: { title: string; text: string; folderId?: string; }): Promise<Prompt> {
  const store = await getStore();
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
  
  await saveStore(store);
  return newPrompt;
}

/* Create a new folder.
   If a parent folder ID is provided, add the folder as a child; otherwise, add it to the root. */
export async function createFolder(title: string, parentFolderId?: string): Promise<Folder> {
  const store = await getStore();
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
  
  await saveStore(store);
  return newFolder;
}

/* Get all folders for dropdown selection */
export async function getAllFolders(): Promise<Folder[]> {
  const store = await getStore();
  return Object.values(store.byId).filter(
    (item): item is Folder => item.type === "folder"
  );
}

/* Get parent folder ID for an item */
export async function getParentFolderId(id: string): Promise<string | null> {
  const store = await getStore();
  const item = store.byId[id];
  return item?.parentId || null;
}

/* Update an existing prompt with new folder location */
export async function updatePrompt(
  id: string, 
  updates: { 
    title?: string; 
    text?: string; 
    usageCount?: number; 
    lastUsed?: string;
    folderId?: string | null;
  }
): Promise<void> {
  const store = await getStore();
  const item = store.byId[id];
  if (!item || item.type !== "prompt") return;

  // Handle folder change if specified
  if (updates.folderId !== undefined && updates.folderId !== item.parentId) {
    if (item.parentId) {
      const oldParent = store.byId[item.parentId] as Folder;
      oldParent.children = oldParent.children.filter(childId => childId !== id);
    } else {
      store.rootIds = store.rootIds.filter(rootId => rootId !== id);
    }

    if (updates.folderId) {
      const newParent = store.byId[updates.folderId] as Folder;
      newParent.children.push(id);
    } else {
      store.rootIds.push(id);
    }
  }

  store.byId[id] = {
    ...item,
    ...updates,
    parentId: updates.folderId ?? item.parentId
  };

  await saveStore(store);
}

/* Update a folder's title. */
export async function updateFolder(id: string, updates: { title?: string; }): Promise<void> {
  const store = await getStore();
  const item = store.byId[id];
  if (item && item.type === "folder") {
    const updatedFolder: Folder = {
      ...item,
      title: updates.title || item.title,
    };
    store.byId[id] = updatedFolder;
    await saveStore(store);
  }
}

/* Remove an item (prompt or folder) by ID.
   For folders, this recursively removes all nested children. */
export async function removeItemById(id: string): Promise<void> {
  const store = await getStore();
  const item = store.byId[id];
  if (!item) return;
  
  if (item.type === "folder") {
    for (const childId of item.children) {
      await removeItemById(childId);
    }
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
  
  await saveStore(store);
}

/* Populate a prompt by sending its text to the content script.
   If successful, update its usageCount and lastUsed timestamp. */
export async function populatePrompt(promptId: string): Promise<boolean> {
  const prompt = await getPromptById(promptId);
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
      await updatePrompt(promptId, { usageCount: prompt.usageCount + 1 });
    }
    return success;
  } catch (error) {
    console.error("Error populating prompt:", error);
    return false;
  }
}
