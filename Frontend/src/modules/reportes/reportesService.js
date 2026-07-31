// Frontend/src/modules/reportes/reportesService.js
import axios from '@/config/axiosConfig';

function limpiarParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
}

function extraerNombreArchivo(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const simpleMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return fallback;
}

async function obtenerReporteInventario(params = {}) {
  const payload = limpiarParams(params);

  const { data } = await axios.get('/reportes/inventario', {
    params: payload,
  });

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totales: data?.totales ?? {},
    filtros_aplicados: data?.filtros_aplicados ?? {},
    generado_en: data?.generado_en ?? null,
    sucursal_id: data?.sucursal_id ?? null,
    raw: data ?? {},
  };
}

async function exportarReporteInventario(formato, params = {}) {
  const payload = limpiarParams({ ...params, formato });

  const response = await axios.get('/reportes/inventario/exportar', {
    params: payload,
    responseType: 'blob',
  });

  const extension = formato === 'excel' ? 'xlsx' : 'pdf';
  const fallback = `reporte-inventario.${extension}`;
  const filename = extraerNombreArchivo(response.headers?.['content-disposition'], fallback);

  return {
    blob: response.data,
    filename,
    contentType: response.headers?.['content-type'] ?? null,
  };
}

async function obtenerReporteVentas(params = {}) {
  const payload = limpiarParams(params);

  const { data } = await axios.get('/reportes/ventas', {
    params: payload,
  });

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totales: data?.totales ?? {},
    filtros_aplicados: data?.filtros_aplicados ?? {},
    generado_en: data?.generado_en ?? null,
    sucursal_id: data?.sucursal_id ?? null,
    raw: data ?? {},
  };
}

async function exportarReporteVentas(formato, params = {}) {
  const payload = limpiarParams({ ...params, formato });

  const response = await axios.get('/reportes/ventas/exportar', {
    params: payload,
    responseType: 'blob',
  });

  const extension = formato === 'excel' ? 'xlsx' : 'pdf';
  const fallback = `reporte-ventas.${extension}`;
  const filename = extraerNombreArchivo(response.headers?.['content-disposition'], fallback);

  return {
    blob: response.data,
    filename,
    contentType: response.headers?.['content-type'] ?? null,
  };
}

async function obtenerReporteCompras(params = {}) {
  const payload = limpiarParams(params);

  const { data } = await axios.get('/reportes/compras', {
    params: payload,
  });

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totales: data?.totales ?? {},
    filtros_aplicados: data?.filtros_aplicados ?? {},
    generado_en: data?.generado_en ?? null,
    sucursal_id: data?.sucursal_id ?? null,
    raw: data ?? {},
  };
}

async function exportarReporteCompras(formato, params = {}) {
  const payload = limpiarParams({ ...params, formato });

  const response = await axios.get('/reportes/compras/exportar', {
    params: payload,
    responseType: 'blob',
  });

  const extension = formato === 'excel' ? 'xlsx' : 'pdf';
  const fallback = `reporte-compras.${extension}`;
  const filename = extraerNombreArchivo(response.headers?.['content-disposition'], fallback);

  return {
    blob: response.data,
    filename,
    contentType: response.headers?.['content-type'] ?? null,
  };
}

export const reportesService = {
  obtenerReporteInventario,
  exportarReporteInventario,
  obtenerReporteVentas,
  exportarReporteVentas,
  obtenerReporteCompras,
  exportarReporteCompras,
};
