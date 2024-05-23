import React, { useContext, lazy, useState, useEffect } from 'react';
import { Cross1Icon, Half2Icon, PersonIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useFetching } from '../../hooks/useFetching';
import { LangContext, PageNavContext, UserContext, servURLContext } from '../../context';
import dictionary from './dictionary';
import Input from '../../UI/Input';
import Button from '../../UI/Button';

const Main = lazy(() => import('../../pages/Main/Main'));
const Admin = lazy(() => import('../../pages/Admin/Admin'));
const Account = lazy(() => import('../../pages/Account/Account'));

const Header = ({ toggleTheme, isAuthDialogOpen, setIsAuthDialogOpen }) => {
	const { currentPage, setCurrentPage } = useContext(PageNavContext);
	const { language, toggleLang } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);
	const { user, setUser } = useContext(UserContext);
	const [authError, setAuthError] = useState(null);

	const [pages, setPages] = useState([
		[dictionary.main[language], <Main />],
	]);
	const [theme, setTheme] = useState(localStorage.theme || "light");

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

	const handleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else {
			setTheme("light");
		}
		toggleTheme();
	}

	const handleUserAuth = () => {
		if (user.roles[0] === "guest") return setIsAuthDialogOpen(true);

		return setCurrentPage(<Account />);
	}

	const userAuth = async (event, authMethod) => {
		const username = event.target.parentNode.querySelector(`#${authMethod}-username`).value;
		const password = event.target.parentNode.querySelector(`#${authMethod}-password`).value;
		const verifyPass = event.target.parentNode.querySelector(`#${authMethod}-password-verify`)?.value;
		if (authMethod === "registration" && verifyPass !== password) return setAuthError(dictionary.passMatchError[language]);
		const userAuth = await pushDocument({ username, password }, `users/${authMethod}`, 'POST');
		if (userAuth.errors) return setAuthError(userAuth.errors.errors[0].msg);
		if (userAuth.message) return setAuthError(userAuth.message);
		setUser(userAuth.user);
		localStorage.setItem("userToken", userAuth.token);
		setIsAuthDialogOpen(false);
	}

	return (
		<>
			<header className='flex pt-4 px-6 pb-2 bg-slate-400 dark:bg-zinc-900'>
				<h1 className='mx-auto truncate text-3xl font-semibold text-orange-600 dark:text-yellow-700'>Trident Automotive</h1>
				<div className='static top-4 right-10 flex gap-3 items-center sm:absolute'>
					<img className="size-6 duration-100 cursor-pointer hover:scale-110" onClick={toggleLang} src={`./icons/${localStorage.language.toUpperCase()}-flag.svg`} alt={dictionary.language[localStorage.language]} />
					<Half2Icon className='size-8 shrink-0 duration-100 cursor-pointer hover:scale-110 dark:text-slate-100' onClick={handleTheme} />

					<Dialog.Root open={isAuthDialogOpen}>
						<Dialog.Trigger asChild>
							<PersonIcon className='size-8 shrink-0 duration-100 cursor-pointer hover:scale-110 dark:text-slate-100' onClick={handleUserAuth} />
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay className='bg-zinc-700/65 z-30 fixed inset-0' />
							<Dialog.Content onInteractOutside={() => setIsAuthDialogOpen(false)} className='bg-slate-100 z-30 rounded-xl fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] p-6 dark:bg-zinc-700'>

								<Tabs.Root defaultValue={localStorage.getItem("userToken") ? "login" : "registration"}>
									<Dialog.Close asChild>
										<Cross1Icon onClick={() => setIsAuthDialogOpen(false)} className='float-right cursor-pointer duration-200 dark:text-orange-400 hover:scale-125' />
									</Dialog.Close>
									<Tabs.List>
										<Tabs.Trigger className='pr-3 dark:text-orange-400 data-[state=active]:underline' value='registration'>{dictionary.registration[language]}</Tabs.Trigger>
										<Tabs.Trigger className='pr-3 dark:text-orange-400 data-[state=active]:underline' value='login'>{dictionary.login[language]}</Tabs.Trigger>
									</Tabs.List>
									<Tabs.Content value='registration'>
										<div className='py-4'>
											<fieldset>
												<label className='dark: text-zinc-400' htmlFor="registration-username">{dictionary.username[language]}</label>
												<Input id="registration-username" />
											</fieldset>
											<fieldset>
												<label className='dark: text-zinc-400' htmlFor="registration-password">{dictionary.password[language]}</label>
												<Input type="password" id="registration-password" required autocomplete="current-password" />
											</fieldset>
											<fieldset>
												<label className='dark: text-zinc-400' htmlFor="registration-password-verify">{dictionary.passwordVerify[language]}</label>
												<Input type="password" id="registration-password-verify" required autocomplete="current-password" />
											</fieldset>
										</div>
										<span className='block text-red-600'>{authError}</span>
										<Button callback={event => userAuth(event, "registration")} >{dictionary.submit[language]}</Button>
									</Tabs.Content>
									<Tabs.Content value='login'>
										<div className='py-4'>
											<fieldset>
												<label className='dark: text-zinc-400' htmlFor="login-username">{dictionary.username[language]}</label>
												<Input id="login-username" />
											</fieldset>
											<fieldset>
												<label className='dark: text-zinc-400' htmlFor="login-password">{dictionary.password[language]}</label>
												<Input type="password" id="login-password" required autocomplete="current-password" />
											</fieldset>
										</div>
										<span className='block text-red-600'>{authError}</span>
										<Button callback={event => userAuth(event, "login")} >{dictionary.submit[language]}</Button>
									</Tabs.Content>
								</Tabs.Root>

							</Dialog.Content>
						</Dialog.Portal>
					</Dialog.Root>

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