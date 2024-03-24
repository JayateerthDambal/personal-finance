import { useState, useEffect } from "react";

export function useHealthCheck() {
    const [isServerHealthy, setIsServerHealthy] = useState(true);

    useEffect(() => {
        const serverHealth = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/user/health-check"
                );
                if (!response.ok) {
                    console.log("Server is Running Fine.");
                    setIsServerHealthy(false);
                }
            } catch (error) {
                console.error("Error: ", error);
                setIsServerHealthy(false);
            }
        };

        serverHealth();

        const interval = setInterval(serverHealth, 250000);

        return () => clearInterval(interval);
    }, []);

    return isServerHealthy;
}