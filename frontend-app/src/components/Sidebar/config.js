import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@mui/material';
import { MdAccountBalance } from "react-icons/md";
import { IoIosAnalytics } from "react-icons/io";
import { m } from 'framer-motion';
import { BiCategoryAlt } from "react-icons/bi";

const config = [
    {
        title: 'Dashboard',
        path: '/',
        Icon: HomeIcon,
    },
    {
        title: 'Accounts',
        Icon: MdAccountBalance,
        subLinks: [
            {
                title: "Accounts",
                path: "/accounts",
                Icon: MdAccountBalance,
            },
            {
                title: "Transactions",
                path: '/transactions',
                Icon: IoIosAnalytics
            },
            {
                title: "Categories",
                path: "/categories",
                Icon: BiCategoryAlt
            },
        ]
    },
    {
        title: 'Analytics',
        path: '/analytics',
        Icon: IoIosAnalytics
    }

];

export default config;
