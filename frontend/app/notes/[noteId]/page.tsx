"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NoteEditor, {
  type NoteEditorDraft,
} from "../../../components/notes/note-editor";
import type { NoteCategory } from "../../../services/api-interfaces";
import { getCategories, getNote, updateNote } from "../../../services/api";

export default function NoteEditorPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const noteId = Number(params.noteId);

  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [draft, setDraft] = useState<NoteEditorDraft | null>(null);
  const [editedAt, setEditedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const hasHydratedDraft = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(noteId)) {
      setStatus("Invalid note ID.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    Promise.all([getCategories(), getNote(noteId)])
      .then(([loadedCategories, loadedNote]) => {
        if (!isMounted) {
          return;
        }
        setCategories(loadedCategories);
        setDraft({
          title: loadedNote.title,
          content: loadedNote.content,
          category_id: loadedNote.category.id,
        });
        hasHydratedDraft.current = false;
        setEditedAt(loadedNote.edited_at);
      })
      .catch((error) => {
        if (isMounted) {
          setStatus(
            error instanceof Error ? error.message : "Could not load note.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [noteId]);

  useEffect(() => {
    if (!draft || !Number.isFinite(noteId)) {
      return;
    }

    if (!hasHydratedDraft.current) {
      hasHydratedDraft.current = true;
      return;
    }

    let isActive = true;
    const timeout = setTimeout(async () => {
      try {
        const updatedNote = await updateNote(noteId, {
          title: draft.title,
          content: draft.content,
          category_id: draft.category_id,
        });
        if (!isActive) {
          return;
        }
        setEditedAt(updatedNote.edited_at);
        setStatus("");
      } catch (error) {
        if (!isActive) {
          return;
        }
        setStatus(
          error instanceof Error ? error.message : "Could not save note.",
        );
      }
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [draft, noteId]);

  return (
    <NoteEditor
      categories={categories}
      draft={draft}
      editedAt={editedAt}
      isLoading={isLoading}
      onClose={() => router.push("/home")}
      onDraftChange={setDraft}
      status={status}
    />
  );
}
