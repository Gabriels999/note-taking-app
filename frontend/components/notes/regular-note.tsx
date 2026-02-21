interface RegularNoteProps {
  createdAt: string | Date;
  category: string;
  title: string;
  content: string;
}

function formatNoteDay(value: string | Date): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function RegularNote({
  createdAt,
  category,
  title,
  content,
}: RegularNoteProps) {
  const noteDate = formatNoteDay(createdAt);

  return (
    <article className="note-regular">
      <p className="note-regular-meta">
        <span className="note-regular-date">{noteDate}</span>
        <span>{category}</span>
      </p>

      <h2 className="note-regular-title">{title}</h2>
      <p className="note-regular-content">{content}</p>
    </article>
  );
}
