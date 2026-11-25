import { useEffect, useRef, useState } from "react";
import { usePagedList } from "../../pagination/usePagedList";
import styles from "./EntrySearch.module.css";

type Props<T> = {
  id: string;
  label: string;
  placeholder: string;
  path: string;
  selectedLabel: string;
  title: (item: T) => string;
  description: (item: T) => string;
  onChange: (id: string, label: string) => void;
};

export function EntrySearch<T extends { id: string }>({
  id, label, placeholder, path, selectedLabel, title, description, onChange,
}: Props<T>) {
  const list = usePagedList<T>(path, "available");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = useRef<HTMLUListElement>(null);
  const items = list.loading ? [] : list.items;
  const activeItem = items[active];

  useEffect(() => {
    if (open && activeItem) options.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, activeItem, open]);

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function select(item: T) {
    onChange(item.id, [title(item), description(item)].filter(Boolean).join(" — "));
    list.setSearch("");
    close();
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <i aria-hidden="true" className="bi bi-search" />
        <input id={id} role="combobox" autoComplete="off" aria-autocomplete="list"
          aria-expanded={open} aria-controls={open ? id + "-options" : undefined}
          aria-activedescendant={open && activeItem ? id + "-" + activeItem.id : undefined}
          placeholder={placeholder} value={selectedLabel || list.search}
          onFocus={event => { event.currentTarget.select(); setOpen(true); }}
          onClick={() => setOpen(true)} onBlur={close}
          onChange={event => {
            onChange("", "");
            list.setSearch(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              if (items.length) setActive(event.key === "ArrowDown"
                ? Math.min(active + 1, items.length - 1)
                : active < 0 ? items.length - 1 : Math.max(active - 1, 0));
            } else if (open && event.key === "Enter") {
              event.preventDefault();
              if (activeItem) select(activeItem);
            } else if (open && event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
        />
      </div>
      {open && <>
        <ul id={id + "-options"} role="listbox" aria-label={label} ref={options} className={styles.results}>
          {items.map((item, index) => (
            <li key={item.id} id={id + "-" + item.id} role="option" aria-selected={index === active}
              onMouseDown={event => event.preventDefault()} onClick={() => select(item)}>
              <strong>{title(item)}</strong>
              <span>{description(item)}</span>
            </li>
          ))}
        </ul>
        {list.loading ? <small role="status">Buscando…</small>
          : list.error ? <small role="alert">{list.error}</small>
          : !items.length && <small role="status">Nenhum resultado. Tente outro termo.</small>}
      </>}
    </div>
  );
}
