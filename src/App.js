import React from 'react';
import { DarkModeProvider } from './components/DarkModeContext';
import Header from './components/Header';
import './App.css';
import Body from "./components/Body";

function App() {
    return (
        <DarkModeProvider>
            <div className="App">
                <header className="App-header">
                    <Header />
                </header>
                <div className="App_body">
                    <Body />
                </div>
            </div>
        </DarkModeProvider>
    );
}

export default App;
