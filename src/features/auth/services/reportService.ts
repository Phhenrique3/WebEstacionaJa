import { api } from "../services/api";

export async function getClientsReportPdf() {
  const response = await api.get("/reports/clients/pdf", {
    responseType: "blob",
  });

  return response.data;
}

export async function getVehiclesParkingReportPdf() {
  const response = await api.get("/reports/ParkingSessions/pdf", {
    responseType: "blob",
  });

  return response.data;
}

export async function getVehicleReportPdf() {
  const response = await api.get("/reports/Vehicle/Pdf", {
    responseType: "blob",
  });

  return response.data;
}
