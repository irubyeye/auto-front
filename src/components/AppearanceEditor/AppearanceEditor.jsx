import React, { useState, useEffect, useContext } from 'react';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext, LangContext, toastNotificationContext } from '../../context';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import dictionary from './dictionary';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import ColorPanel from '../../UI/ColorPanel';
import schemas from '../../utils/schemas';

const AppearanceEditor = ({ adminMode, currentCar, setCurrentCar, appearanceColors, setAppearanceColors, brandModels }) => {
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);
	const { setToast } = useContext(toastNotificationContext);
	const [availableForModels, setAvailableForModels] = useState({ interior: currentCar.interior?.trim?.availableFor || [currentCar._id], exterior: currentCar.exterior?.bumpers?.availableFor || [currentCar._id] });
	const [interiorFeatures, setInteriorFeatures] = useState([]);
	const [exteriorFeatures, setExteriorFeatures] = useState([]);
	const [wheels, setWheels] = useState([]);
	let isLoaded = false;

	const [fetchDocument] = useFetching(async endpoint => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
	});

	const [pushDocument, isPushing, pushError, setPushError] = useFetching(async (document, endpoint, method) => {
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

	// fetch interiors/exteriors
	useEffect(() => {
		if (isLoaded) return
		const load = async () => {
			const fetchedInteriorFeatures = await fetchDocument(`interior-items/getAvailable?id=${currentCar._id}`);
			const fetchedExteriorFeatures = await fetchDocument(`exterior-items/getAvailable?id=${currentCar._id}`);
			const fetchedWheels = await fetchDocument(`wheels/getAvailable?id=${currentCar._id}`);
			setInteriorFeatures(fetchedInteriorFeatures);
			setExteriorFeatures(fetchedExteriorFeatures);
			setWheels(fetchedWheels);

			setCurrentCar(prev => {
				const tmp = { ...prev };

				const handleAppearance = (category, items) => {
					for (const key in tmp[category]) {
						if (key === "_id"/*  || key === "wheels" */) continue;
						if (Array.isArray(tmp[category][key]) && typeof tmp[category][key][0] === 'string') {
							tmp[category][key] = tmp[category][key].map(id => id = items.find(feature => feature._id === id));
						}
						if (typeof tmp[category][key] === 'string') tmp[category][key] = items.find(feature => feature._id === tmp[category][key]);
					}
				}

				handleAppearance("interior", fetchedInteriorFeatures);
				handleAppearance("exterior", fetchedExteriorFeatures);
				return tmp;
			});
			isLoaded = true;
		}
		load();
	}, [currentCar._id]);

	const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
		return (
			<Select.Item className={`flex items-center pr-9 pl-6 relative select-none rounded hover:bg-slate-300 hover:cursor-pointer dark:text-orange-400 dark:hover:bg-zinc-600 ${className}`} {...props} ref={forwardedRef}>
				<Select.ItemText>{children}</Select.ItemText>
				<Select.ItemIndicator className="inline-flex align-center justify-center absolute left-0 w-6 bg-red-500">
					<CheckIcon />
				</Select.ItemIndicator>
			</Select.Item>
		);
	});

	const MySelect = React.forwardRef(({ value, name, category, selectHandler, items, filter, fullInfo, fetchHandler, ...props }, forwardedRef) => {
		return <Select.Root value={value} onValueChange={selectHandler} onOpenChange={fetchHandler} {...props} ref={forwardedRef}>
			<Select.Trigger className={`inline-flex items-center justify-center gap-1 px-1 py-1 w-full bg-transparent border-0  dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400 dark:border-zinc-500 sm:py-0`} aria-label="car-body-select-trigger">
				<Select.Value className='' placeholder={dictionary[name][language]} />
				<Select.Icon className="">
					<ChevronDownIcon />
				</Select.Icon>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className="overflow-hidden bg-slate-100 z-40 dark:bg-zinc-700 rounded-md shadow-xl">
					<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronUpIcon />
					</Select.ScrollUpButton>
					<Select.Viewport className="p-1">
						<Select.Group>
							<Select.Label className="px-6 text-gray-600 dark:text-zinc-400 dark:font-semibold">{dictionary[name][language]}</Select.Label>
							<Select.Separator className="h-px bg-violet-500 m-1" />
							{items?.map((item, itemIndex) => {
								let className = null;
								if (name === 'availableFor' && availableForModels[category].some(id => id === item._id)) {
									className = "!bg-green-400 dark:!bg-green-800 dark:!text-orange-400 dark:font-semibold";
								}
								return <SelectItem className={className} value={item._id} key={`appearance-${category}-${name}-${item._id}`}>
									{Object.entries(item).filter(filter)?.map(entry => entry[0] === "price" ? `${dictionary.price[language]}: ${entry[1]};` : `${entry[1][language] || entry[1]}; `)}
								</SelectItem>
							})}
						</Select.Group>
					</Select.Viewport>
					<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	})

	const SectionAvailableFor = ({ category }) => <div className='md:basis-56 py-2'>
		<span className='font-semibold'>{dictionary.availableFor[language]}</span>
		<div className='basis-1/5 flex py-2'>
			<Checkbox.Root
				onCheckedChange={isChecked => handleCheck(isChecked, category)}
				className="flex items-center justify-center bg-white dark:bg-zinc-500 size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 dark:hover:bg-zinc-400 focus:shadow-[0_0_0_2px_black]"
				defaultChecked
				id="interior-availableFor-checkbox"
			>
				<Checkbox.Indicator className="text-violet-600 dark:text-orange-400">
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
			<label className="pl-2" htmlFor="interior-availableFor-checkbox">
				{dictionary.thisCar[language]}
			</label>
		</div>
		<MySelect
			value={currentCar._id}
			name="availableFor"
			category={category}
			selectHandler={value => setAvailableForModels(prev => {
				const tmp = { ...prev };
				const duplicateIndex = tmp[category].findIndex(id => id === value);
				duplicateIndex >= 0 ?
					tmp[category].splice(duplicateIndex, 1) :
					tmp[category].push(value);
				return tmp;
			})}
			items={brandModels}
			filter={entry => entry[0] === "brand" || entry[0] === "model"}
			fullInfo={false}
		/>
	</div>

	const SectionItem = ({ category, slot, placeholder, providedIndexInArray, providedIndexInCar }) => {
		const [items, setItems] = category === "interior" ?
			[interiorFeatures, setInteriorFeatures] :
			[exteriorFeatures, setExteriorFeatures];

		const handleItems = async (event, category, slot, items, setItems, currentItemIndex, endpoint, method) => {
			if (pushError) setPushError(null);
			const inputContainer = event.target.parentNode.parentNode;
			const itemInput = inputContainer.querySelector(`#${category}-input-${slot}`);
			const itemPriceInput = inputContainer.querySelector(`#${category}-${slot}-price`);

			if (method === "DELETE") {
				const res = await pushDocument({ id: items[currentItemIndex]._id }, endpoint, method);
				if (!res.errors) setToast({ title: 'Delete success' });
				setCurrentCar(prev => {
					const tmp = { ...prev };
					if (slot !== 'features') {
						tmp[category][slot] = items[0] || null;
						return tmp;
					}

					tmp[category].features.splice(providedIndexInCar, 1);
					return tmp;
				})

				return setItems(prev => {
					const tmp = [...prev];
					tmp.splice(currentItemIndex, 1);
					return tmp;
				});
			}

			// min 3 letters for each lang, separated by /, ignoring register
			const regexp = /[A-Z]{3}\/[А-ЩЬЮЯҐЄІЇ]{3}/i;
			if (itemInput.value.length && !regexp.test(itemInput.value)) return setPushError({ displayLabel: `${category}-${slot}-btns`, msg: "Incorrect value" });
			if (itemPriceInput.value < 0) return setPushError({ displayLabel: `${category}-${slot}-btns`, msg: "Incorrect price" });

			const newItem = {
				availableFor: availableForModels[category],
				type: slot,
				value: {
					en: itemInput.value.split('/')?.[0] || currentCar[category][slot].value.en,
					ua: itemInput.value.split('/')?.[1] || currentCar[category][slot].value.ua
				},
				price: +itemPriceInput.value
			}

			if (category === 'interior' && slot !== "features") {
				const itemColors = Array.from(inputContainer.querySelector("#interior-" + slot + "-colors").children).map(color => color = color.value);
				newItem.colors = itemColors;
			}

			if (method === "PATCH") {
				newItem._id = items[currentItemIndex]._id;
				const result = await pushDocument(newItem, endpoint, method);
				if (!result.errors) setToast({ title: 'Update success' });
				setItems(prev => {
					const tmp = [...prev];
					tmp[currentItemIndex] = newItem;
					return tmp;
				})
				return setCurrentCar(prev => {
					const tmp = { ...prev };
					Array.isArray(tmp[category][slot]) ?
						tmp[category][slot][providedIndexInCar] = newItem :
						tmp[category][slot] = newItem;
					return tmp;
				});
			}

			// method === "POST"
			const response = await pushDocument(newItem, endpoint, method);
			if (!response.errors) setToast({ title: 'Saved succesfully' });
			const tmp = { ...currentCar };

			for (let complect of tmp.complectations) {
				if (typeof complect !== 'string') complect = complect._id;
			}

			// no revelant field || empty field || item doesn't exist (deleted last available & not replaced)
			if (!tmp[category] || !tmp[category][slot] || !tmp[category][slot].length || !items.some(item => item._id === tmp[category][slot]?.[currentItemIndex]?._id)) {
				// if no prev => update car (slot "features" = array, others = string)
				Array.isArray(tmp[category][slot]) ? tmp[category][slot].push(response) : tmp[category][slot] = response;
				pushDocument(tmp, '/models/update', "PATCH");
			} else { // if prev, only select new item
				Array.isArray(tmp[category][slot]) ? tmp[category][slot].push(response) : tmp[category][slot] = response;
			}
			setCurrentCar(tmp);
			setItems(prev => [...prev, response]);
		}

		// in case of features index is provided
		let itemIndexInArray = providedIndexInArray || items.findIndex(item => item._id === currentCar[category]?.[slot]?._id);

		let defaultInputs = { value: '', price: 0 };
		if (currentCar[category]?.[slot] && typeof currentCar[category]?.[slot] !== 'string') {
			if (!Array.isArray(currentCar[category][slot])) {
				if (!currentCar[category][slot].value) console.log(slot);
				defaultInputs.value = Object.values(currentCar[category][slot].value).join('/');
				defaultInputs.price = currentCar[category][slot].price;
			} else if (providedIndexInCar < currentCar[category][slot].length) {
				defaultInputs.value = Object.values(currentCar[category][slot][providedIndexInCar].value).join('/');
				defaultInputs.price = currentCar[category][slot][providedIndexInCar].price;
			}
		}

		return <div className='md:basis-56 flex flex-col'>
			<label className='text-slate-600 dark:text-orange-400' htmlFor={category + "-select-" + slot}>{dictionary[slot][language]}</label>
			{/* renders "0" if no length */}
			{items.length &&
				<div className='flex'>
					<MySelect
						defaultValue={items[itemIndexInArray]?._id}
						name={category}
						category={category}
						selectHandler={id => {
							setCurrentCar(prev => {
								const tmp = { ...prev };
								if (slot !== 'features') {
									tmp[category][slot] = items.find(item => item._id === id);
									return tmp;
								}

								const duplicateIndex = tmp[category].features.findIndex(feature => feature?._id === id);
								if (duplicateIndex >= 0) tmp[category].features.splice(duplicateIndex, 1);

								if (providedIndexInCar <= tmp[category].features.length) {
									tmp[category].features[providedIndexInCar] = items.find(item => item._id === id);
								} else {
									tmp[category].features.push(items.find(item => item._id === id));
								}
								return tmp;
							})
						}}
						items={items.filter(item => item.type === slot)}
						filter={entry => entry[0] === "value" || entry[0] === "price"}
						fullInfo={false}
						setItems={setItems}
						id={category + "-select-" + slot}
					/>
					{(category === "interior" && slot !== "features") && <ColorPanel adminMode={false} category={"interior"} slot={slot} providedColors={items.find(item => item._id === currentCar[category][slot]?._id)?.colors} appearanceColors={appearanceColors} setAppearanceColors={setAppearanceColors} />}
				</div>
			}
			{adminMode &&
				<div className=''>
					{/* newItem */}
					<div>
						<label className='text-slate-600 dark:text-zinc-400' htmlFor="interior-input-trim">{dictionary.langInstruction[language]}</label>
						<div className='flex'>
							<Input className="mr-2" id={category + "-input-" + slot} placeholder={placeholder} defaultValue={defaultInputs.value} />
							{(category === "interior" && slot !== "features") && <ColorPanel adminMode={adminMode} category={"interior"} slot={slot} providedColors={items.find(item => item._id === currentCar[category][slot]?._id)?.colors} />}
						</div>
					</div>
					{/* price */}
					<div>
						<label className='text-slate-600 dark:text-zinc-400' htmlFor={category + "-" + slot + "-price"}>{dictionary.price[language]}</label>
						<Input id={category + "-" + slot + "-price"} defaultValue={defaultInputs.price} type="number" />
					</div>

					<div className='flex flex-wrap my-2 justify-around'>
						{pushError?.displayLabel === (category + "-" + slot + "-btns") && <span className='text-center basis-full shrink-0 text-red-500' id={category + slot + "-btns"}>{pushError.msg}</span>}
						<Button callback={event => handleItems(event, category, slot, items, setItems, itemIndexInArray, `${category}-items/add`, 'POST')}>Save</Button>
						<Button callback={event => handleItems(event, category, slot, items, setItems, itemIndexInArray, `${category}-items/update`, 'PATCH')}>Update</Button>
						<Button callback={event => handleItems(event, category, slot, items, setItems, itemIndexInArray, `${category}-items/delete`, 'DELETE')}>Delete</Button>
					</div>
				</div>
			}
		</div>
	}

	const FeatureSection = ({ category }) => {
		const newItem = schemas.appearanceItem;
		newItem.type = "features";
		if (category === "exterior") delete newItem.colors;
		const features = category === "interior" ? interiorFeatures : exteriorFeatures;
		const [currentItemIndex, setCurrentItemIndex] = useState(0);
		const featureIndexInArray = features.findIndex(feature => feature._id === currentCar[category].features[currentItemIndex]?._id);

		return <div className='relative md:basis-56'>
			<span className='text-slate-600 dark:text-orange-400'>{dictionary.features[language]}</span>
			{currentCar[category] && <Popover.Root>
				<Popover.Anchor className="p-2 max-h-36 flex grow flex-wrap gap-4 overflow-y-auto custom-scrollbar">
					{[...currentCar[category]?.features, newItem].map((item, index) => {
						return <Popover.Trigger onClick={() => setCurrentItemIndex(index)} className='py-1 px-2 size-fit bg-slate-400 dark:bg-zinc-600 rounded border-2 border-slate-500 dark:border-orange-400 duration-100 hover:scale-110 hover:cursor-pointer' key={`feature-popover-trigger-${index}`}>
							{item.value.en.length ?
								<p className='text-slate-700 dark:text-orange-400'>{item.value?.[language]}</p> :
								<PlusIcon className='text-slate-700 dark:text-orange-400' />}
						</Popover.Trigger>
					})}
				</Popover.Anchor>
				<Popover.Portal>
					<Popover.Content className='rounded p-4 bg-slate-300 border-2 border-slate-500 dark:border-orange-400 dark:bg-zinc-700 z-20'>
						<Popover.Close asChild><Cross1Icon className='text-slate-700 dark:text-orange-400 float-right' /></Popover.Close>
						<Popover.Arrow className='fill-slate-100' />
						<SectionItem category={category} slot="features" placeholder="new feature/нова опція" providedIndexInArray={featureIndexInArray} providedIndexInCar={currentItemIndex} />
						<Button callback={() => setCurrentCar(prev => {
							const tmp = { ...prev };
							tmp[category].features.splice(currentItemIndex, 1);
							return tmp;
						})}>{dictionary.uninstall[language]}</Button>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>}
		</div>
	}

	const handleCheck = (isChecked, category) => {
		setAvailableForModels(prev => {
			const tmp = { ...prev };
			const currentIDIndex = tmp[category].findIndex(id => id === currentCar._id);
			currentIDIndex >= 0 ?
				tmp[category].splice(currentIDIndex) :
				tmp[category].push(currentCar._id);
			return tmp;
		})
	}

	const handleWheels = async (event, endpoint, method) => {
		if (pushError) setPushError(null);
		const inputContainer = event.target.parentNode.parentNode;
		let newManufacturer = inputContainer.querySelector("#exterior-wheels-mm").value.split("/")[0];
		let newModel = inputContainer.querySelector("#exterior-wheels-mm").value.split("/")[1];
		let newType = inputContainer.querySelector('#exterior-wheels-type').value;
		let newDiameter = +inputContainer.querySelector('#exterior-wheels-diameter').value;
		let newColors = Array.from(inputContainer.querySelector('#exterior-wheels-colors').children).map(color => color = color.value);
		let newPrice = +inputContainer.querySelector('#exterior-wheels-price').value;
		let currentItemIndex = wheels.findIndex(wheel => wheel._id === currentCar.exterior.wheels?._id);

		if (method === "DELETE") {
			const tmp = { ...currentCar };
			tmp.exterior.wheels = wheels[0] || null;
			const res = await pushDocument(tmp, '/models/update', "PATCH");
			if (!res.errors) setToast({ title: 'Delete success' });
			pushDocument({ id: wheels[currentItemIndex]._id }, `/wheels/delete`, 'DELETE');
			setCurrentCar(tmp);
			return setWheels(prev => {
				const tmp = [...prev];
				tmp.splice(currentItemIndex, 1);
				return tmp;
			});
		}

		if (!newManufacturer || !newManufacturer.length) {
			if (currentCar.exterior.wheels.manufacturer) {
				newManufacturer = currentCar.exterior.wheels.manufacturer;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect manufacturer" });
			}
		}
		if (!newModel || !newModel.length) {
			if (currentCar.exterior.wheels.model) {
				newModel = currentCar.exterior.wheels.model;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect model" });
			}
		}
		if (!newType || !newType.length) {
			if (currentCar.exterior.wheels.type) {
				newType = currentCar.exterior.wheels.type;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect type" });
			}
		}
		if (!newColors || !newColors.length) {
			if (currentCar.exterior.wheels.colors) {
				newColors = currentCar.exterior.wheels.colors;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect colors" });
			}
		}
		if (newDiameter <= 0) {
			if (currentCar.exterior.wheels.diameter) {
				newDiameter = currentCar.exterior.wheels.diameter;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect diameter" });
			}
		}
		if (newPrice < 0) {
			if (currentCar.exterior.wheels.price) {
				newPrice = currentCar.exterior.wheels.price;
			} else {
				return setPushError({ displayLabel: 'exterior-wheels-btns', msg: "Incorrect price" });
			}
		}

		const newWheel = {
			_id: currentCar.exterior.wheels?._id,
			availableFor: availableForModels.exterior,
			manufacturer: newManufacturer,
			model: newModel,
			type: newType,
			diameter: newDiameter,
			colors: newColors,
			price: newPrice
		}

		const response = await pushDocument(newWheel, endpoint, method);

		if (!response.errors) setToast({ title: "Success" });

		if (method === "PATCH") {
			setCurrentCar(prev => {
				const tmp = { ...prev };
				tmp.exterior.wheels = response;
			})
			return setWheels(prev => {
				const tmp = [...prev];
				tmp[currentItemIndex] = response;
				return tmp;
			})
		}

		// method === "POST"
		setWheels(prev => [...prev, response]);
		const tmp = { ...currentCar };

		for (let complect of tmp.complectations) {
			if (typeof complect !== 'string') complect = complect._id;
		}

		if (!currentCar.exterior.wheels || !currentCar.exterior.wheels.length) {
			tmp.exterior.wheels = response;
			pushDocument(tmp, '/models/update', "PATCH");
		} else {
			tmp.exterior.wheels = response;
		}

		setCurrentCar(tmp);
	}

	return (
		<div className='p-4'>
			{/* interior section */}
			<div className='flex flex-col border-2 border-zinc-500 rounded-md shadow'>
				<span className='basis-full py-2 text-center bg-blue-300 dark:bg-orange-400'>{dictionary.interior[language]}</span>
				<div className='flex flex-wrap gap-x-4 p-2'>
					{adminMode && <SectionAvailableFor category="interior" />}
					<SectionItem category="interior" slot="trim" placeholder="wood/дерево" />
					<SectionItem category="interior" slot="seatings" placeholder="fabric/тканина" />
					<FeatureSection category="interior" />
				</div>
			</div>

			{/* exterior section */}
			<div className='flex flex-col border-2 border-zinc-500 rounded-md shadow'>
				<span className='basis-full py-2 text-center bg-blue-300 dark:bg-orange-400'>{dictionary.exterior[language]}</span>
				<div className='flex flex-wrap gap-x-4 p-2'>
					{adminMode && <SectionAvailableFor category="exterior" />}
					<SectionItem category="exterior" slot="bumpers" placeholder="stock/заводський" />
					<SectionItem category="exterior" slot="spoiler" placeholder="none/без спойлера" />

					{/* wheels */}
					<div className="flex flex-col md:basis-56">
						<label className='text-slate-600 dark:text-orange-400' htmlFor="exterior-select-wheels">{dictionary.wheels[language]}</label>
						<div className='flex gap-2'>
							{wheels.length && <MySelect
								defaultValue={wheels.find(wheel => wheel._id === currentCar.exterior.wheels?._id)?._id}
								name="wheels"
								category="wheels"
								selectHandler={value => setCurrentCar(prev => {
									const tmp = { ...prev };
									tmp.exterior.wheels = wheels.find(wheel => wheel._id === value);
									return tmp;
								})}
								items={wheels}
								filter={entry => entry[0] !== "availableFor" && entry[0] !== "_id" && entry[0] !== "__v" && entry[0] !== "colors"}
								fullInfo={false}
								setItems={setWheels}
								id="exterior-select-wheels"
							/>}
							{wheels.length && <ColorPanel adminMode={adminMode} category='exterior' slot='wheels' providedColors={wheels.find(wheel => wheel._id === currentCar.exterior?.wheels?._id)?.colors} appearanceColors={appearanceColors} setAppearanceColors={setAppearanceColors} />}
						</div>
						{/* inputs */}
						{adminMode &&
							<div className=''>
								{/* manufacturer/Model */}
								<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-mm">{dictionary.manufacturer[language] + "/" + dictionary.model[language]}</label>
								<Input className="mr-2" id="exterior-wheels-mm" defaultValue={currentCar.exterior?.wheels ? `${currentCar.exterior.wheels.manufacturer}/${currentCar.exterior.wheels.model}` : ""} placeholder={dictionary.manufacturer[language] + "/" + dictionary.model[language]} />
								{/* type */}
								<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-type">{dictionary.type[language]}</label>
								<Input className="mr-2" id="exterior-wheels-type" defaultValue={currentCar.exterior?.wheels?.type || ""} placeholder={dictionary.type[language]} />
								<div className="flex gap-2 items-end">
									<div className="">
										{/* diameter */}
										<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-diameter">{dictionary.diameter[language]}</label>
										<Input className="mr-2" id="exterior-wheels-diameter" defaultValue={currentCar.exterior?.wheels?.diameter || 0} type="number" />
									</div>
									<div className="">
										{/* colors */}
										<ColorPanel adminMode={true} category="exterior" slot="wheels" providedColors={wheels.find(wheel => wheel._id === currentCar.exterior?.wheels)?.colors} appearanceColors={appearanceColors} setAppearanceColors={setAppearanceColors} />
									</div>
									<div className="">
										{/* price */}
										<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-price">{dictionary.price[language]}</label>
										<Input id="exterior-wheels-price" defaultValue={currentCar.exterior?.wheels?.price || 0} type="number" />
									</div>
								</div>

								<div className='flex flex-wrap my-2 justify-around'>
									{pushError?.displayLabel === "exterior-wheels-btns" && <span className='text-center basis-full shrink-0 text-red-500' id="exterior-wheels-btns">{pushError.msg}</span>}
									{<Button callback={event => handleWheels(event, 'wheels/add', 'POST')}>Save</Button>}
									{<Button callback={event => handleWheels(event, `wheels/update`, 'PATCH')}>Update</Button>}
									{<Button callback={event => handleWheels(event, `wheels/delete`, 'DELETE')}>Delete</Button>}
								</div>
							</div>
						}
					</div>
					<FeatureSection category="exterior" />
				</div>
			</div>
		</div>
	);
};

export default AppearanceEditor;