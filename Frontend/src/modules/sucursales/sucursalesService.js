import api from '@/config/axiosConfig';

const sucursalesService = {
  async seleccionarSucursal(sucursal_uuid) {
    const { data } = await api.post('/sucursales/seleccionar-sucursal', {
      sucursal_uuid,
    });

    return data;
  },
};

export default sucursalesService;
