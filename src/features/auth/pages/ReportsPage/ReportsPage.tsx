import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/Button";
import {
    getClientsReportPdf,
    getVehiclesParkingReportPdf,
    getVehicleReportPdf
} from "../../services/reportService";
import styles from "./ReportsPage.module.css";

type ReportItem = {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    icon: string;
    type: "clients" | "ParkingSession" | "Vichle"
};

const reportsList: ReportItem[] = [
    {
        id: "clients-report",
        title: "Relatório de clientes",
        description: "Relatório de clientes cadastrados.",
        actionLabel: "Extrair relatório",
        type: "clients",
        icon: "bi bi-journal-arrow-up",
    },
    {
        id: "ParkingSession-report",
        title: "Relatório de veículos estacionados",
        description: "Relatório de veículos estacionados.",
        actionLabel: "Extrair relatório",
        type: "ParkingSession",
        icon: "bi bi-journal-arrow-up",
    },
    {
        id: "Vehicle-report",
        title: "Relatório de veículos cadastrado",
        description: "Relatório de veículos cadastrado.",
        actionLabel: "Extrair relatório",
        type: "Vichle",
        icon: "bi bi-car-front",
    },
];

export function ReportsPage() {
    const [search, setSearch] = useState("");
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const filteredReports = useMemo(() => {
        const searchText = search.toLowerCase();

        return reportsList.filter((report) => {
            return (
                report.title.toLowerCase().includes(searchText) ||
                report.description.toLowerCase().includes(searchText)
            );
        });
    }, [search]);

    function downloadPdf(pdfBlob: Blob, fileName: string) {
        const fileURL = window.URL.createObjectURL(
            new Blob([pdfBlob], {
                type: "application/pdf",
            })
        );

        const link = document.createElement("a");

        link.href = fileURL;
        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(fileURL);
    }

    async function handleGenerateReport(type: ReportItem["type"]) {
        try {
            setErrorMessage("");
            setIsLoadingReport(true);

            if (type === "clients") {
                const pdfBlob = await getClientsReportPdf();

                downloadPdf(
                    pdfBlob,
                    "relatorio-clientes.pdf"
                );

                return;
            }

            if (type === "ParkingSession") {
                const pdfBlob = await getVehiclesParkingReportPdf();

                downloadPdf(
                    pdfBlob,
                    "relatorio-veiculos-estacionados.pdf"
                );

                return;
            }

            if (type === "Vichle") {
                const pdfBlob = await getVehicleReportPdf();

                downloadPdf(
                    pdfBlob,
                    "relatorio-veiculos-cadastrado.pdf"
                );

                return;
            }

        } catch (error) {
            console.error("Erro ao extrair relatório:", error);

            setErrorMessage(
                "Erro ao extrair relatório."
            );
        } finally {
            setIsLoadingReport(false);
        }
    }

    return (
        <section className={styles.page}>

            <header className={styles.header}>
                <div>
                    <h1>Relatórios</h1>

                    <p>
                        Extraia relatórios do sistema em PDF.
                    </p>
                </div>
            </header>

            {errorMessage && (
                <div className={styles.errorMessage}>
                    {errorMessage}
                </div>
            )}

            <div className={styles.searchBox}>
                <span className={styles.searchIcon}>
                    🔎
                </span>

                <input
                    type="text"
                    placeholder="Pesquisar relatório..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />
            </div>

            <div className={styles.reportsCard}>

                {filteredReports.length === 0 ? (

                    <p className={styles.emptyMessage}>
                        Nenhum relatório encontrado.
                    </p>

                ) : (

                    <div className={styles.reportList}>

                        {filteredReports.map((report) => (

                            <div
                                key={report.id}
                                className={styles.reportItem}
                            >

                                <div className={styles.reportInfo}>
                                    <h2>
                                        {report.title}
                                    </h2>

                                    <p>
                                        {report.description}
                                    </p>
                                </div>

                                <Button
                                    title={report.actionLabel}
                                    type="button"
                                    onClick={() =>
                                        handleGenerateReport(
                                            report.type
                                        )
                                    }
                                    disabled={isLoadingReport}
                                >

                                    {isLoadingReport ? (
                                        "Extraindo..."
                                    ) : (
                                        <i
                                            className={report.icon}
                                        ></i>
                                    )}

                                </Button>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}