import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";

function App() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Menu />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
