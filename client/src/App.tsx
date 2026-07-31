import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__brand">
          Image Library
        </Link>
        {/* TODO(favorites): a link/count to a favorites view could live here. */}
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
