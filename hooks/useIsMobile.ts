import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint: number = 1024): boolean => {
    // Initialize with the current window width
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        window.addEventListener('resize', handleResize);
        
        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;
