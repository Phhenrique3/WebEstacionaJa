import { api } from "../services/api";

export async function getClientsReportPdf() {
  const response = await api.get("/reports/clients/pdf", {
    responseType: "blob",
  });

  return response.data;
}