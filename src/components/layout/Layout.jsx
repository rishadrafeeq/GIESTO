import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/** Wraps every page with header + footer */
export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
