export interface AuthCredentials {
  username: string;
  password: string;
}

export interface NoteCategory {
  id: number;
  name: string;
  color: string;
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
