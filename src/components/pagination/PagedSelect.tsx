import { usePagedList } from "./usePagedList";

type Props<T> = {
  id: string; label: string; path: string; scope: string; value: string;
  selectedLabel: string; format: (item: T) => string;
  onChange: (id: string, label: string) => void;
};

export function PagedSelect<T extends { id: string }>({ id, label, path, scope, value, selectedLabel, format, onChange }: Props<T>) {
  const list = usePagedList<T>(path, scope);
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input type="search" aria-label={`Pesquisar: ${label}`} placeholder={`Pesquisar: ${label}`}
        value={list.search} onChange={event => list.setSearch(event.target.value)} />
      <select id={id} value={value} onChange={event => {
        const option = event.target.selectedOptions[0];
        onChange(option.value, option.value ? option.text : "");
      }}>
        <option value="">Selecione</option>
        {value && !list.items.some(item => item.id === value) &&
          <option value={value}>{selectedLabel || value}</option>}
        {list.items.map(item => <option key={item.id} value={item.id}>{format(item)}</option>)}
      </select>
      {list.error ? <p role="alert">{list.error}</p> : list.loading ? <small>Carregando…</small>
        : !list.total ? <small>Nenhum resultado.</small>
        : list.total > list.items.length && <small>Refine a busca para encontrar outras opções.</small>}
    </>
  );
}
