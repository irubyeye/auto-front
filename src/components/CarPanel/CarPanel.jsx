import React, { useContext, useEffect, useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useFetching } from '../../hooks/useFetching';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import Input from '../../UI/Input';
import { LangContext, servURLContext } from '../../context';
import schemas from './schemas';
import dictionary from './dictionary';
import Button from '../../UI/Button';

const CarPanel = ({ adminMode, currentCar, setCurrentCar }) => {
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);
	const [selectedColorID, setSelectedColorID] = useState(currentCar.colors?.[0]?._id);
	const [optionPacks, setOptionPacks] = useState();

	useEffect(() => {
		setSelectedColorID(currentCar.colors[0]?._id)
	}, [currentCar.colors]);

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

	const MySelect = React.forwardRef(({ value, name, selectHandler, items, fetchHandler, ...props }, forwardedRef) => {
		return <Select.Root value={value} onValueChange={selectHandler} onOpenChange={fetchHandler} {...props} ref={forwardedRef}>
			<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 bg-slate-100 dark:bg-zinc-700 dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400 dark:border-zinc-500" aria-label="car-body-select-trigger">
				<Select.Value className='' placeholder={dictionary[name][language]} />
				<Select.Icon className="">
					<ChevronDownIcon />
				</Select.Icon>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className="overflow-hidden bg-slate-100 dark:bg-zinc-700 rounded-md shadow-xl">
					<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronUpIcon />
					</Select.ScrollUpButton>
					<Select.Viewport className="p-1">
						<Select.Group>
							<Select.Label className="px-6 text-gray-600 dark:text-zinc-400 dark:font-semibold">{dictionary[name][language]}</Select.Label>
							<Select.Separator className="h-px bg-violet-500 m-1" />
							{items?.map((item, itemIndex) => {
								if (typeof item === "string") {
									return <SelectItem value={item} key={`car-body-${item}`}>{item}</SelectItem>
								} else {
									return <SelectItem value={item._id} key={`car-body-${item.name}`}>{item.name}</SelectItem>
								}
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

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		setOptionPacks(data);
	});

	const pushCar = async (endpoint, method) => {
		const res = await pushDocument(currentCar, endpoint, method);
		if (method === 'DELETE') return setCurrentCar(schemas.car);
		if (method === 'POST') return setCurrentCar(res);
	}

	const setPack = (value) => {
		const selectedPack = optionPacks.find(pack => pack._id === value);
		console.log(selectedPack);
		selectedPack.features.map(feature => {

		});
	}

	const handleOptions = () => {
		if (!optionPacks) {
			fetchDocument(`optionPacks/getAvailable?id=${currentCar._id}`);
		}
	}

	return (
		<div className="p-4 flex flex-wrap dark:text-slate-300 dark:font-semibold">
			<ImageSlider images={[]} className="md:basis-1/2" />
			<Form.Root className='flex flex-wrap gap-4 size-full md:basis-1/2'>
				{/* поля для всех свойств модели, кроме отфильтрованных */}
				{Object.entries(currentCar)
					.filter(([key, value]) => key !== "img" && key !== "complectations" && key !== "_id" && key !== "__v")
					.map(([key, value], index) => {
						switch (key) {
							case "body":
								return <div className=''>
									<label className='block pb-2' htmlFor='car-body-select'>{dictionary.body[language]}</label>
									<MySelect value={currentCar.body} name={key} selectHandler={value => setCurrentCar(prev => ({ ...prev, body: value }))} items={schemas.bodyTypes} />
								</div>

							case "engineDisplacement":
								return <div className='flex flex-col' key={"car-" + key}>
									<p className='mb-3 self-center'>{dictionary.engineDisplacement[language]}</p>
									<RadioGroup.Root onValueChange={value => setCurrentCar(prev => { return { ...prev, engineDisplacement: value } })} className="flex flex-wrap gap-4" value={currentCar.engineDisplacement} aria-label="Engine displacement">
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500" value="front" id="r1">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r1">{dictionary.front[language]}</label>
										</div>
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500" value="mid" id="r2">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r2">{dictionary.mid[language]}</label>
										</div>
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500" value="rear" id="r3">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r3">{dictionary.rear[language]}</label>
										</div>
									</RadioGroup.Root>
								</div>

							case "colors":
								return <MySelect value={selectedColorID} name={key.slice(0, key.length - 1)} selectHandler={value => setSelectedColorID(currentCar.colors.find(el => el._id === value)._id)} items={currentCar.colors} />

							default: return <Form.Field className='flex flex-col basis-40' name={"car-" + key} key={"car-" + key}>
								{!dictionary[key] && console.log(key)}
								<Form.Label className=''>{`${dictionary[key][language]}:`}</Form.Label>
								<Form.Control asChild>
									<Input className="max-w-full sm:w-40" callback={event => setCurrentCar(prev => ({ ...prev, [key]: +event.target.value || event.target.value }))} type={typeof value} value={value} />
								</Form.Control>
								<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
							</Form.Field>
						}
					})}

				{/* option packs select */}
				<MySelect name="optionPacks" selectHandler={value => setPack(value)} items={optionPacks} fetchHandler={handleOptions} />
				{/* <Select.Root onValueChange={value => setPack(value)} onOpenChange={handleOptions} key="car-color-select">
					<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 bg-slate-100 dark:bg-zinc-700 dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="select-options-trigger">
						<Select.Value placeholder={dictionary.optionPacks[language]} />
						<Select.Icon className="">
							<ChevronDownIcon />
						</Select.Icon>
					</Select.Trigger>

					<Select.Portal>
						<Select.Content className="overflow-hidden bg-slate-100 rounded-md shadow-xl dark:bg-zinc-700">
							<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
								<ChevronUpIcon />
							</Select.ScrollUpButton>
							<Select.Viewport className="p-1">
								<Select.Group>
									<Select.Label className="px-6 text-gray-600 dark:text-zinc-400 dark:font-semibold">{dictionary.optionPacks[language]}</Select.Label>
									<Select.Separator className="h-px bg-violet-500 m-1" />
									{optionPacks?.map((pack, packIndex) => {
										return <SelectItem value={pack._id} key={`select-color-${pack.name}`}>{pack.name}</SelectItem>
									})}
								</Select.Group>
							</Select.Viewport>
							<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
								<ChevronDownIcon />
							</Select.ScrollDownButton>
						</Select.Content>
					</Select.Portal>
				</Select.Root> */}

				{adminMode && <div className='flex gap-2'>
					<Button callback={() => pushCar("models/add", 'POST')}>Add</Button>
					<Button callback={() => pushCar("models/update", 'PATCH')}>Update</Button>
					<Button callback={() => pushCar("models/delete", 'DELETE')}>Delete</Button>
				</div>}
			</Form.Root>
		</div>
	);
};

export default CarPanel;