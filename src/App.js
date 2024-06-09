import { useEffect, useState, Suspense, lazy } from 'react';
import { UserContext, PageNavContext, LangContext, servURLContext, userAuthContext, toastNotificationContext } from './context';
import { register } from 'swiper/element/bundle';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';
import { Cross1Icon } from '@radix-ui/react-icons';
import Main from './pages/Main/Main';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Spinner from './UI/Spinner';
import Input from './UI/Input';
import Button from './UI/Button';
import { useFetching } from './hooks/useFetching';
import dictionary from './dictionary';
const Account = lazy(() => import('./pages/Account/Account'));

const servURL = process.env.REACT_APP_backURL || "http://192.168.0.179:8080/api/" || "http://localhost:8080/api/";
const Languages = {
  en: 'en',
  ua: 'ua'
}
// set language on load
if (!localStorage.language) {
  localStorage.setItem('language', Languages.ua);
}
// set theme on load
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

function App() {
  const [user, setUser] = useState({ roles: ["guest"] });
  const [currentPage, setCurrentPage] = useState(<Main />);
  const [language, setLanguage] = useState(localStorage.language);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [userAuth, isAuthInProcess, authError, setAuthError] = useFetching(async (token) => {
    let res = await fetch(servURL + "users/auth", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
    })
    res = await res.json();
    return res;
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

  // onload init swiper & auth user
  useEffect(() => {
    register(); // swiper

    const userToken = localStorage.getItem("userToken");

    async function handleAuth(token) {
      const res = await userAuth(token);
      // error message = clear token
      if (res.message) {
        return localStorage.setItem("userToken", "");
      }
      const { _id, username, roles, orders, savedComplects } = res;
      setUser({
        _id,
        username,
        roles,
        orders,
        savedComplects
      });
    }

    if (userToken?.length) {
      handleAuth(userToken);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  const toggleLang = () => {
    if (language === "ua") {
      setLanguage(Languages.en);
      localStorage.setItem("language", "en");
    } else {
      setLanguage(Languages.ua);
      localStorage.setItem("language", "ua");
    }
  }

  const handleProfileClick = () => {
    if (user.roles[0] === "guest") return setIsAuthDialogOpen(true);
    return setCurrentPage(<Account />);
  }

  const handleUserAuth = async (event, authMethod) => {
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
    setToast({ title: `${dictionary.greet[language]}, ${userAuth.user.username}` });
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <servURLContext.Provider value={{ servURL }}>
        <LangContext.Provider value={{ language, toggleLang }}>
          <PageNavContext.Provider value={{ currentPage, setCurrentPage }}>
            <userAuthContext.Provider value={{ isAuthDialogOpen, setIsAuthDialogOpen }}>
              <toastNotificationContext.Provider value={{ toast, setToast }}>
                <div className='flex flex-col h-screen'>
                  <Header language={language} toggleLang={toggleLang} toggleTheme={toggleTheme} handleProfileClick={handleProfileClick} />
                  <main className='basis-full grow p-4 bg-cyan-100 dark:bg-zinc-800 relative'>
                    <Suspense fallback={<Spinner />}>
                      {currentPage}
                    </Suspense>
                  </main>
                  {/* user auth */}
                  <Dialog.Root open={isAuthDialogOpen}>
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
                            <Button callback={event => handleUserAuth(event, "registration")} >{dictionary.submit[language]}</Button>
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
                            <Button callback={event => handleUserAuth(event, "login")} >{dictionary.submit[language]}</Button>
                          </Tabs.Content>
                        </Tabs.Root>

                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                  {/* Toast notifications */}
                  {toast && <Toast.Provider duration={3000} >
                    <Toast.Root className='bg-slate-100 dark:bg-zinc-700 dark:text-orange-400 rounded-md border-2 border-slate-400 dark:border-orange-400 p-3 data-[state=open]:animate-slideFromRight' open={toast ? true : false} onOpenChange={open => setToast(null)}>
                      <Toast.Close asChild><Cross1Icon callback={() => setToast(null)} className='float-right cursor-pointer duration-200 dark:text-orange-400 hover:scale-125' /></Toast.Close>
                      <Toast.Title >{toast.title}</Toast.Title>
                      <Toast.Description>{toast.description}</Toast.Description>
                    </Toast.Root>

                    <Toast.Viewport className='fixed top-16 right-6 z-40' />
                  </Toast.Provider>}
                  <Footer />
                </div>
              </toastNotificationContext.Provider>
            </userAuthContext.Provider>
          </PageNavContext.Provider>
        </LangContext.Provider>
      </servURLContext.Provider>
    </UserContext.Provider>
  );
}

export default App;