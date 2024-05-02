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
	const [selectedColorID, setSelectedColorID] = useState(currentCar.colors[0]?._id);

	useEffect(() => {
		setSelectedColorID(currentCar.colors[0]?._id)
	}, [currentCar.colors]);

	const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
		return (
			<Select.Item className={`flex items-center pr-9 pl-6 relative select-none rounded ${className}`} {...props} ref={forwardedRef}>
				<Select.ItemText>{children}</Select.ItemText>
				<Select.ItemIndicator className="inline-flex align-center justify-center absolute left-0 w-6 bg-red-500">
					<CheckIcon />
				</Select.ItemIndicator>
			</Select.Item>
		);
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

	const handleCar = async (endpoint, method) => {
		const res = await pushDocument(currentCar, endpoint, method);
		if (method === 'DELETE') return setCurrentCar(schemas.car);
		if (method === 'POST') return setCurrentCar(res);
	}

	return (
		<div className="px-4 flex flex-wrap ">
			<ImageSlider images={[]} className="md:basis-1/2" />
			<Form.Root className='flex flex-wrap gap-4 md:basis-1/2'>
				{/* поля для всех свойств модели, кроме отфильтрованных */}
				{Object.entries(currentCar)
					.filter(([key, value]) => key !== "img" && key !== "complectations" && key !== "_id" && key !== "__v")
					.map(([key, value], index) => {
						switch (key) {
							case "body":
								return <Select.Root value={currentCar.body} /* onValueChange={value => handleSelect(value, setParticles, complectIndex, particleName)} */ /* onOpenChange={() => fetchDocument(`${key}?brand=${currentCar.brand}&model=${currentCar.model}`)} */ key="car-body-select">
									<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="">
										<Select.Value placeholder={dictionary[key][language]} />
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
													<Select.Label className="px-6 text-gray-600">{dictionary[key][language]}</Select.Label>
													<Select.Separator className="h-px bg-violet-500 m-1" />
													{schemas.bodyTypes.map((item, itemIndex) => {
														return <SelectItem value={item} key={`car-body-${item}`}>{item}</SelectItem>
													})}
												</Select.Group>
											</Select.Viewport>
											<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
												<ChevronDownIcon />
											</Select.ScrollDownButton>
										</Select.Content>
									</Select.Portal>
								</Select.Root>

							case "engineDisplacement":
								return <div className='flex flex-col' key={"car-" + key}>
									<p className='mb-3 self-center'>{dictionary.engineDisplacement[language]}</p>
									<RadioGroup.Root onValueChange={value => setCurrentCar(prev => { return { ...prev, engineDisplacement: value } })} className="flex gap-4" value={currentCar.engineDisplacement} aria-label="Engine displacement">
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" value="front" id="r1">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r1">Front</label>
										</div>
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" value="mid" id="r2">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r2">Mid</label>
										</div>
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" value="rear" id="r3">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400" />
											</RadioGroup.Item>
											<label className="pl-3.5" htmlFor="r3">Rear</label>
										</div>
									</RadioGroup.Root>
								</div>

							case "colors":
								return <Select.Root value={selectedColorID} onValueChange={value => setSelectedColorID(currentCar.colors.find(el => el._id === value))} /* onOpenChange={() => fetchDocument(`${key}?brand=${currentCar.brand}&model=${currentCar.model}`)} */ key="car-color-select">
									<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="">
										<Select.Value placeholder={dictionary[key.slice(0, key.length - 1)][language]} />
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
													<Select.Label className="px-6 text-gray-600">{dictionary[key.slice(0, key.length - 1)][language]}</Select.Label>
													<Select.Separator className="h-px bg-violet-500 m-1" />
													{currentCar.colors.map((color, colorIndex) => {
														return <SelectItem value={color._id} key={`select-color-${color.name}`}>{color.name}</SelectItem>
													})}
												</Select.Group>
											</Select.Viewport>
											<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
												<ChevronDownIcon />
											</Select.ScrollDownButton>
										</Select.Content>
									</Select.Portal>
								</Select.Root>

							case "optionPacks":
							/* select of option packs */

							default: return <Form.Field className='flex flex-col basis-full sm:basis-0' name={"car-" + key} key={"car-" + key}>
								<Form.Label className=''>{`${dictionary[key][language]}:`}</Form.Label>
								<Form.Control asChild>
									<Input className="sm:w-40" callback={event => setCurrentCar(prev => ({ ...prev, [key]: +event.target.value || event.target.value }))} type={typeof value} value={value} />
								</Form.Control>
								<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
							</Form.Field>
						}
					})}
				<Button callback={() => handleCar("models/add", 'POST')}>Add</Button>
				<Button callback={() => handleCar("models/update", 'PATCH')}>Update</Button>
				<Button callback={() => handleCar("models/delete", 'DELETE')}>Delete</Button>
			</Form.Root>
		</div>
	);
};

export default CarPanel;