import React, { useState, useEffect, useContext } from 'react';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext, LangContext } from '../../context';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import dictionary from './dictionary';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import ColorPanel from '../../UI/ColorPanel';

const AppearanceEditor = ({ adminMode, currentCar, setCurrentCar, appearanceColors, setAppearanceColors, brandModels, setBrandModels }) => {
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);
	const [interiorFeatures, setInteriorFeatures] = useState([]);
	const [exteriorFeatures, setExteriorFeatures] = useState([]);
	const [wheels, setWheels] = useState([]);
	let isLoaded = false;

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async (endpoint, stateSetter) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		console.log(data);
		stateSetter(data);
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
		if (currentCar._id) (async () => {
			await fetchDocument(`interior-items/getAvailable?id=${currentCar._id}`, setInteriorFeatures);
			await fetchDocument(`exterior-items/getAvailable?id=${currentCar._id}`, setExteriorFeatures);
			await fetchDocument(`wheels/getAvailable?id=${currentCar._id}`, setWheels);
			isLoaded = true;
		})();
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
							{items?.map((item, itemIndex) =>
								<SelectItem value={item._id} key={`appearance-${category}-${name}-${item._id}`}>
									{Object.entries(item).filter(filter)?.map(entry => `${fullInfo ? entry[0] + ": " : ""}${entry[1][language] || entry[1]}; `)}
								</SelectItem>)}
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
			// selectHandler={}
			items={brandModels}
			filter={entry => entry[0] === "brand" || entry[0] === "model"}
			fullInfo={false}
			setItems={setBrandModels}
		/>
	</div>

	const SectionItem = ({ category, slot, placeholder }) => {
		const [items, setItems] = category === "interior" ?
			[interiorFeatures, setInteriorFeatures] :
			[exteriorFeatures, setExteriorFeatures];

		let currentItemIndex = items.findIndex(item => item._id === currentCar[category]?.[slot]);

		return <div className='md:basis-56 flex flex-col'>
			<label className='text-slate-600 dark:text-orange-400' htmlFor={category + "-select-" + slot}>{dictionary[slot][language]}</label>
			{/* renders "0" if no length */}
			{items.length &&
				<div className='flex'>
					<MySelect
						defaultValue={items[currentItemIndex]?._id}
						name={category}
						category={category}
						selectHandler={value => currentItemIndex = items.findIndex(item => item._id === value)}
						items={items.filter(item => item.type === slot)}
						filter={entry => entry[0] === "value" || entry[0] === "price"}
						fullInfo={false}
						setItems={setItems}
						id={category + "-select-" + slot}
					/>
					{category === "interior" && <ColorPanel adminMode={false} category={"interior"} slot={slot} providedColors={items.find(item => item._id === currentCar.interior?.[slot])?.colors} appearanceColors={appearanceColors} setAppearanceColors={setAppearanceColors} />}
				</div>
			}
			{adminMode &&
				<div className=''>
					{/* newItem */}
					<div>
						<label className='text-slate-600 dark:text-zinc-400' htmlFor="interior-input-trim">{dictionary.langInstruction[language]}</label>
						<div className='flex'>
							<Input className="mr-2" id={category + "-input-" + slot} placeholder={placeholder} />
							{category === "interior" && <ColorPanel adminMode={adminMode} category={"interior"} slot={slot} providedColors={items.find(item => item._id === currentCar.interior?.[slot])?.colors} />}
						</div>
					</div>
					{/* price */}
					<div>
						<label className='text-slate-600 dark:text-zinc-400' htmlFor={category + "-" + slot + "-price"}>{dictionary.price[language]}</label>
						<Input id={category + "-" + slot + "-price"} defaultValue={0} type="number" />
					</div>

					<div className='flex flex-wrap my-2 justify-around'>
						{pushError?.displayLabel === (category + "-" + slot + "-btns") && <span className='text-center basis-full shrink-0 text-red-500' id={category + slot + "-btns"}>{pushError.msg}</span>}
						<Button callback={event => handleItems(event, category, slot, items, setItems, currentItemIndex, `${category}-items/add`, 'POST')}>Save</Button>
						<Button callback={event => handleItems(event, category, slot, items, setItems, currentItemIndex, `${category}-items/update`, 'PATCH')}>Update</Button>
						<Button callback={event => handleItems(event, category, slot, items, setItems, currentItemIndex, `${category}-items/delete`, 'DELETE')}>Delete</Button>
					</div>
				</div>
			}
		</div>
	}

	const handleItems = async (event, category, slot, items, setItems, currentItemIndex, endpoint, method) => {
		if (pushError) setPushError(null);
		const inputContainer = event.target.parentNode.parentNode;
		const itemInput = inputContainer.querySelector(`#${category}-input-${slot}`);
		const itemPriceInput = inputContainer.querySelector(`#${category}-${slot}-price`);

		if (method === "DELETE") {
			if (items[currentItemIndex]._id === currentCar[category][slot]) {
				const tmp = { ...currentCar };
				tmp[category][slot] = items[0]._id;
				pushDocument(tmp, '/models/update', "PATCH");
				setCurrentCar(tmp);
			}
			// const res = pushDocument(document, endpoint, method);
			return setItems(prev => {
				const tmp = [...prev];
				tmp.splice(currentItemIndex, 1);
				return tmp;
			});
		}

		// min 3 letters for each lang, separated by /, ignoring register
		const regexp = /[A-Z]{3}\/[А-ЩЬЮЯҐЄІЇ]{3}/i;
		if (!regexp.test(itemInput.value)) return setPushError({ displayLabel: `${category}-${slot}-btns`, msg: "Incorrect value" });
		if (itemPriceInput.value < 0) return setPushError({ displayLabel: `${category}-${slot}-btns`, msg: "Incorrect price" });

		const newItem = {
			availableFor: [currentCar._id],
			type: slot,
			value: {
				en: itemInput.value.split('/')[0],
				ua: itemInput.value.split('/')[1]
			},
			price: +itemPriceInput.value
		}

		if (category === 'interior') {
			const itemColors = Array.from(inputContainer.querySelector("#interior-" + slot + "-colors").children).map(color => color = color.value);
			newItem.colors = itemColors;
		}

		const response = await pushDocument(newItem, endpoint, method);

		if (method === "PATCH") {
			return setItems(prev => {
				const tmp = [...prev];
				tmp[currentItemIndex] = response;
				return tmp;
			})
		}

		// method === "POST"
		const tmp = { ...currentCar };

		if (!tmp[category][slot] || !tmp[category][slot].length) {
			// if no prev => update car
			tmp[category][slot] = response._id;
			pushDocument(tmp, '/models/update', "PATCH");
		} else { // if prev, only select new item on front
			tmp[category][slot] = response._id;
		}
		setCurrentCar(tmp);
		setItems(prev => [...prev, response]);
	}

	const handleCheck = (isChecked, category) => {
		console.log(category);
	}

	const handleWheels = async (event, endpoint, method) => {
		if (pushError) setPushError(null);
		const inputContainer = event.target.parentNode.parentNode;
		const newManufacturer = inputContainer.querySelector("#exterior-wheels-mm").value.split("/")[0];
		const newModel = inputContainer.querySelector("#exterior-wheels-mm").value.split("/")[1];
		const newType = inputContainer.querySelector('#exterior-wheels-type').value;
		const newDiameter = +inputContainer.querySelector('#exterior-wheels-diameter').value;
		const newColors = Array.from(inputContainer.querySelector('#exterior-wheels-colors').children).map(color => color = color.value);
		const newPrice = +inputContainer.querySelector('#exterior-wheels-price').value;
		const currentItemIndex = wheels.findIndex(wheel => wheel._id === currentCar.exterior.wheels);

		if (method === "DELETE") {
			if (wheels[currentItemIndex]._id === currentCar.exterior.wheels) {
				const tmp = { ...currentCar };
				tmp.exterior.wheels = wheels[0]._id;
				pushDocument(tmp, '/models/update', "PATCH");
				setCurrentCar(tmp);
			}



			return setWheels(prev => {
				const tmp = [...prev];
				tmp.splice(currentItemIndex, 1);
				return tmp;
			});
		}

		if (!newManufacturer || !newManufacturer.length) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Manufacturer" });
		if (!newModel || !newModel.length) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Model" });
		if (!newType || !newType.length) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Type" });
		if (newDiameter <= 0) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Diameter" });
		if (!newColors || !newColors.length) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Colors" });
		if (newPrice < 0) return setPushError({ displayLabel: `exterior-wheels-btns`, msg: "Incorrect Price" });

		const newWheel = {
			_id: currentCar.exterior.wheels,
			availableFor: [currentCar._id],
			manufacturer: newManufacturer,
			model: newModel,
			type: newType,
			diameter: newDiameter,
			colors: newColors,
			price: newPrice
		}

		const response = await pushDocument(newWheel, endpoint, method);

		if (method === "PATCH") {
			return setWheels(prev => {
				const tmp = [...prev];
				tmp[currentItemIndex] = response;
				return tmp;
			})
		}

		// method === "POST"
		setWheels(prev => [...prev, response]);
		const tmp = { ...currentCar };

		if (!currentCar.exterior.wheels || !currentCar.exterior.wheels.length) {
			tmp.exterior.wheels = response._id;
			pushDocument(tmp, '/models/update', "PATCH");
		} else {
			tmp.exterior.wheels = response._id;
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
					{/* features */}
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
						{wheels.length && <MySelect
							defaultValue={wheels.find(wheel => wheel._id === currentCar.exterior.wheels)._id}
							name="wheels"
							category="wheels"
							selectHandler={value => setCurrentCar(prev => {
								const tmp = { ...prev };
								tmp.exterior.wheels = value;
								return tmp;
							})}
							items={wheels}
							filter={entry => entry[0] !== "availableFor" && entry[0] !== "_id" && entry[0] !== "__v" && entry[0] !== "colors"}
							fullInfo={false}
							setItems={setWheels}
							id="exterior-select-wheels"
						/>}
						{adminMode &&
							<div className=''>
								{/* manufacturer/Model */}
								<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-mm">{dictionary.manufacturer[language] + "/" + dictionary.model[language]}</label>
								<Input className="mr-2" id="exterior-wheels-mm" placeholder={dictionary.manufacturer[language] + "/" + dictionary.model[language]} />
								{/* type */}
								<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-type">{dictionary.type[language]}</label>
								<Input className="mr-2" id="exterior-wheels-type" placeholder={dictionary.type[language]} />
								<div className="flex gap-2 items-end">
									<div className="">
										{/* diameter */}
										<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-diameter">{dictionary.diameter[language]}</label>
										<Input className="mr-2" id="exterior-wheels-diameter" type="number" />
									</div>
									<div className="">
										{/* colors */}
										<ColorPanel adminMode={adminMode} category="exterior" slot="wheels" providedColors={wheels.find(wheel => wheel._id === currentCar.exterior?.wheels)?.colors} appearanceColors={appearanceColors} setAppearanceColors={setAppearanceColors} />
									</div>
									<div className="">
										{/* price */}
										<label className='text-slate-600 dark:text-zinc-400' htmlFor="exterior-wheels-price">{dictionary.price[language]}</label>
										<Input id="exterior-wheels-price" defaultValue={0} type="number" />
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
					{/* features */}
				</div>
			</div>
		</div>
	);
};

export default AppearanceEditor;