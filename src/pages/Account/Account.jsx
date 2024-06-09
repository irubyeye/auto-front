import React, { useContext, useState, useEffect } from 'react';
import Button from '../../UI/Button';
import { PageNavContext, UserContext, LangContext, servURLContext } from '../../context';
import Mainpage from '../Main/Main';
import dictionary from './dictionary';
import { useFetching } from '../../hooks/useFetching';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

const Account = () => {
	const { user, setUser } = useContext(UserContext);
	const { setCurrentPage } = useContext(PageNavContext);
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);

	// get full orders
	useEffect(() => {
		const loadOrders = async () => {
			const orders = await fetchDocument(`/orders/getUserOrders?id=${user._id}`);
			setUser(prev => ({ ...prev, orders }));
		}
		if (user.orders.length) loadOrders();
	}, []);

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

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async endpoint => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
	});

	const logout = () => {
		localStorage.setItem("userToken", "");
		setCurrentPage(<Mainpage />);
		setUser({ roles: ["guest"] });
	}

	const cancelOrder = async (index, id) => {
		const tmpUser = { ...user };
		tmpUser.orders.splice(index, 1);
		setUser(tmpUser);
		const userUpdResult = await pushDocument(tmpUser, 'users/update', 'PATCH');
		const orderDeleteResult = await pushDocument({ id }, 'orders/delete', 'DELETE');
	}

	const handleOrderDetails = event => {
		const detailsNode = event.target.nextElementSibling;
		if (detailsNode.dataset.state === 'open') {
			detailsNode.dataset.state = 'closed';
		} else {
			detailsNode.dataset.state = 'open';
		}
	}

	return (
		<div className='flex flex-col'>
			<h2 className="text-xl dark:text-orange-400">{`${user.username}'s Account`}</h2>
			{user.orders.length ? <div className=''>
				<h3 className="text-lg dark:text-orange-400">{dictionary.orders[language]}</h3>
				<div className='p-5 bg-slate-400 dark:bg-zinc-900 rounded max-h-[70vh] overflow-x-auto custom-scrollbar'>
					{user.orders.map((order, index) => {
						console.log(order.car);
						return <div className='flex flex-col p-2 mb-5 border-2 dark:bg-zinc-800 border-slate-500 dark:border-zinc-600 rounded-lg'>
							<ImageSlider slides={order.car?.img?.srcset} className='h-fit max-w-full md:max-w-[35rem] lg:max-w-[40rem] mx-auto' />
							<span className="block text-lg text-slate-800 dark:text-orange-400">{order.car?.brand}, {order.car?.model}, {order.car?.body}</span>
							<span className="block text-lg text-slate-800 dark:text-orange-400">{dictionary.year[language] + ': ' + order.car?.modelYear}</span>
							<Button callback={event => handleOrderDetails(event)} className='!self-start'>{dictionary.details[language]}</Button>
							<div className="h-0 overflow-y-auto custom-scrollbar duration-100 data-[state=open]:h-48 md:data-[state=open]:h-72" data-state='closed'>
								<p className='dark:text-orange-400'>{
									`${dictionary.maxSpeed[language]}: ${order.car?.complectation?.maxSpeed}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.acceleration[language]}: ${order.car?.complectation?.acceleration}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.engine[language]}: ${order.car?.complectation?.engine?.manufacturer},
									${order.car?.complectation?.engine?.model},
									${dictionary.hp[language]}: ${order.car?.complectation?.engine?.hp},
									${dictionary.volume[language]}: ${order.car?.complectation?.engine?.volume},
									${dictionary.torque[language]}: ${order.car?.complectation?.engine?.torque},
									${dictionary.turbo[language]}: ${order.car?.complectation?.engineIsTurbo ? dictionary.yes[language] : dictionary.no[language]},
									${dictionary.location[language]}: ${order.car?.engineDisplacement},
									${dictionary.price[language]}: ${order.car?.complectation?.engine?.price}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.transmission[language]}:
									${dictionary.type[language]}: ${order.car?.complectation?.transmission?.type},
									${dictionary.drive[language]}: ${order.car?.complectation?.transmission?.drive},
									${dictionary.gears[language]}: ${order.car?.complectation?.transmission?.gears},
									${dictionary.price[language]}: ${order.car?.complectation?.transmission?.price}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.suspension[language]}:
									${dictionary.type[language]}: ${order.car?.complectation?.suspension?.type},
									${dictionary.price[language]}: ${order.car?.complectation?.suspension?.price},`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.trim[language]}: ${order.car?.interior?.trim?.value?.[language]},
									${dictionary.price[language]}: ${order.car?.interior?.trim?.price},
									${dictionary.color[language]}: ${order.car?.appearanceColors?.trim}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.seatings[language]}: ${order.car?.interior?.seatings?.value?.[language]},
									${dictionary.price[language]}: ${order.car?.interior?.seatings?.price},
									${dictionary.color[language]}: ${order.car?.appearanceColors?.seatings}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.bumpers[language]}: ${order.car?.exterior?.bumpers?.value?.[language]},
									${dictionary.price[language]}: ${order.car?.exterior?.bumpers?.price}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.spoiler[language]}: ${order.car?.exterior?.spoiler?.value?.[language]},
									${dictionary.price[language]}: ${order.car?.exterior?.spoiler?.price}`
								}</p>
								<p className='dark:text-orange-400'>{
									`${dictionary.wheels[language]}: ${order.car?.exterior?.wheels?.manufacturer}
									${order.car?.exterior?.wheels?.model},
									${dictionary.type[language]}: ${order.car?.exterior?.wheels?.type},
									${dictionary.diameter[language]}: ${order.car?.exterior?.wheels?.diameter},
									${dictionary.price[language]}: ${order.car?.exterior?.wheels?.price}`
								}</p>
								<p className='dark:text-orange-400'>
									{`${dictionary.features[language]}: `}
									{order.car?.interior?.features?.map(item => {
										return <span>{
											`${item.value?.[language]}, price: ${item?.price}; `
										}</span>
									})}
									{order.car?.exterior?.features?.map(item => {
										return <span>{
											`${item.value?.[language]}, price: ${item?.price}; `
										}</span>
									})}
								</p>
							</div>
							<div className="flex mt-10 flex-nowrap gap-5 overflow-x-auto custom-scrollbar">
								{order.accessories?.map((item, index) => {
									return <div className='relative max-h-32 min-w-36 overflow-hidden' key={`accessory-${index}`}>
										<img className='size-full object-contain' src={item.img} alt="Accesory img" loading='lazy' />
										<span className="absolute left-0 bottom-0 w-full text-blue-300 dark:text-orange-400 text-center bg-zinc-700/50">{item.value[language]}</span>
									</div>
								})}
							</div>
							<span className="block text-lg text-slate-800 dark:text-orange-400">{dictionary.totalPrice[language] + ": " + order?.totalPrice}</span>
							<span className="block text-lg text-slate-800 dark:text-orange-400">{dictionary.status[language] + ": " + order?.status}</span>
							<Button className='' callback={() => cancelOrder(index, order._id)}>{dictionary.cancel[language]}</Button>
						</div>
					})}
				</div>
			</div> :
				<span className='dark:text-orange-400'>{dictionary.noOrders[language]}</span>}
			<Button className="" callback={logout}>Log Out</Button>
		</div>
	);
};

export default Account;