import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SideBar from './components/SideBar';

import ProblemDescription from './pages/Description/ProblemDescription';
import ProblemList from './pages/ProblemList/ProblemList';
import CreateProblem from './pages/CreateProblem/CreateProblem';
import Home from './pages/Home/Home';

function App() {



  return (
    <div className='h-[100vh] overflow-hidden'>
      <Navbar />
      <SideBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/problems' element={<ProblemList />} />
        <Route path='/problems/:id' element={<ProblemDescription />} />
        <Route path='/problem/create' element={<CreateProblem />} />
      </Routes>
    </div>
  );
}

export default App;
