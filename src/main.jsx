import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CreatorHub from './CreatorHub.jsx'
import { AuthProvider } from './context'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <CreatorHub />
        </AuthProvider>
    </StrictMode>,
)
