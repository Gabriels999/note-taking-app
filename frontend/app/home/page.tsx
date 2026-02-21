import Image from "next/image";

import homeBackground from "../../assets/home_background.png";

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
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-school" />
              School
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-personal" />
              Personal
            </li>
          </ul>
        </aside>

        <section className="home-content">
          <div className="home-topbar">
            <button className="home-new-note" type="button">
              <span aria-hidden="true">+</span> New Note
            </button>
          </div>

          <div className="home-state">
            <Image
              alt="Cute boba tea waiting for notes"
              className="home-image"
              priority
              src={homeBackground}
            />
            <p>I&apos;m just here waiting for your charming notes...</p>
          </div>
        </section>
      </section>
    </main>
  );
}
