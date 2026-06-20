export const formattedDate = () => {
    const fecha = new Date();

    fecha.setHours(fecha.getHours() + 6);

    return fecha.toISOString();
}