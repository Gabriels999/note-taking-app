import EmptyNotesScreen from "../../components/notes/empty-notes-screen";
import RegularNote from "../../components/notes/regular-note";
import styles from "./home.module.css";

const now = new Date();
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);

const notes = [
  {
    id: "n-1",
    createdAt: now,
    category: "Random Thoughts",
    color: "#EA9656",
    title: "Grocery List",
    content: "• Milk\n• Eggs\n• Bread\n• Bananas\n• Spinach",
  },
  {
    id: "n-2",
    createdAt: yesterday,
    category: "School",
    color: "#F0CB72",
    title: "Meeting with Team",
    content:
      "Discuss project timeline and milestones.\nReview budget and resource allocation.\nAddress any blockers and plan next steps.",
  },
  {
    id: "n-3",
    createdAt: "2026-07-16",
    category: "School",
    color: "#F0CB72",
    title: "Note Title",
    content: "Note content...",
  },
  {
    id: "n-4",
    createdAt: "2026-07-15",
    category: "Random Thoughts",
    color: "#EA9656",
    title: "Vacation Ideas",
    content:
      "• Visit Bali for beaches and culture\n• Explore the historic sites in Rome\n• Go hiking in the Swiss Alps\n• Relax in the hot springs of Iceland",
  },
  {
    id: "n-5",
    createdAt: "2026-06-12",
    category: "Personal",
    color: "#78ABA8",
    title: "Note Title",
    content:
      "Lately, I’ve been on a quest to discover new books to read. I’ve come across several recommendations that have piqued my interest.",
  },
  {
    id: "n-6",
    createdAt: "2026-06-11",
    category: "Random Thoughts",
    color: "#EA9656",
    title:
      "A Deep and Contemplative Personal Reflection on the Multifaceted and Ever-Evolving Journey of Life",
    content:
      "Life has been a whirlwind of events and emotions lately. I’ve been juggling work, personal goals, and moments of introspection.",
  },
  {
    id: "n-7",
    createdAt: "2026-06-10",
    category: "School",
    color: "#F0CB72",
    title: "Project X Updates",
    content:
      "Finalized design mockups and received approval from stakeholders. Began development on the front-end.",
  },
];

// const notes = [];
const categoryCounts = notes.reduce<Record<string, number>>((acc, note) => {
  acc[note.category] = (acc[note.category] ?? 0) + 1;
  return acc;
}, {});

export default function HomePage() {
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

          <div className={styles.notesGrid}>
            {notes.length === 0 ? (
              <EmptyNotesScreen />
            ) : (
              notes.map((note) => (
                <RegularNote
                  key={note.id}
                  category={note.category}
                  color={note.color}
                  content={note.content}
                  createdAt={note.createdAt}
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
