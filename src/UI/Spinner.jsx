import React from 'react';

const Spinner = (props) => {
	return (
		<div className='flex justify-center items-center static size-full top-0 left-0 bg-neutral-500 dark:bg-slate-800 z-auto'>
			<div className='size-10 border-4 border-dotted border-orange-400 rounded-full animate-spin'>
			</div>
		</div>
	);
};

export default Spinner;
