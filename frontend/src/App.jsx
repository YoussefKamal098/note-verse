import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {useGlobalSettings} from './contexts/GlobalSettingsContext';
import {useTheme} from './contexts/ThemeContext';
import GlobalContextProvider from './contexts/GlobalContext';
import {SocketProvider} from '@/contexts/SocketContext';
import AppRoutes from './routes/AppRoutes';

function App() {
    const {theme} = useTheme();
    const {appRef} = useGlobalSettings();

    return (
        <div className="App" ref={appRef} data-theme={theme}>
            <GlobalContextProvider>
                <SocketProvider>
                    <Router>
                        <AppRoutes/>
                    </Router>
                </SocketProvider>
            </GlobalContextProvider>
        </div>
    );
}

export default App;
