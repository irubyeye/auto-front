import React, { useContext, useState } from 'react';
import Button from '../../UI/Button';
import { PageNavContext, UserContext } from '../../context';
import Mainpage from '../Main/Main';

const Account = () => {
	const { purchase, setPurchase } = useState();
	const { user, setUser } = useContext(UserContext);
	const { setCurrentPage } = useContext(PageNavContext);

	/* function removeFromPurchase(e) {
		const index = e.target.dataset.index;
		setPurchase(prev => [
			...prev.filter(el => el.name != purchase[index].name)
		]);
	} */

	const logout = () => {
		localStorage.setItem("userToken", "");
		setCurrentPage(<Mainpage />);
		setUser({ roles: ["guest"] });
	}

	return (
		<div className=''>
			<h2 className="dark:text-orange-400">{`${user.username}'s Account`}</h2>
			<Button callback={logout}>Log Out</Button>
		</div>
	);
};

export default Account;