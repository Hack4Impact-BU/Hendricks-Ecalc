import { calculateCO2Emissions, calculateMaterialComposition } from '../utils/ewasteCalculations';
import { DeviceInfo } from './deviceInfoSubmission';
import { useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import supabase from '../utils/supabase';
import { useEffect, useState } from 'react';
import { getQuarterlyData, getOneYearMonthlyData, getFiveYearData, getAllTimeData } from '../utils/lineChartUtils';
import { useMediaQuery } from '@mui/material';



function ResultsPage() {
    const location = useLocation();
    const devices_from_submission = location.state?.devices as DeviceInfo[] || [];

    const [userDevices, setUserDevices] = useState<any[]>([]);

    const isSmallScreen = useMediaQuery('(max-width: 1000px)');


    //Line Chart Data
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState('Quarter');

    useEffect(() => {
        const fetchUserDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser(); // Get current user

            if (!user) {
                console.error("User not authenticated");
                return;
            }

            // Fetch past donations ordered by `date_donated`
            // from oldest to newest
            const { data, error } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', user.id)
                .order('date_donated', { ascending: true });

            if (error) {
                console.error("Error fetching past submissions:", error.message);
            } else {
                setUserDevices(data || []);
            }
        };
        fetchUserDevices();
    }, []);


    useEffect(() => {
        if (userDevices.length === 0) return;

        //set line chart data
        if (selectedRange === 'Quarter') {
            setLineChartData(getQuarterlyData(userDevices));
        } else if (selectedRange === '1 Year') {
            setLineChartData(getOneYearMonthlyData(userDevices));
        } else if (selectedRange === '5 Years') {
            setLineChartData(getFiveYearData(userDevices));
        } else if (selectedRange === 'All Time') {
            setLineChartData(getAllTimeData(userDevices));
        }
    }, [userDevices, selectedRange]);

    const totalMaterials = devices_from_submission.reduce((acc, device) => {
        const materials = calculateMaterialComposition(device);
        return {
            ferrousMetal: acc.ferrousMetal + materials.ferrousMetal,
            aluminum: acc.aluminum + materials.aluminum,
            copper: acc.copper + materials.copper,
            otherMetals: acc.otherMetals + materials.otherMetals,
            plastic: acc.plastic + materials.plastic,
            battery: acc.battery + materials.battery,
            co2Emissions: acc.co2Emissions + calculateCO2Emissions(device),

            pcb: acc.pcb + materials.pcb,
            flatPanelDisplayModule: acc.flatPanelDisplayModule + materials.flatPanelDisplayModule,
            crtGlassAndLead: acc.crtGlassAndLead + materials.crtGlassAndLead,
        };
    }, {
        ferrousMetal: 0,
        aluminum: 0,
        copper: 0,
        otherMetals: 0,
        plastic: 0,
        battery: 0,
        co2Emissions: 0,


        pcb: 0,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
    });

    //Pie chart data
    const pieChartData = [
        { id: 0, value: totalMaterials.ferrousMetal + totalMaterials.aluminum + totalMaterials.copper + totalMaterials.otherMetals, label: "Metals", color: "#6B4226" },
        { id: 1, value: totalMaterials.plastic, label: "Plastics", color: "#15803D" },
        { id: 2, value: totalMaterials.co2Emissions, label: "CO2 Emissions", color: "#A7D7A8" }
    ];

    const totalSum = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="flex flex-col items-center justify-center p-5 sm:p-10">

            <div className='bg-white/40 backdrop-blur-md w-[100%] sm:w-[80%] max-w-[1200px] rounded-2xl p-6 flex flex-col items-center justify-center'>
                <div className="flex flex-col w-full max-w-5xl md:flex-row md:justify-between md:gap-2 mb-8">

                    {/* Left side - Title & Description */}
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-10 w-full md:w-1/2 max-w-md shadow-md mb-8 md:mb-0">
                        <h1 className="text-4xl font-bold font-bitter text-white drop-shadow mb-2 text-center">Results</h1>
                        <hr className="border-white/80 mb-4" />
                        <p className="text-md text-black">
                            Here is where a description of the results is displayed!
                        </p>
                    </div>

                    {/* Right side - Material Composition List */}
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-10 w-full md:w-1/2 max-w-md shadow-md text-md text-black space-y-2">
                        {/* <h2 className="text-xl font-bold">Material Breakdown</h2> */}
                        <p>Ferrous Metals: {totalMaterials.ferrousMetal} lbs</p>
                        <p>Aluminum: {totalMaterials.aluminum} lbs</p>
                        <p>Copper: {totalMaterials.copper} lbs</p>
                        <p>Other Metals: {totalMaterials.otherMetals} lbs</p>
                        <p>Plastic: {totalMaterials.plastic} lbs</p>
                        <p>Batteries: {totalMaterials.battery} lbs</p>
                        <p>CO2 Emissions: {totalMaterials.co2Emissions} lbs</p>
                        <p>PCB: {totalMaterials.pcb} lbs</p>
                        <p>Flat Panel Display Module: {totalMaterials.flatPanelDisplayModule} lbs</p>
                        <p>CRT Glass and Lead: {totalMaterials.crtGlassAndLead} lbs</p>

                    </div>
                </div>

                <div className="w-full max-w-5xl bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-md mb-8 ">

                    <h2 className="block font-semibold mb-4">Donation Breakdown Summary</h2>

                    <div className='w-full flex flex-col justify-center'>
                        <Box
                            sx={{
                                width: '90%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >

                            {/* PieChart */}
                            <PieChart
                                height={350}
                                margin={{ top: 20, bottom: 60, left: 20, right: 20 }}
                                series={[
                                    {
                                        data: pieChartData,
                                        innerRadius: 80,
                                        arcLabel: (params) => `${((params.value / totalSum) * 100).toFixed(0)}%`,
                                        arcLabelMinAngle: 20,
                                    },
                                ]}
                                skipAnimation={true}
                                slotProps={{
                                    legend: {
                                        direction: isSmallScreen ? 'row' : 'column',
                                        position: isSmallScreen
                                            ? { vertical: 'bottom', horizontal: 'middle' }
                                            : { vertical: 'middle', horizontal: 'right' },
                                        itemMarkWidth: 15,
                                        itemMarkHeight: 15,
                                        markGap: 6,
                                        itemGap: 12,
                                        labelStyle: {
                                            fontSize: 16,
                                            fontWeight: 500,
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </div>

                </div>


                <div className="w-full max-w-5xl bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-md mb-8 relative">

                    {/* Dropdown remains unchanged */}
                    <div className="absolute top-4 right-4 z-10">
                        <select
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="text-gray-800 font-medium px-5 py-1 rounded-md shadow-sm bg-white/50 focus:outline-none focus:ring-1 focus:ring-gray-400 text-xs sm:text-sm"
                        >
                            <option value="Quarter">Quarter</option>
                            <option value="1 Year">1 Year</option>
                            <option value="5 Years">5 Years</option>
                            <option value="All Time">All Time</option>
                        </select>
                    </div>

                    <h2 className="font-semibold">Total Emissions</h2>
                    <Box
                        sx={{
                            width: '90%',
                            margin: '0 auto',
                            position: 'relative',
                        }}
                    >
                        <div className="relative w-full">

                            {/* LineChart will fill the width of its container */}
                            <LineChart
                                height={400}
                                series={[
                                    { data: lineChartData.map((d) => d.metals), label: 'Metals', color: "#6B4226" },
                                    { data: lineChartData.map((d) => d.plastics), label: 'Plastics', color: "#15803D" },
                                    { data: lineChartData.map((d) => d.co2), label: 'CO2 Emissions', color: "#A7D7A8" },
                                ]}
                                xAxis={[{ data: lineChartData.map((d) => d.label), scaleType: 'point' }]}
                                yAxis={[{ scaleType: 'linear' }]}
                                grid={{ vertical: true, horizontal: true }}
                                slotProps={{
                                    legend: { hidden: true },
                                }}
                                sx={{
                                    width: '100%',
                                    marginBottom: '1rem',
                                }}
                            />

                            {/* Custom legend pinned to bottom-left of the chart */}
                            <div
                                className="absolute justify-center sm:left-12 bottom-1 flex gap-2 sm:gap-6 items-center text-xs sm:text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#6B4226]" />
                                    <span className=" text-[#6B4226] font-semibold">Metals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#15803D]" />
                                    <span className=" text-[#15803D] font-semibold">Plastics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#A7D7A8]" />
                                    <span className=" text-[#A7D7A8] font-semibold">CO2 Emissions</span>
                                </div>
                            </div>
                        </div>
                    </Box>



                </div>


                {/* Next Button */}
                <Link to="/thank-you" className="bg-[#FFE017] block w-1/4 text-center shadow-md text-white font-bold text-sm sm:text-lg py-1 px-2 sm:py-2 sm:px-5 md:px-10 rounded-full transition duration-200 cursor-pointer hover:brightness-105 mt-5">
                    NEXT
                </Link>
            </div >
        </div >
    );
}

export default ResultsPage;
