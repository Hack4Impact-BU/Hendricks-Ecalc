/*
    This page is only accessible to admin users. 
    It displays a table of all devices donated to the organization, 
    including the donor's name, device type, model, weight, condition, manufacturer, serial number, date donated, and various material breakdowns. 
    The table allows for filtering and pagination.
Change the email domain in "setIsAdmin(session?.user?.email?.endsWith('@gmail.com') || false);" on line 166 to whichever domain you want to be admin.
*/
import {useState, useEffect} from 'react';
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import {useReactTable, ColumnDef, getCoreRowModel, flexRender, getFilteredRowModel, VisibilityState, getPaginationRowModel} from '@tanstack/react-table'

import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'

interface DevicesQuery{
    name: string;
    device_id: number;
    device_type: string;
    device_model: string;
    weight: number;
    device_condition: string;
    manufacturer: string;
    serial_number: string;
    serial_number_image_path: string;
    verified: boolean;
    date_donated: string;
    ferrous_metals: number;
    aluminum: number;
    copper: number;
    other_metals: number;
    plastics: number;
    pcb: number;
    flat_panel_display_module: number;
    crt_glass_and_lead: number;
    batteries: number;
    co2_emissions: number;
}

// This is the column visibility configuration for different view filters
type ViewKey = "All" | "Donors" | "Devices" | "Ewaste";
const columnVisibilityConfigs: Record<ViewKey, VisibilityState> = {
    All: {
        name: true,
        device_id: true,
        device_type: true,
        device_model: true,
        weight: true,
        device_condition: true,
        manufacturer: true,
        serial_number: true,
        serial_number_image_path: true,
        verified: true,
        date_donated: true,
        ferrous_metals: true,
        aluminum: true,
        copper: true,
        other_metals: true,
        plastics: true,
        pcb: true,
        flat_panel_display_module: true,
        crt_glass_and_lead: true,
        batteries: true,
        co2_emissions: true
    },
    Donors: {
        name: true,
        device_id: false,
        device_type: false,
        device_model: false,
        weight: false,
        device_condition: false,
        manufacturer: false,
        serial_number: false,
        serial_number_image_path: false,
        verified: false,
        date_donated: false,
        ferrous_metals: false,
        aluminum: false,
        copper: false,
        other_metals: false,
        plastics: false,
        pcb: false,
        flat_panel_display_module: false,
        crt_glass_and_lead: false,
        batteries: false,
        co2_emissions: false
    },
    Devices: {
        name: false,
        device_id: true,
        device_type: true,
        device_model: true,
        weight: true,
        device_condition: true,
        manufacturer: true,
        serial_number: true,
        serial_number_image_path: true,
        verified: true,
        date_donated: true,
        ferrous_metals: false,
        aluminum: false,
        copper: false,
        other_metals: false,
        plastics: false,
        pcb: false,
        flat_panel_display_module: false,
        crt_glass_and_lead: false,
        batteries: false,
        co2_emissions: false
    },
    Ewaste: {
        name: true,
        device_id: true,
        device_type: false,
        device_model: false,
        weight: false,
        device_condition: false,
        manufacturer: false,
        serial_number: false,
        serial_number_image_path: false,
        verified: false,
        date_donated: false,
        ferrous_metals: true,
        aluminum: true,
        copper: true,
        other_metals: true,
        plastics: true,
        pcb: true,
        flat_panel_display_module: true,
        crt_glass_and_lead: true,
        batteries: true,
        co2_emissions: true
    }
 };

function AdminPage() {
    const [devices, setDevices] = useState<DevicesQuery[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(true);
    const [view, setView] = useState<string>('All');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(columnVisibilityConfigs.All);
    const navigate = useNavigate();

    // checking for existing user session
    useEffect(() => {
        async function checkUser(user: User) {
            const { data: rawData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError || !rawData) {
                console.error("Profile lookup failed", userError);
                navigate("/login");
                return;
            }
            
            const userData = rawData as Profile;
            if (userData.two_fa_verified === false) {
                navigate("/login");
            }
        }
        // Check if the user is logged in
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/");
            } else {
                checkUser(session.user)
            }
            // Check if the user is an admin
            setIsAdmin(session?.user?.email?.endsWith('@hendricks-foundation.org') || false); // Change this to your admin email domain
            if (!isAdmin) {
                navigate("/");
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate, isAdmin]);

    //fetching devices data from supabase database
    useEffect(()=>{
        async function fetchData() {
            const { data, error } = await supabase
                .from('devices')
                .select('device_type, model, device_id, weight, device_condition, manufacturer, serial_number, serial_number_image_path, verified, date_donated, ferrous_metals, aluminum, copper, other_metals, plastics, pcb, flat_panel_display_module, crt_glass_and_lead, batteries, co2_emissions, profiles (first_name, last_name)')
            if (error) {
                console.error("Error fetching devices:", error.message);
            } else {
                console.log("Devices fetched successfully:", data);

                //flattening the data and formatting it to be displayed in the table
                const formattedData = data.map((device) => {
                    const profile = device.profiles as unknown as { first_name: string; last_name: string };
                    const date = new Date(String(device.date_donated));
                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        timeZone: 'UTC'
                    });
                    return (
                        {
                            name: `${profile.first_name} ${profile.last_name}`,
                            device_id: device.device_id,
                            device_type: device.device_type,
                            device_model: device.model,
                            weight: device.weight,
                            device_condition: device.device_condition,
                            manufacturer: device.manufacturer,
                            serial_number: device.serial_number,
                            serial_number_image_path: device.serial_number_image_path,
                            verified: device.verified,
                            date_donated: String(formattedDate),
                            ferrous_metals: device.ferrous_metals,
                            aluminum: device.aluminum,
                            copper: device.copper,
                            other_metals: device.other_metals,
                            plastics: device.plastics,
                            pcb: device.pcb,
                            flat_panel_display_module: device.flat_panel_display_module,
                            crt_glass_and_lead: device.crt_glass_and_lead,
                            batteries: device.batteries,
                            co2_emissions: device.co2_emissions
                        }
                    )
                }) ?? [];
                setDevices(formattedData);
                console.log('Devices', devices);
            }
        }
        fetchData();
    },[]);

    //columns definition for tanstack table
    // add more accesor keys here if you want to display more columns/data, just follow the template.
    const columns: ColumnDef<DevicesQuery>[] = [
        { accessorKey: "name", header: "Full Name", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_id", header: "Device ID", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_type", header: "Device Type", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_model", header: "Model", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "weight", header: "Weight (lbs)", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_condition", header: "Condition", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "manufacturer", header: "Manufacturer", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "serial_number", header: "Serial Number", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "serial_number_image_path", header: "Serial Number Path", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "verified", header: "Verified", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "date_donated", header: "Date Donated", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "ferrous_metals", header: "Ferrous Metals", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "aluminum", header: "Aluminum", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "copper", header: "Copper", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "other_metals", header: "Other Metals", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "plastics", header: "Plastics", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "pcb", header: "PCB", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "flat_panel_display_module", header: "Flat Panel Display Module", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "crt_glass_and_lead", header: "CRT Glass and Lead", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "batteries", header: "Batteries", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "co2_emissions", header: "CO2 Emissions", cell: (props) => <p>{String(props.getValue())}</p> },
    ];

    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10});

    //admin table react-table instance declaration
    const adminTable = useReactTable({
        state: {
            columnVisibility,
            pagination
        },
        data: devices,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: 'includesString'
    });

    function handleViewChange(view: ViewKey) {
        setView(view);
        setColumnVisibility(columnVisibilityConfigs[view]);
    }
    
    return (
        <>
            {/* This is the main container for the Admin Page */}
            <div className='flex flex-col justify-center rounded-4xl bg-white border border-gray-300 m-4 h-[85vh] p-8'>
                {/* This container holds the filters */}
                <div className="w-full mx-auto flex flex-col md:flex-row gap-2 mt-0">
                    {/* This table holds the toggleable the view filters*/}
                    <table className="table-auto border-collapse">
                        <tr className='[&>td>button]:w-full [&>td>button]:py-2 [&>td>button]:px-4 [&>td]:border-gray-100 [&>td>button]:cursor-pointer flex flex-col sm:flex-row gap-2 sm:gap-0'>
                            <td><button onClick={() => handleViewChange("All")} className={`border border-neutral-200 rounded-md sm:rounded-none sm:rounded-l-md ${view === "All" ? "bg-blue-200 text-blue-500" : "bg-gray-100 text-black"}`}>All</button></td>
                            <td><button onClick={() => handleViewChange("Donors")} className={`border border-l-0 border-neutral-200 rounded-md sm:rounded-none ${view === "Donors" ? "bg-blue-200 text-blue-500":"bg-gray-100 text-black"}`}>Donors</button></td>
                            <td><button onClick={() => handleViewChange("Devices")} className={`border border-l-0 border-neutral-200 rounded-md sm:rounded-none ${view === "Devices" ? "bg-blue-200 text-blue-500":"bg-gray-100 text-black"}`}>Devices</button></td>
                            <td><button onClick={() => handleViewChange("Ewaste")} className={`border border-l-0 border-neutral-200 rounded-md sm:rounded-none sm:rounded-r-md ${view === "Ewaste" ? "bg-blue-200 text-blue-500":"bg-gray-100 text-black"}`}>Ewaste</button></td>
                        </tr>
                    </table>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={e => adminTable.setGlobalFilter(String(e.target.value))}
                        className="border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white w-full"
                    />
                </div>
                {/* This container holds the actual admin table */}
                <div className='flex overflow-auto w-full mx-auto border border-gray-300 rounded-xl h-[60vh] mb-[2vh] mt-8'>
                    <table className="table-auto border-collapse rounded-xl border-neutral-200 bg-white w-full">
                        <thead>
                            {adminTable.getHeaderGroups().map(headerGroup => 
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        header => 
                                        <th key={header.id} className='border-b-[0.5px] border-neutral-200 whitespace-nowrap w-auto px-4 py-2 text-left'>
                                            {String(header.column.columnDef.header)}
                                        </th>
                                    )}
                                </tr>
                            )}
                            
                        </thead>
                        <tbody>
                            {adminTable.getRowModel().rows.map(row => 
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => 
                                        <td key={cell.id} className='border-b-[0.5px] border-neutral-200 whitespace-nowrap w-auto px-4 py-2 text-left text-gray-800'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    )}
                                </tr>
                            )}                        
                        </tbody>
                    </table>              
                </div>

                {/* Pagination Buttons for Admin Table*/}
                <div className='flex justify-center gap-10'>
                    <button className='text-xl text-gray-500 hover:text-black cursor-pointer' onClick={() => adminTable.firstPage()} disabled={!adminTable.getCanPreviousPage()}>
                        {'<<'}
                    </button>
                    <button className='text-xl text-gray-500 hover:text-black cursor-pointer' onClick={() => adminTable.previousPage()} disabled={!adminTable.getCanPreviousPage()}>
                        {'<'}
                    </button>
                    <button className='text-xl text-gray-500 hover:text-black cursor-pointer' onClick={() => adminTable.nextPage()} disabled={!adminTable.getCanNextPage()}>
                        {'>'}
                    </button>
                    <button className='text-xl text-gray-500 hover:text-black cursor-pointer' onClick={() => adminTable.lastPage()} disabled={!adminTable.getCanNextPage()}>
                        {'>>'}
                    </button>
                </div>
            </div>
        </>
    )
}


export default AdminPage;