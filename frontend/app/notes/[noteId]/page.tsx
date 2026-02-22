"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CategorySelector from "../../../components/categories/category-selector";
import type { NoteCategory } from "../../../services/api-interfaces";
import { getCategories, getNote, updateNote } from "../../../services/api";
import styles from "./note-editor.module.css";

interface NoteDraft {
  title: string;
  content: string;
  category_id: number;
}

function formatLastEdited(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(" AM", "am")
    .replace(" PM", "pm");
}

export default function NoteEditorPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const noteId = Number(params.noteId);

  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [editedAt, setEditedAt] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === draft?.category_id),
    [categories, draft?.category_id],
  );

  useEffect(() => {
    if (!draft || !Number.isFinite(noteId)) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const updatedNote = await updateNote(noteId, {
          title: draft.title,
          content: draft.content,
          category_id: draft.category_id,
        });
        setEditedAt(updatedNote.edited_at);
        setStatus("");
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Could not save note.",
        );
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [draft, noteId]);

  return (
    <main className={styles.screen}>
      <section className={styles.topbar}>
        <div className={styles.selectorWrap}>
          <CategorySelector
            isOpen={isCategoryOpen}
            onSelect={(categoryId) => {
              setDraft((current) =>
                current ? { ...current, category_id: categoryId } : current,
              );
              setIsCategoryOpen(false);
            }}
            onToggle={() => setIsCategoryOpen((current) => !current)}
            options={categories}
            selectedCategoryId={draft?.category_id ?? null}
          />
        </div>

        <button
          aria-label="Close editor"
          className={styles.closeButton}
          onClick={() => router.push("/home")}
          type="button"
        >
          ×
        </button>
      </section>

      <section
        className={styles.editor}
        style={{
          borderColor: selectedCategory?.color ?? "#ef9c66",
          backgroundColor: selectedCategory?.color
            ? `${selectedCategory.color}80`
            : "rgb(239 156 102 / 50%)",
        }}
      >
        <p className={styles.lastEdited}>
          Last Edited: {editedAt ? formatLastEdited(editedAt) : "--"}
        </p>

        {isLoading || !draft ? (
          <p className={styles.status}>Loading note...</p>
        ) : (
          <>
            <input
              className={styles.titleInput}
              onChange={(event) =>
                setDraft((current) =>
                  current ? { ...current, title: event.target.value } : current,
                )
              }
              placeholder="Note Title"
              value={draft.title}
            />
            <textarea
              className={styles.contentInput}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, content: event.target.value }
                    : current,
                )
              }
              placeholder="Pour your heart out..."
              value={draft.content}
            />
          </>
        )}

        {status ? <p className={styles.status}>{status}</p> : null}
      </section>
    </main>
  );
}
