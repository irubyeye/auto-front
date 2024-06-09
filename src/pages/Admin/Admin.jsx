import React, { useEffect, useState, useContext } from 'react';
import Configurator from '../../components/Configurator/Configurator';
import CarSlides from '../../components/CarSlides/CarSlides';
import schemas from '../../utils/schemas';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext, LangContext } from '../../context';
import Button from '../../UI/Button';
import Input from '../../UI/Input';

const Admin = ({ providedCar, providedModels }) => {
	const [selectedBrand, setSelectedBrand] = useState(providedCar?.brand || null);
	const [selectedColor, setSelectedColor] = useState(null);
	const [brandModels, setBrandModels] = useState(providedModels || null);
	const [currentCar, setCurrentCar] = useState(providedCar || schemas.car);
	const [selectedComplectIndex, setSelectedComplectIndex] = useState(0);
	const [accessories, setAccessories] = useState([]);
	const [queryParams, setQueryParams] = useState({ skip: 0, limit: 4 });
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);

	const [fetchDocument] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
	});

	const [pushDocument] = useFetching(async (document, endpoint, method) => {
		let res = await fetch(servURL + endpoint, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(document)
		})
		res = await res.json();
		return res;
	});

	// load brand cars
	useEffect(() => {
		const getCars = async () => {
			const res = await fetchDocument(`models/getMany?brand=${selectedBrand}&skip=${queryParams.skip}&limit=${queryParams.limit}`);
			setBrandModels(res);
			setQueryParams(prev => ({ ...prev, skip: prev.skip + prev.limit }));
		}

		if (selectedBrand) getCars();
	}, [selectedBrand]);

	useEffect(() => {
		const loadAccessories = async () => {
			const accessories = await fetchDocument('accessories/get');
			setAccessories(accessories);
		}
		loadAccessories();
	}, []);

	const addAccessory = async (event, index) => {
		const inputsContainer = event.target.parentNode.previousElementSibling;
		const accessoryValues = inputsContainer.querySelector(`#accessory-${index}-values`).value.split('/');
		const accessoryImg = inputsContainer.querySelector(`#accessory-${index}-img`).value;
		const accessoryPrice = inputsContainer.querySelector(`#accessory-${index}-price`).value;

		const itemToPush = {
			value: { en: accessoryValues[0], ua: accessoryValues[1] },
			img: accessoryImg,
			price: accessoryPrice
		}
		const newAccessory = await pushDocument(itemToPush, 'accessories/add', 'POST');
		setAccessories(prev => ([...prev, newAccessory]));
	}

	const deleteAccessory = async (item, index) => {
		const res = await pushDocument({ id: item._id }, 'accessories/delete', 'DELETE');
		setAccessories(prev => {
			const tmp = [...prev];
			tmp.splice(index, 1);
			return tmp;
		})
	}

	const patchAccessory = async (event, item, index) => {
		const inputsContainer = event.target.parentNode.previousElementSibling;
		const accessoryValues = inputsContainer.querySelector(`#accessory-${index}-values`).value.split('/');
		const accessoryImg = inputsContainer.querySelector(`#accessory-${index}-img`).value;
		const accessoryPrice = inputsContainer.querySelector(`#accessory-${index}-price`).value;

		const itemToPush = {
			_id: item._id,
			value: { en: accessoryValues[0], ua: accessoryValues[1] },
			img: accessoryImg,
			price: accessoryPrice
		}
		const newAccessory = await pushDocument(itemToPush, 'accessories/update', 'PATCH');
		setAccessories(prev => {
			const tmp = [...prev];
			tmp[index] = newAccessory;
			return tmp;
		});
	}

	const pushBrandModels = models => {
		setBrandModels(prev => {
			const tmp = [...prev];
			tmp.push(...models);
			return tmp;
		})
	}


	const AccessoriesBlock = (props) => <div className='mt-5 p-4 max-w-full flex nowrap items-center overflow-x-auto custom-scrollbar gap-4 rounded-lg bg-slate-300 dark:bg-zinc-700 border-2 border-slate-500 dark:border-zinc-600'>
		{accessories.map((item, index) => {
			return <div className='min-w-36 overflow-hidden p-2 bg-slate-400 dark:bg-zinc-600' key={`accessory-${index}`}>
				<div className='relative align-center'>
					<img className='max-h-60 object-contain' src={item.img} alt="Accesory img" loading='lazy' />
					<span className="absolute left-0 bottom-0 w-full text-blue-300 dark:text-orange-400 text-center bg-zinc-700/50">{item.value[language]}</span>
				</div>
				<div className='my-2 flex flex-col gap-2'>
					<Input id={`accessory-${index}-values`} defaultValue={`${item.value.en}/${item.value.ua}`} />
					<Input id={`accessory-${index}-img`} defaultValue={item.img} />
					<Input id={`accessory-${index}-price`} defaultValue={item.price} />
				</div>
				<div className="flex flex-wrap w-full justify-around">
					<Button callback={(event) => addAccessory(event, index)}>Add</Button>
					<Button callback={(event) => patchAccessory(event, item, index)}>Update</Button>
					<Button callback={(event) => deleteAccessory(item, index)}>Delete</Button>
				</div>
			</div>
		})}
	</div>

	return (
		<div className="size-full relative">
			<h2 className="dark:text-orange-400">Admin</h2>
			{brandModels && <CarSlides
				setCurrentCar={setCurrentCar}
				brandModels={brandModels}
				pushBrandModels={pushBrandModels}
				selectedBrand={selectedBrand} />}
			{currentCar && <Configurator
				currentCar={currentCar}
				setCurrentCar={setCurrentCar}
				selectedColor={selectedColor}
				setSelectedColor={setSelectedColor}
				brandModels={brandModels}
				setBrandModels={setBrandModels}
				setSelectedBrand={setSelectedBrand}
				selectedComplectIndex={selectedComplectIndex}
				setSelectedComplectIndex={setSelectedComplectIndex}
				adminMode={true} />}
			{accessories.length && <AccessoriesBlock />}
		</div>
	);
};

export default Admin;
