import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { MangaDetail } from './pages/MangaDetail'
import { Reader } from './pages/Reader'
import { Navbar } from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/chapter/:id" element={<Reader />} />
        </Routes>
      </main>
      <footer className="py-8 text-center text-gray-500 border-t border-secondary mt-auto">
        <p>&copy; {new Date().getFullYear()} MangaFlow. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
