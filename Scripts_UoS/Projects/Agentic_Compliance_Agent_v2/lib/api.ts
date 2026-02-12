export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export async function analyzeQuery(query: string) {
    try {
        console.log("SENDING REQUEST TO:", `${API_URL}/analyze`);
        console.log("PAYLOAD:", JSON.stringify({ query }));

        const res = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Analysis request failed");
        }

        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
