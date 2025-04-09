import { useState } from 'react';
import './App.css';

function App() {
    // State for count (already exists)
    const [count, setCount] = useState(0);

    // State to store the altitude and azimuth
    const [altitude, setAltitude] = useState<string>('');
    const [azimuth, setAzimuth] = useState<string>('');

    const [stepaltitude, setStepAltitude] = useState<string>('');
    const [stepazimuth, setStepAzimuth] = useState<string>('');
    // State for the planet name input
    const [planet, setPlanet] = useState<string>('');
    const [step, setStep] = useState<string>('');

    // Function to handle the planet input change
    const handlePlanetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlanet(event.target.value);
    };

    // Function to fetch astronomy data from API
    const fetchData = async () => {
        if (!planet) {
            alert("Please enter a planet name.");
            return;
        }

        const url = `https://api.astronomyapi.com/api/v2/bodies/positions/${planet}?latitude=48.16272999781749&longitude=16.33542943924851&elevation=200&from_date=2025-04-07&to_date=2025-04-07&time=22%3A00%3A00`;

        const headers = new Headers({
            'Authorization': 'Basic ZDhlZTJhNTAtNDRlNC00MDllLWFlN2MtY2VlYTUzNmFhYTFmOjI3N2U2ZmRmOGQzNWMxZTViNTg2MWI5ODJkNTFhM2U5MTA1NmQ4NmUxZTJhYWE4Zjc5MTAwODI2NGUxY2MxNDZjNzk4Y2VhOGViMDlhZjU5NzYxNjQ5NTYzOWIwNDE0MTdkMTBlYjA0NjU1NWEzNzNlMzNhYjU1NDBjM2ZlN2I1YWNkY2IwNDJjODM3MjQxNzQ2NzczMWU1MDM0MDdlMzkwYmY1Y2Q1OTE2YjI5NjVhMGJkZTFjY2Q1NmE3NWQ2YjAxZDU3ZjYzNTM4NTE5NzUzNjM4YTI4YTU4NjZhYmNh'
        });

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();

                // Extract altitude and azimuth from the response
                const altitude = data.data.table.rows[0].cells[0].position.horizontal.altitude.degrees;
                const azimuth = data.data.table.rows[0].cells[0].position.horizontal.azimuth.degrees;

                const stepsAltitude = 100 * altitude;
                const stepsAzimuth = 100 * azimuth;

                setStepAltitude(stepsAltitude);
                setStepAzimuth(stepsAzimuth);

                // Set the altitude and azimuth to the state
                setAltitude(altitude);
                setAzimuth(azimuth);
            } else {
                console.error('Error fetching data:', response.status, response.statusText);
                setAltitude('');
                setAzimuth('');
            }
        } catch (error) {
            console.error('Request failed', error);
            setAltitude('');
            setAzimuth('');
        }
    };

    // Function to generate URL based on direction
    const generateDirectionLink = (direction: string,steps: string) => {
        const baseUrl = "http://192.168.0.5";
        switch (direction) {
            case "up":
                return `${baseUrl}/move1=stepsForward&steps=${steps}`;
            case "down":
                return `${baseUrl}/move1=stepsBackward&steps=${steps}`;
            case "left":
                return `${baseUrl}/move2=stepsForward&steps=${steps}`;
            case "right":
                return `${baseUrl}/move2=stepsBackward&steps=${steps}`;
            default:
                return baseUrl;
        }
    };

    // Function to send direction request without navigating
    const sendDirectionRequest = async (direction: string, steps: string = step) => {
        const directionUrl = generateDirectionLink(direction, steps);
        try {
            const response = await fetch(directionUrl);

            if (response.ok) {
                console.log(`Direction ${direction} sent successfully.`);
            } else {
                console.error(`Error sending direction: ${direction}`, response.statusText);
            }
        } catch (error) {
            console.error('Error sending direction request:', error);
        }
    };

    const handleChange = (event) => {
        setStep(event.target.value);
    };

    const autoSetup = () =>{

        sendDirectionRequest("up", stepaltitude);
        sendDirectionRequest("right", stepazimuth);

    }

    return (
        <>
            <div>
                {/* Video Feed */}
                <img src={"http://192.168.0.2:5000/video_feed"} alt="Video Feed" />
            </div>
            <h1>SpaceY</h1>
            <div className="card">
                {/* Contributors */}
                <p>
                    Contributors: Amanpreet Kumar, Navdeep Singh, Paul Kreiner, Roman Schueller, Spudil Viktor
                </p>
            </div>

            {/* Planet Input */}
            <div style={{ paddingBottom: '20px' }}>
                <label htmlFor="planet">Enter Planet Name: </label>
                <input
                    type="text"
                    id="planet"
                    value={planet}
                    onChange={handlePlanetChange}
                    placeholder="e.g., mars, venus"
                />
            </div>

            {/* Button to fetch data from the API */}
            <div>
                <button onClick={fetchData}>Fetch Astronomy Data</button>
            </div>

            {/* Display the altitude and azimuth */}
            <div>
                <h2>Astronomy Data</h2>
                <p><strong>Altitude:</strong> {altitude}</p>
                <p><strong>Azimuth:</strong> {azimuth}</p>
            </div>

            <div>
                <button onClick={() => autoSetup() }>Auto setup</button>
            </div>

            <div>
                <input
                    type="number"
                    value={step}
                    onChange={handleChange}
                 />
            </div>

            {/* Directional buttons with links */}
            <div className="direction-buttons">
                <button className="up" onClick={() => sendDirectionRequest("up")}>Up</button>
                <div className="left-right-buttons">
                    <button className="left" onClick={() => sendDirectionRequest("left")}>Left</button>
                    <button className="right" onClick={() => sendDirectionRequest("right")}>Right</button>
                </div>
                <button className="down" onClick={() => sendDirectionRequest("down")}>Down</button>
            </div>

        </>
    );
}

export default App;
