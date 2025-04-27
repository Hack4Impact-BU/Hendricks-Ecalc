import { useEffect } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from 'react-router-dom'


export default function SerialNumInput() {
    // const [serialNum, setSerialNum] = useState<string>('');
    // const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/login");
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);

    return (
        <h3>Work in Progress</h3>
    );

}
