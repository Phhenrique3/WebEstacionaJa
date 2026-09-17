import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../../services/clientService";
import type {
  Client,
  CreateClientRequest,
  TipoDocumento,
} from "../../types/client.types";

import styles from "./ClientPage.module.css";

type ModalMode = "create" | "edit";

const documentTypes: TipoDocumento[] = ["CPF", "CNPJ"];

export function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("CPF");
  const [documento, setDocumento] = useState("");
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredClients = useMemo(() => {
    const searchText = search.trim().toLocaleLowerCase("pt-BR");

    return clients.filter((client) =>
      [
        client.name,
        client.email ?? "",
        client.telefone,
        client.documento,
        client.tipo_documento,
        client.active ? "ativo" : "inativo",
      ].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(searchText)
      )
    );
  }, [clients, search]);

  async function loadClients() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getClients();

      setClients(data);
    } catch {
      setErrorMessage("Erro ao carregar clientes.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  function resetForm() {
    setSelectedClientId("");
    setName("");
    setEmail("");
    setTelefone("");
    setTipoDocumento("CPF");
    setDocumento("");
    setActive(true);
    setErrorMessage("");
  }

  function openCreateModal() {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  }

  function openEditModal(client: Client) {
    setErrorMessage("");
    setModalMode("edit");
    setSelectedClientId(client.id);
    setName(client.name);
    setEmail(client.email ?? "");
    setTelefone(client.telefone);
    setTipoDocumento(client.tipo_documento);
    setDocumento(client.documento);
    setActive(client.active);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Informe o nome do cliente.");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Informe um e-mail válido.");
      return;
    }

    if (!telefone.trim()) {
      setErrorMessage("Informe o telefone.");
      return;
    }

    if (!tipoDocumento || !documento.trim()) {
      setErrorMessage("Informe o tipo e o número do documento.");
      return;
    }

    const data: CreateClientRequest = {
      name: name.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      tipo_documento: tipoDocumento,
      documento: documento.trim(),
    };

    try {
      setIsSaving(true);

      if (modalMode === "create") {
        const newClient = await createClient(data);

        setClients((current) => [newClient, ...current]);
      } else {
        const updatedClient = await updateClient(selectedClientId, {
          ...data,
          active,
        });

        setClients((current) =>
          current.map((client) =>
            client.id === selectedClientId ? updatedClient : client
          )
        );
      }

      closeModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as {
          message?: string;
          mensagem?: string;
        };

        setErrorMessage(
          responseData?.mensagem ||
          responseData?.message ||
          "Erro ao salvar cliente."
        );
      } else {
        setErrorMessage("Erro inesperado ao salvar cliente.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`Deseja realmente desativar o cliente ${client.name}?`)) {
      return;
    }

    try {
      setErrorMessage("");

      await deleteClient(client.id);

      setClients((current) =>
        current.map((item) =>
          item.id === client.id ? { ...item, active: false } : item
        )
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as {
          message?: string;
          mensagem?: string;
        };

        setErrorMessage(
          responseData?.mensagem ||
          responseData?.message ||
          "Erro ao desativar cliente."
        );
      } else {
        setErrorMessage("Erro inesperado ao desativar cliente.");
      }
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Clientes</h1>
          <p>Cadastre e gerencie os clientes do estacionamento.</p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          + Novo Cliente
        </Button>
      </header>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <div className={styles.searchBox}>
        <span aria-hidden="true">🔎</span>

        <input
          type="search"
          aria-label="Buscar clientes"
          placeholder="Buscar por nome, e-mail, telefone, documento ou status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando clientes...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Documento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email ?? "Não informado"}</td>
                  <td>{client.telefone}</td>
                  <td>
                    {client.tipo_documento}: {client.documento}
                  </td>

                  <td>
                    <span
                      className={
                        client.active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {client.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => openEditModal(client)}
                        title="Editar cliente"
                        aria-label={`Editar ${client.name}`}
                      >
                        ✎
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeModal()
          }
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-modal-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <h2 id="client-modal-title">
                  {modalMode === "create" ? "Novo Cliente" : "Editar Cliente"}
                </h2>

                <p>
                  {modalMode === "create"
                    ? "Preencha os dados para cadastrar um cliente."
                    : "Atualize os dados do cliente."}
                </p>
              </div>

              <button type="button" onClick={closeModal} aria-label="Fechar">
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Nome completo"
                name="name"
                type="text"
                placeholder="Ex: João da Silva"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <div className={styles.formRow}>
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="joao@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                  label="Telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipoDocumento">Tipo de documento</label>

                  <select
                    id="tipoDocumento"
                    value={tipoDocumento}
                    onChange={(event) =>
                      setTipoDocumento(event.target.value as TipoDocumento)
                    }
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Número do documento"
                  name="documento"
                  type="text"
                  placeholder={
                    tipoDocumento === "CPF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  value={documento}
                  onChange={(event) => setDocumento(event.target.value)}
                />
              </div>

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