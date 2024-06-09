import React, { useState, useContext, useEffect } from 'react';
import BrandMap from '../../components/BrandMap/BrandMap';
import Configurator from '../../components/Configurator/Configurator';
import { dictionary } from './dictionary';
import { LangContext, servURLContext, UserContext, toastNotificationContext } from '../../context';
import CarSlides from '../../components/CarSlides/CarSlides';
import { useFetching } from '../../hooks/useFetching';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import Button from '../../UI/Button';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import schemas from '../../utils/schemas';

const Mainpage = () => {
	const [accessories, setAccessories] = useState([]);
	const [selectedBrand, setSelectedBrand] = useState(null);
	const [brandModels, setBrandModels] = useState(null);
	const [currentCar, setCurrentCar] = useState(null);
	const [selectedColor, setSelectedColor] = useState(null);
	const [appearanceColors, setAppearanceColors] = useState({ trim: "default", seatings: "default", wheels: "default", });
	const [selectedComplectIndex, setSelectedComplectIndex] = useState(0);
	const [order, setOrder] = useState(null);
	const [orderConfirmation, setOrderConfirmation] = useState(false);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);
	const { user, setUser } = useContext(UserContext);
	const { setToast } = useContext(toastNotificationContext);

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

	const [pushDocument, setPushError] = useFetching(async (document, endpoint, method) => {
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


	// загрузка машин
	useEffect(() => {
		const handleBrandModels = async () => {
			const data = await fetchDocument(`models/getMany?brand=${selectedBrand}&skip=0&limit=4`);
			setBrandModels(data);
		}
		setCurrentCar(schemas.car);
		if (selectedBrand) {
			handleBrandModels();
		} else {
			setBrandModels(null);
			setOrder(null);
		};
	}, [selectedBrand]);

	const pushBrandModels = models => {
		setBrandModels(prev => {
			const tmp = [...prev];
			tmp.push(...models);
			return tmp;
		})
	}

	const createOrder = async () => {
		try {
			const { _id, brand, model, body, engineDisplacement, modelYear, exterior, interior, basePrice } = currentCar;
			if (!accessories.length) {
				const accessories = await fetchDocument('accessories/get');
				setAccessories(accessories);
			}
			const newOrder = {
				client: user._id,
				car: {
					_id,
					img: currentCar.img.find(entry => entry.color === selectedColor),
					brand,
					model,
					body,
					engineDisplacement,
					modelYear,
					exterior,
					interior,
					complectation: currentCar.complectations[selectedComplectIndex],
					appearanceColors,
					basePrice
				},
				accessories: [],
			};
			if (typeof newOrder.car.complectation === 'string') {
				const res = await fetchDocument(`complectations/getOne?id=${newOrder.car.complectation}`);
				newOrder.car.complectation = res[0];
			}
			newOrder.car.complectation.engineIsTurbo = newOrder.car.complectation.engine.turbo;
			let totalPrice = [
				currentCar.basePrice,
				newOrder.car.interior.trim.price,
				newOrder.car.interior.seatings.price,
				newOrder.car.exterior.bumpers.price,
				newOrder.car.exterior.spoiler.price,
				newOrder.car.exterior.wheels.price,
				newOrder.car.complectation.engine.price,
				newOrder.car.complectation.transmission.price,
				newOrder.car.complectation.suspension.price,
			].reduce((total, current) => total += current, 0) +
				newOrder.car.interior.features.reduce((accumulator, currentFeature) => accumulator + currentFeature.price, 0) +
				newOrder.car.exterior.features.reduce((accumulator, currentFeature) => accumulator + currentFeature.price, 0);

			newOrder.totalPrice = totalPrice;
			setOrder(newOrder)
			setOrderConfirmation(true);
		} catch (error) {
			setToast({
				title: error.message,
				description: dictionary.noComplectOrAppearance[language]
			});
		}
	}

	const handleAccessories = passedItem => {
		setOrder(prev => {
			const tmp = { ...prev };
			const targetIndex = tmp.accessories.findIndex(item => item._id === passedItem._id);
			if (targetIndex >= 0) {
				tmp.accessories.splice(targetIndex, 1);
				tmp.totalPrice -= passedItem.price;
			} else {
				tmp.accessories.push(passedItem);
				tmp.totalPrice += passedItem.price;
			}
			return tmp;
		})
	}

	const confirmOrder = async () => {
		setOrderConfirmation(false);
		setToast({ title: dictionary.complete[language] });
		const response = await pushDocument(order, 'orders/create', 'POST');
		if (response.errors) return setToast(response.errors);
		const userUpd = { ...user };
		userUpd.orders.push(response);
		const userUpdResult = await pushDocument(userUpd, 'users/update', 'PATCH');
		if (userUpdResult.errors) return setPushError(userUpdResult.errors);
		setUser(userUpd);
	}

	return (
		<div className='flex flex-col gap-5 sm:px-4 lg:px-16'>
			<h1 className='text-2xl text-slate-800 dark:text-orange-400'>{dictionary.headline[language]}</h1>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.welcome[language]}</p>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.advantages[language]}</p>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.guidance[language]}</p>

			<BrandMap setSelectedBrand={setSelectedBrand} setCurrentCar={setCurrentCar} />
			{brandModels && <CarSlides
				setCurrentCar={setCurrentCar}
				brandModels={brandModels}
				pushBrandModels={pushBrandModels}
				selectedBrand={selectedBrand} />}
			{currentCar?._id && <Configurator
				currentCar={currentCar}
				setCurrentCar={setCurrentCar}
				selectedColor={selectedColor}
				setSelectedColor={setSelectedColor}
				brandModels={brandModels}
				setBrandModels={setBrandModels}
				setSelectedBrand={setSelectedBrand}
				selectedComplectIndex={selectedComplectIndex}
				setSelectedComplectIndex={setSelectedComplectIndex}
				appearanceColors={appearanceColors}
				setAppearanceColors={setAppearanceColors}
				createOrder={createOrder}
				// true only on admin page
				adminMode={false} />}

			{/* confirm order */}
			{order && <Dialog.Root open={orderConfirmation}>
				<Dialog.Portal>
					<Dialog.Overlay className='bg-zinc-700/65 z-30 fixed inset-0' />
					<Dialog.Content onInteractOutside={() => setOrderConfirmation(false)} className='max-w-full md:max-w-md bg-slate-100 z-30 rounded-xl fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] p-6 dark:bg-zinc-700'>
						<Dialog.Close asChild>
							<Cross1Icon onClick={() => setOrderConfirmation(false)} className='float-right cursor-pointer duration-200 dark:text-orange-400 hover:scale-125' />
						</Dialog.Close>
						<Dialog.Title className='mb-3 text-lg font-semibold text-pretty text-slate-600 dark:text-orange-400'>{dictionary.confirmation[language]}</Dialog.Title>
						<ImageSlider slides={currentCar?.img?.find(item => item.color === selectedColor)?.srcset} className='w-44 sm:w-72 lg:w-96' />
						<span className=" block text-slate-600 dark:text-orange-400">{order.car.brand}, {order.car.model}, {order.car.body}</span>
						<span className="mt-5 mb-2 block text-slate-600 dark:text-orange-400">{dictionary.offerAccessories[language]}</span>
						<div className="flex flex-nowrap gap-5 overflow-x-auto custom-scrollbar">
							{accessories.map((item, index) => {
								return <div onClick={() => handleAccessories(item)} className={`relative p-2 max-h-32 min-w-36 overflow-hidden ${order.accessories.some(value => value._id === item._id) && 'bg-green-400'}`} key={`accessory-${index}`}>
									<img className='size-full object-contain' src={item.img} alt="Accesory img" loading='lazy' />
									<span className="absolute left-0 bottom-0 w-full text-blue-300 dark:text-orange-400 text-center bg-zinc-700/50">{item.value[language]}</span>
								</div>
							})}
						</div>
						<span className=" block text-slate-600 dark:text-orange-400">total: {order?.totalPrice}</span>
						<Button callback={confirmOrder}>{dictionary.confirm[language]}</Button>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>}
		</div>
	);
};

export default Mainpage;