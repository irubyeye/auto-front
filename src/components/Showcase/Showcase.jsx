import React, { useEffect, useRef, useState } from 'react';
import { useFetching } from '../../hooks/useFetching';

const Showcase = () => {
	const [cars, setCars] = useState([]);


	// const [fetchCars, isFetchingCars, carsError, setCarsError] = useFetching(async () => {
	// 	let data = await fetch("http://localhost:8080/api/complectations/get", {
	// 		method: 'GET',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 	});
	// 	data = await data.json();
	// 	console.log(data);
	// 	setCars(data);
	// });

	// useEffect(() => {
	// 	fetchCars();
	// }, []);



	/* const selectPage = e => {
		setCurrentPage(e.target);
	} */

	return (
		<div className="">

		</div>
	);
};

export default Showcase;