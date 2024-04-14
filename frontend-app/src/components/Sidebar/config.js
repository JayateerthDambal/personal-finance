import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@mui/material';
import { MdAccountBalance } from "react-icons/md";
import { IoIosAnalytics } from "react-icons/io";

const config = [
    {
        title: 'Dashboard',
        path: '/',
        Icon: HomeIcon,
    },
    {
        title: 'Accounts',
        path: '/accounts',
        Icon: MdAccountBalance
    },
    {
        title: 'Analytics',
        path: '/analytics',
        Icon: IoIosAnalytics
    }

];

export default config;
