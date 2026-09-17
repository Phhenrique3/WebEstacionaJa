import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import {
  createVehicleCategory,
  getVehicleCategories,
  updateVehicleCategory,
} from "../../services/vehicleCategoryService";

import type { vehicleCategory } from "../../types/vehicleCategory.types";

import styles from "./VehicleCategoriesPage.module.css";

type ModalMode = "create" | "edit";

export function VehicleCategoriesPage() {
  const [categories, setCategories] = useState<vehicleCategory[]>([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const filteredCategories = useMemo(() => {
    const searchText = search.toLowerCase();

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(searchText) ||
        category.description?.toLowerCase().includes(searchText) ||
        (category.active ? "ativo" : "inativo").includes(searchText)
      );
    });
  }, [categories, search]);

  async function loadCategories() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getVehicleCategories();

      setCategories(data);
    } catch {
      setErrorMessage("Erro ao carregar categorias de veículos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setSelectedCategoryId("");
    setName("");
    setDescription("");
    setActive(true);
    setErrorMessage("");
  }

  function openCreateModal() {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  }

  function openEditModal(category: vehicleCategory) {
    setErrorMessage("");
    setModalMode("edit");
    setSelectedCategoryId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setActive(category.active);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  async function handleSubmitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Informe o nome da categoria.");
      return;
    }

    try {
      setIsSaving(true);

      if (modalMode === "create") {
        const newCategory = await createVehicleCategory({
          name,
          description,
        });

        setCategories((currentCategories) => [
          ...currentCategories,
          newCategory,
        ]);
      }

      if (modalMode === "edit") {
        const updatedCategory = await updateVehicleCategory(selectedCategoryId, {
          name,
          description,
          active,
        });

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === selectedCategoryId ? updatedCategory : category
          )
        );
      }

      closeModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        setErrorMessage(
          responseData?.message || "Erro ao salvar categoria de veículo."
        );

        return;
      }

      setErrorMessage("Erro inesperado ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Categorias de Veículos</h1>
          <p>Gerencie os tipos de veículos aceitos no estacionamento.</p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          + Nova Categoria
        </Button>
      </header>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <div className={styles.searchBox}>
        <span>🔎</span>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando categorias...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || "-"}</td>
                  <td>
                    <span
                      className={
                        category.active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {category.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        title="Editar categoria"
                      >
                        ✎
                      </button>
                    </div>
                  </td>
                </  tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyMessage}>
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <h2>
                  {modalMode === "create"
                    ? "Nova Categoria"
                    : "Editar Categoria"}
                </h2>

                <p>
                  {modalMode === "create"
                    ? "Cadastre uma categoria de veículo."
                    : "Atualize os dados da categoria."}
                </p>
              </div>

              <button type="button" onClick={closeModal}>
                ×
              </button>
            </header>

            <form onSubmit={handleSubmitCategory} className={styles.form}>
              <Input
                label="Nome"
                name="name"
                type="text"
                placeholder="Ex: Carro"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <Input
                label="Descrição"
                name="description"
                type="text"
                placeholder="Ex: Veículos de passeio"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              {modalMode === "edit" && (
                <div className={styles.formGroup}>
                  <label htmlFor="active">Status</label>

                  <select
                    id="active"
                    value={active ? "true" : "false"}
                    onChange={(event) =>
                      setActive(event.target.value === "true")
                    }
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              )}

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}