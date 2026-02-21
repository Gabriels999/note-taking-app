import Image from "next/image";

import homeBackground from "../../assets/home_background.png";
import RegularNote from "../../components/notes/regular-note";

// const notes = [];
const categoryCounts = notes.reduce<Record<string, number>>((acc, note) => {
  acc[note.category] = (acc[note.category] ?? 0) + 1;
  return acc;
}, {});

export default function HomePage() {
  return (
    <main className="home-screen">
      <section className="home-shell">
        <aside className="home-sidebar">
          <ul>
            <li className="home-category-active">All Categories</li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-thoughts" />
              Random Thoughts
              <span className="home-category-count">
                {categoryCounts["Random Thoughts"] ?? 0}
              </span>
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-school" />
              School
              <span className="home-category-count">
                {categoryCounts.School ?? 0}
              </span>
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-personal" />
              Personal
              <span className="home-category-count">
                {categoryCounts.Personal ?? 0}
              </span>
            </li>
          </ul>
        </aside>

        <section className="home-content">
          <div className="home-topbar">
            <button className="home-new-note" type="button">
              <span aria-hidden="true">+</span> New Note
            </button>
          </div>

          <div className="home-notes-grid">
            {notes.length === 0 ? (
              <div className="home-state">
                <Image
                  alt="Cute boba tea waiting for notes"
                  className="home-image"
                  priority
                  src={homeBackground}
                />
                <p>I&apos;m just here waiting for your charming notes...</p>
              </div>
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
