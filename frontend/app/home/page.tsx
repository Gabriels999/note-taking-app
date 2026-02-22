"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyNotesScreen from "../../components/notes/empty-notes-screen";
import RegularNote from "../../components/notes/regular-note";
import type { NoteItem } from "../../services/api-interfaces";
import { getNotes } from "../../services/api";
import styles from "./home.module.css";

const DEFAULT_CATEGORIES = ["Random Thoughts", "School", "Personal"] as const;

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let isMounted = true;

    getNotes()
      .then((loadedNotes) => {
        if (isMounted) {
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
    const counts = DEFAULT_CATEGORIES.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {},
    );

    notes.forEach((note) => {
      counts[note.category.name] = (counts[note.category.name] ?? 0) + 1;
    });

    return counts;
  }, [notes]);

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <aside className={styles.sidebar}>
          <ul>
            <li className={styles.categoryActive}>All Categories</li>
            <li>
              <span
                aria-hidden="true"
                className={`${styles.dot} ${styles.dotThoughts}`}
              />
              Random Thoughts
              <span className={styles.categoryCount}>
                {categoryCounts["Random Thoughts"] ?? 0}
              </span>
            </li>
            <li>
              <span
                aria-hidden="true"
                className={`${styles.dot} ${styles.dotSchool}`}
              />
              School
              <span className={styles.categoryCount}>
                {categoryCounts.School ?? 0}
              </span>
            </li>
            <li>
              <span
                aria-hidden="true"
                className={`${styles.dot} ${styles.dotPersonal}`}
              />
              Personal
              <span className={styles.categoryCount}>
                {categoryCounts.Personal ?? 0}
              </span>
            </li>
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
            {notes.length === 0 ? (
              <EmptyNotesScreen />
            ) : (
              notes.map((note) => (
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
