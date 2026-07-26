import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { ChatProvider } from "./feature/chat/context/ChatContext";
import { ChatModal } from "./feature/chat/components/ChatModal";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <ChatProvider>
                <AppRoutes />
                <ChatModal />
            </ChatProvider>
        </BrowserRouter>
    );
}

export default App;