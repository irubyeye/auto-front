import React, { useState } from 'react';

const Account = () => {
	const { purchase, setPurchase } = useState();

	/* function removeFromPurchase(e) {
		const index = e.target.dataset.index;
		setPurchase(prev => [
			...prev.filter(el => el.name != purchase[index].name)
		]);
	} */

	return (
		<div className=''>
			<h2 className="">Acc</h2>
		</div>
	);
};

export default Account;