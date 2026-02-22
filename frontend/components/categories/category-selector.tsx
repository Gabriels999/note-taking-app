import styles from "./category-selector.module.css";

export interface CategorySelectorOption {
  id: number;
  name: string;
  color: string;
}

interface CategorySelectorProps {
  options: CategorySelectorOption[];
  selectedCategoryId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (categoryId: number) => void;
}

export default function CategorySelector({
  options,
  selectedCategoryId,
  isOpen,
  onToggle,
  onSelect,
}: CategorySelectorProps) {
  const selectedOption = options.find(
    (option) => option.id === selectedCategoryId,
  );

  return (
    <div className={styles.container}>
      <button
        aria-expanded={isOpen}
        className={styles.trigger}
        onClick={onToggle}
        type="button"
      >
        <span
          aria-hidden="true"
          className={styles.dot}
          style={{ backgroundColor: selectedOption?.color ?? "#f09a58" }}
        />
        <span className={styles.triggerLabel}>
          {selectedOption?.name ?? "Select a category"}
        </span>
        <span
          aria-hidden="true"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {isOpen ? (
        <ul className={styles.options} role="listbox">
          {options.map((option) => (
            <li key={option.id}>
              <button
                className={styles.optionButton}
                onClick={() => onSelect(option.id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={styles.dot}
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
