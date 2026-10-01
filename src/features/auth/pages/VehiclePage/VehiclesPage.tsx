import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import { createVehicle, getVehicles, updateVichle } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle.types";

import { getClients } from "../../services/clientService";
import type { Client } from "../../types/client.types";

import { getVehicleCategories } from "../../services/vehicleCategoryService"

import type { vehicleCategory } from "../../types/vehicleCategory.types";

import styles from "./VehiclesPage.module.css";

export function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [categories, setCategories] = useState<vehicleCategory[]>([]);

    const [search, setSearch] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [placa, setPlaca] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [cor, setCor] = useState("");

    const [clientId, setClientId] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    type modalMode = "create" | "edit"

    const [modalMode, setmodalMode] = useState<modalMode>("create");
    const [selectVehicleId, setSelectVehicleId] = useState("")

    const filteredVehicles = useMemo(() => {
        const searchText = search.toLowerCase();

        return vehicles.filter((vehicle) => {
            const clientName = getClientName(vehicle);
            const categoryName = getCategoryName(vehicle);

            return (
                vehicle.placa.toLowerCase().includes(searchText) ||
                vehicle.marca.toLowerCase().includes(searchText) ||
                vehicle.modelo.toLowerCase().includes(searchText) ||
                vehicle.cor.toLowerCase().includes(searchText) ||
                clientName.toLowerCase().includes(searchText) ||
                categoryName.toLowerCase().includes(searchText)
            );
        });
    }, [vehicles, clients, categories, search]);

    const acticeClients = useMemo(() => {
        return clients.filter((client) => client.active === true)
    }, [clients])


    const acticeCategory = useMemo(() => {
        return categories.filter((category) => category.active === true)
    }, [categories])

    const filteredClients = useMemo(() => {
        const searchText = clientSearch.trim().toLowerCase();

        if (!searchText) {
            return acticeClients;
        }

        return clients.filter((client) => {
            const name = client.name || "";
            const email = client.email || "";
            const telefone = client.telefone || "";
            const documento = client.documento || "";

            return (
                name.toLowerCase().includes(searchText) ||
                email.toLowerCase().includes(searchText) ||
                telefone.toLowerCase().includes(searchText) ||
                documento.toLowerCase().includes(searchText)
            );
        });
    }, [clients, clientSearch]);

    const filteredCategories = useMemo(() => {
        const searchText = categorySearch.trim().toLowerCase();

        if (!searchText) {
            return acticeCategory;
        }

        return categories.filter((category) => {
            const name = category.name || "";
            const description = category.description || "";

            return (
                name.toLowerCase().includes(searchText) ||
                description.toLowerCase().includes(searchText)
            );
        });
    }, [categories, categorySearch]);

    const selectedClient = clients.find((client) => client.id === clientId);

    const selectedCategory = categories.find(
        (category) => category.id === categoryId
    );

    async function loadVehicles() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const data = await getVehicles();

            setVehicles(data);
        } catch {
            setErrorMessage("Erro ao carregar veículos.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadFormData() {
        try {
            const [clientsData, categoriesData] = await Promise.all([
                getClients(),
                getVehicleCategories(),
            ]);

            setClients(clientsData);
            setCategories(categoriesData);
        } catch {
            setErrorMessage("Erro ao carregar clientes e categorias.");
        }
    }

    useEffect(() => {
        loadVehicles();
        loadFormData();
    }, []);

    function getClientName(vehicle: Vehicle) {
        if (vehicle.client?.name) {
            return vehicle.client.name;
        }

        const client = clients.find((item) => item.id === vehicle.clientId);

        return client?.name || "-";
    }

    function getCategoryName(vehicle: Vehicle) {
        if (vehicle.category?.name) {
            return vehicle.category.name;
        }

        const category = categories.find((item) => item.id === vehicle.categoryId);

        return category?.name || "-";
    }

    function resetForm() {
        setPlaca("");
        setMarca("");
        setModelo("");
        setCor("");
        setClientId("");
        setCategoryId("");
        setClientSearch("");
        setCategorySearch("");
    }

    async function openForm() {
        resetForm();
        setErrorMessage("");
        setmodalMode("create")
        setSelectVehicleId("")

        if (clients.length === 0 || categories.length === 0) {
            await loadFormData();
        }

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

            await loadVehicles();
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
        setCategoryId(vehicles.categoryId)

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

            {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span>Total de veículos</span>
                    <strong>{vehicles.length}</strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Com cliente</span>
                    <strong>
                        {vehicles.filter((vehicle) => vehicle.clientId).length}
                    </strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Categorias</span>
                    <strong>
                        {new Set(vehicles.map((vehicle) => vehicle.categoryId)).size}
                    </strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Resultados</span>
                    <strong>{filteredVehicles.length}</strong>
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
                                <label htmlFor="clientSearch">Cliente</label>

                                <input
                                    id="clientSearch"
                                    type="text"
                                    className={styles.selectSearchInput}
                                    placeholder="Pesquisar cliente por nome, email, telefone ou documento..."
                                    value={clientSearch}
                                    onChange={(event) => {
                                        setClientSearch(event.target.value);
                                        setClientId("");
                                    }}
                                />

                                <select
                                    id="clientId"
                                    value={clientId}
                                    onChange={(event) => setClientId(event.target.value)}
                                >
                                    <option value="">Selecione um cliente</option>

                                    {filteredClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                            {client.documento ? ` - ${client.documento}` : ""}
                                            {client.email ? ` - ${client.email}` : ""}
                                        </option>
                                    ))}
                                </select>

                                <small className={styles.selectHelpText}>
                                    {filteredClients.length} cliente(s) encontrado(s)
                                </small>
                            </div>

                            <div className={styles.selectGroup}>
                                <label htmlFor="categorySearch">Categoria</label>

                                <input
                                    id="categorySearch"
                                    type="text"
                                    className={styles.selectSearchInput}
                                    placeholder="Pesquisar categoria por nome ou descrição..."
                                    value={categorySearch}
                                    onChange={(event) => {
                                        setCategorySearch(event.target.value);
                                        setCategoryId("");
                                    }}
                                />

                                <select
                                    id="categoryId"
                                    value={categoryId}
                                    onChange={(event) => setCategoryId(event.target.value)}
                                >
                                    <option value="">Selecione uma categoria</option>

                                    {filteredCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                            {category.description ? ` - ${category.description}` : ""}
                                        </option>
                                    ))}
                                </select>

                                <small className={styles.selectHelpText}>
                                    {filteredCategories.length} categoria(s) encontrada(s)
                                </small>
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
                                <p>{selectedClient?.name || "Nenhum cliente selecionado"}</p>
                            </div>

                            <div>
                                <span>Categoria</span>
                                <p>
                                    {selectedCategory?.name || "Nenhuma categoria selecionada"}
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

                                    <td>{getClientName(vehicle)}</td>

                                    <td>
                                        {vehicle.marca} {vehicle.modelo}
                                    </td>

                                    <td>{getCategoryName(vehicle)}</td>

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
        </section>
    );
}