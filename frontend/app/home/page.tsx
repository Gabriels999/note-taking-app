"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyNotesScreen from "../../components/notes/empty-notes-screen";
import RegularNote from "../../components/notes/regular-note";
import type { NoteCategory, NoteItem } from "../../services/api-interfaces";
import { createNote, getCategories, getNotes } from "../../services/api";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [status, setStatus] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCategories(), getNotes()])
      .then(([loadedCategories, loadedNotes]) => {
        if (isMounted) {
          setCategories(loadedCategories);
          setNotes(loadedNotes);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus(
            error instanceof Error ? error.message : "Could not load notes.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = categories.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category.name] = 0;
        return acc;
      },
      {},
    );

    notes.forEach((note) => {
      counts[note.category.name] = (counts[note.category.name] ?? 0) + 1;
    });

    return counts;
  }, [categories, notes]);

  const totalNotes = useMemo(() => notes.length, [notes]);
  const filteredNotes = useMemo(() => {
    if (selectedCategoryId === null) {
      return notes;
    }

    return notes.filter((note) => note.category.id === selectedCategoryId);
  }, [notes, selectedCategoryId]);

  async function handleCreateNote() {
    setIsCreatingNote(true);
    const defaultCategory =
      categories.find((category) => category.name === "Random Thoughts") ??
      categories[0];

    if (!defaultCategory) {
      setStatus("Could not create note: category list is empty.");
      setIsCreatingNote(false);
      return;
    }

    setStatus("");

    try {
      const createdNote = await createNote({
        title: "",
        content: "",
        category_id: defaultCategory.id,
      });
      router.push(`/notes/${createdNote.id}`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not create note.",
      );
    } finally {
      setIsCreatingNote(false);
    }
  }

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <aside className={styles.sidebar}>
          <ul>
            <li
              className={
                selectedCategoryId === null ? styles.categoryActive : ""
              }
              onClick={() => setSelectedCategoryId(null)}
            >
              All Categories
              <span className={styles.categoryCount}>{totalNotes}</span>
            </li>
            {categories.map((category) => (
              <li
                key={category.id}
                className={
                  selectedCategoryId === category.id
                    ? styles.categoryActive
                    : ""
                }
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <span
                  aria-hidden="true"
                  className={styles.dot}
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <span className={styles.categoryCount}>
                  {categoryCounts[category.name] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.content}>
          <div className={styles.topbar}>
            <button
              className={styles.newNote}
              disabled={isCreatingNote}
              onClick={handleCreateNote}
              type="button"
            >
              <span aria-hidden="true">+</span> New Note
            </button>
          </div>

          {status ? <p className={styles.status}>{status}</p> : null}

          <div className={styles.notesGrid}>
            {filteredNotes.length === 0 ? (
              <EmptyNotesScreen />
            ) : (
              filteredNotes.map((note) => (
                <button
                  className={styles.noteCardButton}
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  type="button"
                >
                  <RegularNote
                    category={note.category.name}
                    color={note.category.color}
                    content={note.content}
                    createdAt={note.created_at}
                    title={note.title}
                  />
                </button>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
