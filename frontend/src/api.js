// export async function fetchVehicles() {
//     const response = await fetch('http://31.141.247.181:3001/api/vehicles/locations');
//     if (!response.ok) {
//         throw new Error('Failed to fetch vehicle locations');
//     }
//     return response.json();
// }
export async function fetchVehicles() {
    const response = await fetch('http://localhost:3001/api/vehicles/locations');
    if (!response.ok) {
        throw new Error('Failed to fetch vehicle locations');
    }
    return response.json();
}