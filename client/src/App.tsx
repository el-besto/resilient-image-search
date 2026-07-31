import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__brand">
          Image Library
        </Link>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
