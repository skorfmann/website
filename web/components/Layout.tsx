import React, { ReactElement } from "react"
import Head from "next/head"
import Bell from "heroicons/react/outline/Bell"
import X from "heroicons/react/outline/X"
import Menu from "heroicons/react/outline/Menu"
import { useState } from 'react'
import { Transition } from '@headlessui/react'


const Layout = ({ children }): ReactElement => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
  <>
    <Head>
      <title>cdk.dev</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>

    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                skorfmann.com
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <a href="/new-post" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  New Post
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <Bell/>
              </button>


              <div className="ml-3 relative">
                <div>
                  <button onClick={ () => setIsProfileOpen(!isProfileOpen) } className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu" aria-haspopup="true">
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                  </button>
                </div>

                <Transition
                  show={isProfileOpen}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75 transform"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95">
                  { ref => <div ref={ref} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      Your Profile
                    </a>

                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      Sign out
                    </a>
                  </div> }
                </Transition>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open main menu</span>
                <Menu className={isMobileMenuOpen ? 'hidden' : 'block h-6 w-6'}/>
                <X className={isMobileMenuOpen ? 'block h-6 w-6' : 'hidden'}/>
              </button>
            </div>
          </div>
        </div>

        <div className={isMobileMenuOpen ? "block sm:hidden" : "hidden sm:hidden"}>
          <div className="pt-2 pb-3 space-y-1">
            <a href="/new-post" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              New Post
            </a>
            <a href="/new-post" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              New Post
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Tom Cook</div>
                <div className="text-sm font-medium text-gray-500">tom@example.com</div>
              </div>
              <button className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6"/>
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <a href="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              { children }
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
)}
export default Layout;
