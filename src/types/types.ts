export interface BaseItem {
  id: string;
  title: string;
  parentId: string | null;
}

export interface Prompt extends BaseItem {
  type: 'prompt';
  text: string;
  usageCount: number;
  lastUsed: string;
}

export interface Folder extends BaseItem {
  type: 'folder';
  children: string[];
}

export type Item = Prompt | Folder;

export interface NormalizedStore {
  byId: Record<string, Item>;
  // IDs that are at the root level (not nested inside any folder)
  rootIds: string[];
}

export type UIItem = Prompt | NestedFolder;

export interface NestedFolder extends Omit<Folder, 'children'> {
  children: UIItem[];
}