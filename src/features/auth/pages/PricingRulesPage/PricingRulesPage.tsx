import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import { getVehicleCategories } from "../../services/vehicleCategoryService";
import type { vehicleCategory } from "../..//types/vehicleCategory.types";

import {
  createPricingRule,
  getPricingRules,
  updatePricingRule,
} from "../../services/pricingRuleService";

import type { PricingRules } from "../../types/PricingRulesPage.types";

import styles from "./PricingRulesPage.module.css";

const chargeTypes = ["Hora", "Minuto", "Diaria", "Mensal"];
type ModalMode = "create" | "edit";
export function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRules[]>([]);
  const [categories, setCategories] = useState<vehicleCategory[]>([]);

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedRuleId, setSelectedRuleId] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [tipoCobranca, setTipoCobranca] = useState("Hora");
  const [valor, setValor] = useState("");
  const [toleranciaMinutos, setToleranciaMinutos] = useState("0");
  const [active, setActive] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const filteredRules = useMemo(() => {
    const searchText = search.toLowerCase();

    return rules.filter((rule) => {
      const categoryName = rule.category?.name || "";

      return (
        categoryName.toLowerCase().includes(searchText) ||
        rule.tipo_cobranca.toLowerCase().includes(searchText) ||
        String(rule.valor).includes(searchText) ||
        (rule.active ? "ativo" : "inativo").includes(searchText)
      );
    });
  }, [rules, search]);

  async function loadData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [rulesData, categoriesData] = await Promise.all([
        getPricingRules(),
        getVehicleCategories(),
      ]);

      setRules(rulesData);
      setCategories(categoriesData.filter((category) => category.active));
    } catch {
      setErrorMessage("Erro ao carregar regras de cobrança.");
    } finally {
      setIsLoading(false);
    }
  }

  

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setSelectedRuleId("");
    setCategoryId("");
    setTipoCobranca("Hora");
    setValor("");
    setToleranciaMinutos("0");
    setActive(true);
    setErrorMessage("");
  }

  function openCreateModal() {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }
  

  function openEditModal(rule: PricingRules) {
    setErrorMessage("");
    setModalMode("edit");
    setSelectedRuleId(rule.id);
    setCategoryId(rule.categoryId);
    setTipoCobranca(rule.tipo_cobranca);
    setValor(String(rule.valor));
    setToleranciaMinutos(String(rule.tolerancia_minutos));
    setActive(rule.active);
    setIsModalOpen(true);
  }

  async function handleSubmitRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!categoryId) {
      setErrorMessage("Selecione uma categoria.");
      return;
    }

    if (!tipoCobranca) {
      setErrorMessage("Selecione o tipo de cobrança.");
      return;
    }

    if (!valor.trim()) {
      setErrorMessage("Informe o valor da cobrança.");
      return;
    }

    const valorNumber = Number(valor);
    const toleranciaNumber = Number(toleranciaMinutos);

    if (Number.isNaN(valorNumber) || valorNumber <= 0) {
      setErrorMessage("Informe um valor válido.");
      return;
    }

    if (Number.isNaN(toleranciaNumber) || toleranciaNumber < 0) {
      setErrorMessage("Informe uma tolerância válida.");
      return;
    }

    try {
      setIsSaving(true);

      if (modalMode === "create") {
        await createPricingRule({
          categoryId,
          tipo_cobranca: tipoCobranca,
          valor: valorNumber,
          tolerancia_minutos: toleranciaNumber,
        });
      } else {
        await updatePricingRule(selectedRuleId, {
          categoryId,
          tipo_cobranca: tipoCobranca,
          valor: valorNumber,
          tolerancia_minutos: toleranciaNumber,
          active,
        });
      }

      closeModal();

      await loadData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        setErrorMessage(
          responseData?.message || "Erro ao salvar regra de cobrança."
        );

        return;
      }

      setErrorMessage("Erro inesperado ao salvar regra de cobrança.");
    } finally {
      setIsSaving(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Regras de Cobrança</h1>
          <p>Configure valores por categoria e tipo de cobrança.</p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          + Nova Regra
        </Button>
      </header>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <div className={styles.searchBox}>
        <span>🔎</span>

        <input
          type="text"
          placeholder="Buscar regra..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando regras...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Tipo de Cobrança</th>
                <th>Valor</th>
                <th>Tolerância</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.category?.name || rule.categoryId}</td>
                  <td>{rule.tipo_cobranca}</td>
                  <td>{formatCurrency(rule.valor)}</td>
                  <td>{rule.tolerancia_minutos} min</td>
                  <td>
                    <span
                      className={
                        rule.active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {rule.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => openEditModal(rule)}
                        title="Editar regra"
                      >
                        ✎
                      </button>
                    </div>
                  </td>
                </tr>
                
              ))}

              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    Nenhuma regra encontrada.
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
                <h2>{modalMode === "create" ? "Nova Regra" : "Editar Regra"}</h2>
                <p>
                  {modalMode === "create"
                    ? "Cadastre uma regra de cobrança."
                    : "Atualize os dados da regra de cobrança."}
                </p>
              </div>

              <button type="button" onClick={closeModal}>
                ×
              </button>
            </header>

            <form onSubmit={handleSubmitRule} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="categoryId">Categoria</label>

                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">Selecione uma categoria</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tipoCobranca">Tipo de Cobrança</label>

                <select
                  id="tipoCobranca"
                  value={tipoCobranca}
                  onChange={(event) => setTipoCobranca(event.target.value)}
                >
                  {chargeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Valor"
                name="valor"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 45"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
              />

              {modalMode === "edit" && (
                <div className={styles.formGroup}>
                  <label htmlFor="active">Status</label>

                  <select
                    id="active"
                    value={active ? "true" : "false"}
                    onChange={(event) => setActive(event.target.value === "true")}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              )}

              <Input
                label="Tolerância em minutos"
                name="tolerancia_minutos"
                type="number"
                min="0"
                placeholder="Ex: 15"
                value={toleranciaMinutos}
                onChange={(event) =>
                  setToleranciaMinutos(event.target.value)
                }
              />

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : modalMode === "create"
                      ? "Salvar"
                      : "Atualizar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
