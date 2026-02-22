"use client";

import { useMemo, useState } from "react";
import CategorySelector from "../categories/category-selector";
import type { NoteCategory } from "../../services/api-interfaces";
import styles from "./note-editor.module.css";

export interface NoteEditorDraft {
  title: string;
  content: string;
  category_id: number;
}

interface NoteEditorProps {
  categories: NoteCategory[];
  draft: NoteEditorDraft | null;
  editedAt: string;
  isLoading: boolean;
  status: string;
  onClose: () => void;
  onDraftChange: (next: NoteEditorDraft) => void;
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

export default function NoteEditor({
  categories,
  draft,
  editedAt,
  isLoading,
  status,
  onClose,
  onDraftChange,
}: NoteEditorProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === draft?.category_id),
    [categories, draft?.category_id],
  );

  return (
    <main className={styles.screen}>
      <section className={styles.topbar}>
        <div className={styles.selectorWrap}>
          <CategorySelector
            isOpen={isCategoryOpen}
            onSelect={(categoryId) => {
              if (draft) {
                onDraftChange({ ...draft, category_id: categoryId });
              }
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
          onClick={onClose}
          type="button"
        >
          <span className={styles.srOnly}>Close</span>
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
                onDraftChange({ ...draft, title: event.target.value })
              }
              placeholder="Note Title"
              value={draft.title}
            />
            <textarea
              className={styles.contentInput}
              onChange={(event) =>
                onDraftChange({ ...draft, content: event.target.value })
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
