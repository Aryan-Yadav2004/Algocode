import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Welcome to AlgoCode</h1>
                    <p className="py-6">
                        Master algorithms and data structures with our curated collection of problems.
                        Sharpen your coding skills and prepare for your next interview.
                    </p>
                    <button onClick={() => navigate('/problems')} className="btn btn-primary">Get Started</button>
                </div>
            </div>
        </div>
    );
}

export default Home;
