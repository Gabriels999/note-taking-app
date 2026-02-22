"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyNotesScreen from "../../components/notes/empty-notes-screen";
import RegularNote from "../../components/notes/regular-note";
import type { NoteCategory, NoteItem } from "../../services/api-interfaces";
import { getCategories, getNotes } from "../../services/api";
import styles from "./home.module.css";

export default function HomePage() {
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [status, setStatus] = useState("");

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
            <button className={styles.newNote} type="button">
              <span aria-hidden="true">+</span> New Note
            </button>
          </div>

          {status ? <p className={styles.status}>{status}</p> : null}

          <div className={styles.notesGrid}>
            {filteredNotes.length === 0 ? (
              <EmptyNotesScreen />
            ) : (
              filteredNotes.map((note) => (
                <RegularNote
                  key={note.id}
                  category={note.category.name}
                  color={note.category.color}
                  content={note.content}
                  createdAt={note.created_at}
                  title={note.title}
                />
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
