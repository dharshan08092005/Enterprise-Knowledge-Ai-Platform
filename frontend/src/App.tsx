import './App.css'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './lib/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
