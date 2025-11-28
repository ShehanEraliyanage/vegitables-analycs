import { ThemeProvider } from './contexts/ThemeContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import Dashboard from './pages/Dashboard'
import ToastNotification from './components/ToastNotification'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <div className="App">
          <ToastNotification />
          <Dashboard />
        </div>
      </FavoritesProvider>
    </ThemeProvider>
  )
}

export default App

