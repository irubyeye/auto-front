import React, { useContext, lazy, useState } from 'react';
import { Half2Icon, PersonIcon } from '@radix-ui/react-icons';
import { LangContext, PageNavContext, UserContext } from '../../context';
import dictionary from './dictionary';

const Main = lazy(() => import('../../pages/Main/Main'));
const Admin = lazy(() => import('../../pages/Admin/Admin'));

const Header = ({ toggleTheme, handleProfileClick }) => {
	const [theme, setTheme] = useState(localStorage.theme || "light");
	const { language, toggleLang } = useContext(LangContext);
	const { setCurrentPage } = useContext(PageNavContext);
	const { user } = useContext(UserContext);
	const pages = [
		[dictionary.main[language], <Main />],
	]

	const handleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else {
			setTheme("light");
		}
		toggleTheme();
	}

	return (
		<>
			<header className='flex pt-4 px-6 pb-2 bg-slate-400 dark:bg-zinc-900'>
				<h1 className='mx-auto truncate text-3xl font-semibold text-blue-600 dark:text-yellow-700'>Trident Automotive</h1>
				<div className='static top-4 right-10 flex gap-3 items-center sm:absolute'>
					<img className="size-6 duration-100 cursor-pointer hover:scale-110" onClick={toggleLang} src={`./icons/${localStorage.language.toUpperCase()}-flag.svg`} alt={dictionary.language[localStorage.language]} />
					<Half2Icon className='size-8 shrink-0 duration-100 cursor-pointer hover:scale-110 dark:text-slate-100' onClick={handleTheme} />
					<PersonIcon className='size-8 shrink-0 duration-100 cursor-pointer hover:scale-110 dark:text-slate-100' onClick={handleProfileClick} />
				</div>
			</header>
			<nav className="flex justify-center sticky bg-blue-200 dark:bg-orange-400 top-0 z-30">
				{pages.map(([title, page], index) => (
					<div className='px-5 py-3 cursor-pointer duration-150 hover:bg-blue-300' onClick={() => setCurrentPage(page)} key={index}>{title}</div>
				))}
				{(user && user.roles.some(role => role === "admin")) && <div className='px-5 py-3 cursor-pointer duration-150 hover:bg-blue-300' onClick={() => setCurrentPage(<Admin />)}>{dictionary.admin[language]}</div>}
			</nav>
		</>
	);
};

export default Header;