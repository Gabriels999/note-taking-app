import Image from "next/image";

import homeBackground from "../../assets/home_background.png";
import styles from "./empty-notes-screen.module.css";

export default function EmptyNotesScreen() {
  return (
    <div className={styles.container}>
      <Image
        alt="Cute boba tea waiting for notes"
        className={styles.image}
        priority
        src={homeBackground}
      />
      <p className={styles.message}>
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
