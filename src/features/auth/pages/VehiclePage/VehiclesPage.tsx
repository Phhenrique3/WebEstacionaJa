import { PagedSelect } from "../../../../components/pagination/PagedSelect";
import { Pagination } from "../../../../components/pagination/Pagination";
import { usePagedList } from "../../../../components/pagination/usePagedList";
import type { FormEvent } from "react";
import { useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import { createVehicle, updateVichle } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle.types";

import type { Client } from "../../types/client.types";


import type { vehicleCategory } from "../../types/vehicleCategory.types";

import styles from "./VehiclesPage.module.css";

export function VehiclesPage() {
    const list = usePagedList<Vehicle>("/vehicles");

    const { search, setSearch, loading: isLoading, items: filteredVehicles } = list;

    const [isSaving, setIsSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [placa, setPlaca] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [cor, setCor] = useState("");

    const [clientId, setClientId] = useState("");
    const [clientIdLabel, setClientIdLabel] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categoryIdLabel, setCategoryIdLabel] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    type modalMode = "create" | "edit"

    const [modalMode, setmodalMode] = useState<modalMode>("create");
    const [selectVehicleId, setSelectVehicleId] = useState("")

    function resetForm() {
        setPlaca("");
        setMarca("");
        setModelo("");
        setCor("");
        setClientId("");
        setClientIdLabel("");
        setCategoryId("");
        setCategoryIdLabel("");
    }

    function openForm() {
        resetForm();
        setErrorMessage("");
        setmodalMode("create")
        setSelectVehicleId("")


        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        resetForm();
        setErrorMessage("");
    }

    async function handleSubmitVehicle(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");

        if (!placa.trim()) {
            setErrorMessage("Informe a placa do veículo.");
            return;
        }

        if (!marca.trim()) {
            setErrorMessage("Informe a marca do veículo.");
            return;
        }

        if (!modelo.trim()) {
            setErrorMessage("Informe o modelo do veículo.");
            return;
        }

        if (!cor.trim()) {
            setErrorMessage("Informe a cor do veículo.");
            return;
        }

        if (!clientId.trim()) {
            setErrorMessage("Selecione um cliente.");
            return;
        }

        if (!categoryId.trim()) {
            setErrorMessage("Selecione uma categoria.");
            return;
        }

        try {
            setIsSaving(true);

            const vehicleData = ({
                placa: placa.trim().toUpperCase(),
                marca: marca.trim(),
                modelo: modelo.trim(),
                cor: cor.trim(),
                clientId,
                categoryId,
            });

            if (modalMode === "create") {
                await createVehicle(vehicleData)
            }
            if (modalMode === "edit") {
                await updateVichle(selectVehicleId, vehicleData)
            }

            closeForm();

            list.refresh();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as { message?: string };

                setErrorMessage(responseData?.message || "Erro ao cadastrar veículo.");
                return;
            }

            setErrorMessage("Erro inesperado ao cadastrar veículo.");
        } finally {
            setIsSaving(false);
        }
    }

    function openEditModal(vehicles: Vehicle) {

        setErrorMessage("")
        setmodalMode("edit")

        setSelectVehicleId(vehicles.id)

        setPlaca(vehicles.placa)
        setCor(vehicles.cor)
        setModelo(vehicles.modelo)
        setMarca(vehicles.marca)
        setClientId(vehicles.clientId)
        setClientIdLabel(vehicles.client?.name ?? vehicles.clientId)
        setCategoryId(vehicles.categoryId)
        setCategoryIdLabel(vehicles.category?.name ?? vehicles.categoryId)

        setIsFormOpen(true)

    }


    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Veículos</h1>
                    <p>Cadastre e consulte os veículos vinculados aos clientes.</p>
                </div>

                <Button type="button" onClick={openForm}>
                    + Novo Veículo
                </Button>
            </header>

            {(errorMessage || list.error) && (
                <div className={styles.errorMessage}>{errorMessage || list.error}</div>
            )}

            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span>Total de veículos</span>
                    <strong>{list.summary?.total ?? 0}</strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Com cliente</span>
                    <strong>
                        {list.summary?.total ?? 0}
                    </strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Categorias</span>
                    <strong>
                        {list.summary?.categories ?? 0}
                    </strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Resultados</span>
                    <strong>{list.total}</strong>
                </div>
            </div>

            <div className={styles.searchBox}>
                <span>🔎</span>

                <input
                    type="text"
                    placeholder="Buscar por placa, cliente, marca ou modelo..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {isFormOpen && (
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <div>
                            <h2>
                                {modalMode === "create"
                                    ? "Novo veículo"
                                    : "Editar veículo"}
                            </h2>
                            <p>
                                {modalMode === "create"
                                    ? "Informe os dados do veículo e vincule ao cliente."
                                    : "Atualize os dados do veículo."}
                            </p>
                        </div>

                        <button type="button" onClick={closeForm}>
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmitVehicle} className={styles.form}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Placa"
                                name="placa"
                                type="text"
                                placeholder="Ex: GZK1818"
                                value={placa}
                                onChange={(event) => setPlaca(event.target.value.toUpperCase())}
                            />

                            <Input
                                label="Marca"
                                name="marca"
                                type="text"
                                placeholder="Ex: Ferrari"
                                value={marca}
                                onChange={(event) => setMarca(event.target.value)}
                            />

                            <Input
                                label="Modelo"
                                name="modelo"
                                type="text"
                                placeholder="Ex: SF90"
                                value={modelo}
                                onChange={(event) => setModelo(event.target.value)}
                            />

                            <Input
                                label="Cor"
                                name="cor"
                                type="text"
                                placeholder="Ex: Vermelha"
                                value={cor}
                                onChange={(event) => setCor(event.target.value)}
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.selectGroup}>
                                <PagedSelect<Client> id="clientId" label="Cliente" path="/clients" scope="active-default"
                                    value={clientId} selectedLabel={clientIdLabel}
                                    format={item => [item.name, item.documento, item.email].filter(Boolean).join(" - ")}
                                    onChange={(id, text) => { setClientId(id); setClientIdLabel(text); }} />
                            </div>

                            <div className={styles.selectGroup}>
                                <PagedSelect<vehicleCategory> id="categoryId" label="Categoria" path="/vehicle-categories" scope="active-default"
                                    value={categoryId} selectedLabel={categoryIdLabel}
                                    format={item => [item.name, item.description].filter(Boolean).join(" - ")}
                                    onChange={(id, text) => { setCategoryId(id); setCategoryIdLabel(text); }} />
                            </div>
                        </div>

                        <div className={styles.previewBox}>
                            <strong>Prévia do cadastro</strong>

                            <div>
                                <span>Placa</span>
                                <p>{placa || "GZK1818"}</p>
                            </div>

                            <div>
                                <span>Veículo</span>
                                <p>
                                    {marca || "Marca"} {modelo || "Modelo"} - {cor || "Cor"}
                                </p>
                            </div>

                            <div>
                                <span>Cliente</span>
                                <p>{clientIdLabel || "Nenhum cliente selecionado"}</p>
                            </div>

                            <div>
                                <span>Categoria</span>
                                <p>
                                    {categoryIdLabel || "Nenhuma categoria selecionada"}
                                </p>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <Button type="button" variant="secondary" onClick={closeForm}>
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Salvando..."
                                    : modalMode === "create"
                                        ? "Salvando veículo"
                                        : "Savado Alteração"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.tableCard}>
                {isLoading ? (
                    <p className={styles.loadingText}>Carregando veículos...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Cliente</th>
                                <th>Marca/Modelo</th>
                                <th>Categoria</th>
                                <th>Cor</th>
                                <th>Status</th>
                                <th>Ações</th>

                            </tr>
                        </thead>

                        <tbody>
                            {filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td>{vehicle.placa}</td>

                                    <td>{vehicle.client?.name || "—"}</td>

                                    <td>
                                        {vehicle.marca} {vehicle.modelo}
                                    </td>

                                    <td>{vehicle.category?.name || "—"}</td>

                                    <td>{vehicle.cor}</td>

                                    <td>
                                        <span className={styles.statusActive}>Ativo</span>
                                    </td>

                                    <div className={styles.actions} >
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(vehicle)}
                                            title="Edutar veiculo"
                                        >
                                            ✎

                                        </button>

                                    </div>

                                </tr>
                            ))}

                            {filteredVehicles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.emptyMessage}>
                                        Nenhum veículo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
      <Pagination {...list} label="Paginação de veículos" />
        </section>
    );
}