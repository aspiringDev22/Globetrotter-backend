import { fetchDestinations } from "../services/destinationsService.js";

export async function getDestinations(req, res) {
    try {
        const data = await fetchDestinations();
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}
