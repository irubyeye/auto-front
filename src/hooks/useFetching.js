import { useState } from "react"

export const useFetching = (callback) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const fetching = async (...args) => {
		let data;
		try {
			setIsLoading(true);
			data = await callback(...args);
		} catch (e) {
			console.log(e);
			setError(e.message);
		} finally {
			setIsLoading(false);
		}
		return data;
	}
	return [fetching, isLoading, error, setError];
}