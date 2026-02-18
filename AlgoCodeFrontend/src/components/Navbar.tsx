import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function Navbar() {
    return (
        <div className="navbar bg-base-100 border-b-2 h-[55px]">
            <div className="navbar-start">
                <div className="dropdown">
                    <div role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </div>
                </div>
            </div>
            <div className="navbar-center">
                <a className="btn btn-ghost text-xl" href='/problems'>AlgoCode</a>
            </div>
            <div className="navbar-end">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </div>
    );
}

export default Navbar;
