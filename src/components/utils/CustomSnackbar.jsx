import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

/**
 * Reusable Snackbar Component
 * 
 * @param {boolean} open - Controls visibility of snackbar
 * @param {function} onClose - Function to call when snackbar closes
 * @param {string} message - Message to display
 * @param {string} severity - Type of alert: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Auto-hide duration in milliseconds (default: 6000)
 * @param {string} position - Position of snackbar (default: { vertical: 'bottom', horizontal: 'right' })
 */

function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
}

const CustomSnackbar = ({
    open,
    onClose,
    message,
    severity = 'info',
    duration = 6000,
    vertical = 'bottom',
    horizontal = 'right'
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={onClose}
            anchorOrigin={{ vertical, horizontal }}
            TransitionComponent={SlideTransition}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    width: '100%',
                    minWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '& .MuiAlert-icon': {
                        fontSize: '24px',
                    },
                    '& .MuiAlert-message': {
                        fontSize: '14px',
                        fontWeight: 500,
                    },
                    // Custom colors for dark theme
                    ...(severity === 'success' && {
                        backgroundColor: '#4caf50',
                        color: '#ffffff',
                    }),
                    ...(severity === 'error' && {
                        backgroundColor: '#f44336',
                        color: '#ffffff',
                    }),
                    ...(severity === 'warning' && {
                        backgroundColor: '#ff9800',
                        color: '#ffffff',
                    }),
                    ...(severity === 'info' && {
                        backgroundColor: '#2196f3',
                        color: '#ffffff',
                    }),
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default CustomSnackbar;