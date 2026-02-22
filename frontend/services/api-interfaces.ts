export interface AuthCredentials {
  username: string;
  password: string;
}

export interface NoteCategory {
  id: number;
  name: string;
  color: string;
  is_default?: boolean;
  owner_id?: number | null;
}

export interface NoteItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  edited_at: string;
  category: NoteCategory;
  user_id: number;
}

export interface NotesCollectionResponse {
  notes: NoteItem[];
}

export interface CategoriesCollectionResponse {
  categories: NoteCategory[];
}

export interface CreateNotePayload {
  title: string;
  content: string;
  category_id: number;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  category_id?: number;
}
