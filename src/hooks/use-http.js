import { useState, useCallback } from "react";

const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = useCallback(async (request, transform) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(request.url, {
        method: request.method ? request.method : "GET",
        headers: request.headers ? request.headers : {},
        body: request.body ? JSON.stringify(request.body) : null,
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      transform(data);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, []);

  return { isLoading, error, sendRequest };
};

export default useHttp;
