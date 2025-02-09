import {useState, useEffect} from 'react'
import supabase from '../utils/supabase'
import {useNavigate} from 'react-router-dom'
// interface for DeviceInfo values
interface DeviceInfo { 
    device: string;
    manufacturer: string;
    deviceCondition: string;
    weight: string;
}

function DeviceInfoSubmission() {
    // state to store and update device info using DeviceInfo objects in an array
    const [devices, setDevices] = useState<DeviceInfo[]>([{
        device: '',
        manufacturer: '',
        deviceCondition: '',
        weight: ''
    }]);
    const navigate = useNavigate(); // hook to navigate to different pages

    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
          if (!session) {
            navigate("/welcome");
          }
        });
      
        return () => authListener.subscription.unsubscribe(); //clean up
     }, [navigate]);

    // handles submission of device(s) info to supabase
    const handleNext = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        for (let i = 0; i < devices.length; i++) {
            console.log(devices[i]);
        }
    }

    // adds more devices when "+ Add more devices" is clicked
    const addDevice = async (event: React.MouseEvent<HTMLAnchorElement>): Promise<void> => {
        setDevices([...devices, { device: '', manufacturer: '', deviceCondition: '', weight: '' }]);
    }

    // function that updates device info values in devices array according to user input
    const handleFormValueChange = (index: number, field: keyof DeviceInfo, value: string ) => {
        const newDevices = [...devices];
        if (field === 'weight') {
            newDevices[index][field] = String(value);
        } else {
            newDevices[index][field] = value;
        }
        setDevices(newDevices);
    };

    return (
        <>
            <div className='flex justify-center flex-col items-center text-center'>
                <div className="flex flex-col gap-2 mb-4">
                    <h1 className="text-2xl">Details</h1>
                    <p>Enter device details below</p>
                </div>
                <div className="flex flex-col w-1/3 h-auto p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100 gap-[2vh]">
                    {/* using map so multiple devices can be added*/}
                    {devices.map((device, index) => (
                        <div className="p-10 border border-gray-300 rounded-md bg-opacity-10 bg-gray-50 shadow-md">
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">Device:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'device', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Devices</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">Manufacturer:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'manufacturer', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Manufacturer</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">Device Condition:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'deviceCondition', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Device Condition</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">Weight(lbs):</label>
                                <input type="number" placeholder="Value" onChange={e => handleFormValueChange(index, 'weight', e.target.value)} className="w-full border border-gray-300 rounded-md pl-3 p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"/>
                            </div>
                        </div>
                    ))}
                    <a onClick={addDevice} className="self-end bg-none hover:underline cursor-pointer">+ Add more devices</a>
                </div>
                <button onClick={handleNext}className="mt-5 border p-2 w-1/4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Next</button>
            </div>
        </>
    );
}

export default DeviceInfoSubmission;

